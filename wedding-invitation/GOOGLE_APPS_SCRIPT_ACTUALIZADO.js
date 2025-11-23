// ============================================================================
// CÓDIGO ACTUALIZADO DE GOOGLE APPS SCRIPT
// Sistema de IDs Persistentes y Seguros para Invitados
// ============================================================================

// IMPORTANTE: Reemplaza estas constantes con los valores de tu proyecto
const SECRET_TOKEN = 'TU_SECRET_TOKEN_AQUI'; // Debe coincidir con VITE_FORM_SECRET_TOKEN en tu .env
const SPREADSHEET_ID = 'TU_SPREADSHEET_ID_AQUI';

// ===== FUNCIONES PRINCIPALES =====

function doGet(e) {
  const action = e.parameter.action;

  if (action === 'getGuests') {
    return handleGetGuests();
  } else if (action === 'getLayout') {
    return handleGetLayout();
  } else if (action === 'getAssignments') {
    return handleGetAssignments();
  }

  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    error: 'Acción no reconocida'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Verificar token de seguridad
    if (data.token !== SECRET_TOKEN) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Token inválido'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const action = data.action;

    if (action === 'saveLayout') {
      return handleSaveLayout(data.layout);
    } else if (action === 'saveAssignments') {
      return handleSaveAssignments(data.assignments);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Acción no reconocida'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error en doPost: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== GENERACIÓN DE IDs SEGUROS Y ESTABLES =====

/**
 * Genera un ID aleatorio seguro sin timestamps
 * Formato: guest-XXXXXXXX (8 caracteres alfanuméricos)
 */
function generateSecureGuestId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'guest-';
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

/**
 * Obtiene o crea un ID persistente para un invitado
 * @param {number} rowNumber - Número de fila en la hoja principal (2 = primera fila de datos)
 * @param {string} guestName - Nombre del invitado
 * @returns {string} - ID único y persistente
 */
function getOrCreateGuestId(rowNumber, guestName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const guestIdsSheet = ss.getSheetByName('GuestIDs') || createGuestIdsSheet(ss);

  const data = guestIdsSheet.getDataRange().getValues();

  // Buscar primero por número de fila
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === rowNumber) {
      // Verificar que el nombre coincida (protección contra reordenamiento)
      if (data[i][2] === guestName) {
        return data[i][1]; // Retornar ID existente
      } else {
        // El nombre cambió en esta fila, buscar por nombre en toda la hoja
        Logger.log(`Fila ${rowNumber}: nombre cambió de "${data[i][2]}" a "${guestName}"`);
        break;
      }
    }
  }

  // Buscar por nombre (en caso de reordenamiento)
  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === guestName) {
      // Encontrado por nombre, actualizar número de fila
      Logger.log(`Actualizando fila de "${guestName}" de ${data[i][0]} a ${rowNumber}`);
      guestIdsSheet.getRange(i + 1, 1).setValue(rowNumber);
      return data[i][1]; // Retornar ID existente
    }
  }

  // No existe, crear nuevo ID
  const newId = generateSecureGuestId();
  const newRow = [rowNumber, newId, guestName];
  guestIdsSheet.appendRow(newRow);

  Logger.log(`Nuevo ID creado: ${newId} para "${guestName}" en fila ${rowNumber}`);
  return newId;
}

/**
 * Crea la hoja GuestIDs si no existe
 */
function createGuestIdsSheet(spreadsheet) {
  const sheet = spreadsheet.insertSheet('GuestIDs');
  sheet.appendRow(['Fila', 'GuestID', 'Nombre']);
  sheet.getRange('A1:C1').setFontWeight('bold');
  sheet.setFrozenRows(1);
  return sheet;
}

// ===== HANDLERS DE INVITADOS =====

/**
 * Obtiene todos los invitados confirmados con IDs persistentes
 */
function handleGetGuests() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName('Respuestas de formulario 1'); // Ajusta el nombre de tu hoja

    if (!sheet) {
      throw new Error('Hoja de respuestas no encontrada');
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const guests = [];

    // Empezar desde la fila 2 (índice 1) porque fila 1 son headers
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 1; // Número de fila real en Google Sheets (1-indexed)

      const guest = {};

      // Mapear columnas a propiedades
      headers.forEach((header, index) => {
        const value = row[index];

        // Mapear nombres de columnas a propiedades del objeto
        if (header.includes('Nombre') || header.includes('nombre')) {
          guest.nombre = value;
        } else if (header.includes('Email') || header.includes('email') || header.includes('Correo')) {
          guest.email = value;
        } else if (header.includes('Asistencia') || header.includes('asistencia')) {
          guest.asistencia = value;
        } else if (header.includes('Acompañantes') || header.includes('acompañantes')) {
          guest.acompanantes = value || 0;
        } else if (header.includes('Mensaje') || header.includes('mensaje')) {
          guest.mensaje = value;
        }
      });

      // Solo incluir invitados que confirmaron asistencia
      if (guest.asistencia === 'Sí' || guest.asistencia === 'Si') {
        // Obtener o crear ID persistente
        guest.id = getOrCreateGuestId(rowNumber, guest.nombre);
        guests.push(guest);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      guests: guests
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error en handleGetGuests: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      guests: [],
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== HANDLERS DE LAYOUT =====

function handleSaveLayout(layout) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let layoutSheet = ss.getSheetByName('Layout');

    if (!layoutSheet) {
      layoutSheet = ss.insertSheet('Layout');
    }

    layoutSheet.clear();
    layoutSheet.appendRow(['Layout Data']);
    layoutSheet.getRange(2, 1).setValue(JSON.stringify(layout));

    Logger.log('Layout guardado correctamente');
    return ContentService.createTextOutput(JSON.stringify({
      success: true
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error en handleSaveLayout: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleGetLayout() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const layoutSheet = ss.getSheetByName('Layout');

    if (!layoutSheet) {
      Logger.log('Hoja Layout no existe, retornando layout vacío');
      return ContentService.createTextOutput(JSON.stringify({
        layout: { tables: [], elements: [] }
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = layoutSheet.getRange(2, 1).getValue();

    if (!data) {
      Logger.log('No hay datos en Layout, retornando layout vacío');
      return ContentService.createTextOutput(JSON.stringify({
        layout: { tables: [], elements: [] }
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Intentar parsear el JSON
    let layout;
    try {
      layout = JSON.parse(data);
      Logger.log('Layout parseado correctamente: ' + JSON.stringify(layout));
    } catch (parseError) {
      Logger.log('ERROR: JSON corrupto en hoja Layout: ' + parseError);
      Logger.log('Datos corruptos: ' + data.substring(0, 100));

      // Limpiar la celda corrupta
      layoutSheet.getRange(2, 1).clearContent();
      Logger.log('Celda corrupta limpiada, retornando layout vacío');

      return ContentService.createTextOutput(JSON.stringify({
        layout: { tables: [], elements: [] },
        warning: 'Layout anterior estaba corrupto y fue limpiado'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      layout: layout
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error en handleGetLayout: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      layout: { tables: [], elements: [] },
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== HANDLERS DE ASIGNACIONES =====

function handleSaveAssignments(assignments) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let assignmentsSheet = ss.getSheetByName('Assignments');

    if (!assignmentsSheet) {
      assignmentsSheet = ss.insertSheet('Assignments');
    }

    assignmentsSheet.clear();
    assignmentsSheet.appendRow(['Assignments Data']);
    assignmentsSheet.getRange(2, 1).setValue(JSON.stringify(assignments));

    Logger.log('Asignaciones guardadas correctamente: ' + assignments.length);
    return ContentService.createTextOutput(JSON.stringify({
      success: true
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error en handleSaveAssignments: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleGetAssignments() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const assignmentsSheet = ss.getSheetByName('Assignments');

    if (!assignmentsSheet) {
      return ContentService.createTextOutput(JSON.stringify({
        assignments: []
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const data = assignmentsSheet.getRange(2, 1).getValue();
    const assignments = data ? JSON.parse(data) : [];

    return ContentService.createTextOutput(JSON.stringify({
      assignments: assignments
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error en handleGetAssignments: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      assignments: [],
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== FUNCIÓN DE PRUEBA (OPCIONAL) =====

/**
 * Función de prueba para verificar que todo funciona
 * Ejecuta esto desde el editor de Apps Script para probar
 */
function testGuestIds() {
  Logger.log('=== PRUEBA DE SISTEMA DE IDs ===');

  // Simular obtención de ID para un invitado
  const id1 = getOrCreateGuestId(2, 'Juan Pérez');
  Logger.log('ID para Juan Pérez (fila 2): ' + id1);

  // Obtener el mismo ID de nuevo (debe ser idéntico)
  const id2 = getOrCreateGuestId(2, 'Juan Pérez');
  Logger.log('ID para Juan Pérez de nuevo: ' + id2);
  Logger.log('IDs coinciden: ' + (id1 === id2));

  // Probar con otro invitado
  const id3 = getOrCreateGuestId(3, 'María López');
  Logger.log('ID para María López (fila 3): ' + id3);

  Logger.log('=== PRUEBA COMPLETADA ===');
}
