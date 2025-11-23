# Configuración de Google Sheets para el Sistema de Croquis

Este documento explica cómo extender tu Google Apps Script existente para soportar el sistema de croquis de asientos.

## Prerequisito

Debes tener ya configurado el Google Sheet con el script de RSVP siguiendo las instrucciones en `CONFIGURACION_GOOGLE_SHEETS.md`.

## Paso 1: Crear Nuevas Hojas en Google Sheet

1. Ve a tu Google Sheet existente "Confirmaciones de Asistencia - Boda"
2. Crea **tres nuevas hojas** (pestañas) haciendo clic en el botón `+` en la parte inferior:
   - `Layout` - Guardará la configuración del croquis
   - `Assignments` - Guardará las asignaciones de invitados a mesas
   - `GuestIDs` - Guardará los IDs únicos de cada invitado

### Configurar la hoja "GuestIDs"

En la hoja `GuestIDs`, agrega estos encabezados en la primera fila:

| A | B | C |
|---|---|---|
| ID | Nombre | Timestamp |

### Configurar la hoja "Layout"

En la hoja `Layout`, agrega estos encabezados:

| A | B |
|---|---|
| Timestamp | LayoutJSON |

### Configurar la hoja "Assignments"

En la hoja `Assignments`, agrega estos encabezados:

| A | B |
|---|---|
| Timestamp | AssignmentsJSON |

## Paso 2: Actualizar el Código de Apps Script

1. Ve a **Extensiones** > **Apps Script** en tu Google Sheet
2. **Reemplaza TODO el código existente** con el siguiente código expandido:

```javascript
// ⚠️ IMPORTANTE: Cambia este token por uno único y secreto
// Genera uno aleatorio aquí: https://www.uuidgenerator.net/
const SECRET_TOKEN = 'CAMBIA_ESTE_TOKEN_POR_UNO_ALEATORIO_123456';

// ========== FUNCIÓN PRINCIPAL PARA POST ==========
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // 🔒 Validación de token
    if (!data.token || data.token !== SECRET_TOKEN) {
      return createResponse({ result: 'error', error: 'Invalid token' });
    }

    // Determinar qué acción realizar
    const action = data.action || 'submitRSVP';

    switch (action) {
      case 'submitRSVP':
        return handleRSVPSubmission(data);
      case 'saveLayout':
        return handleSaveLayout(data);
      case 'saveAssignments':
        return handleSaveAssignments(data);
      default:
        return createResponse({ result: 'error', error: 'Unknown action' });
    }

  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return createResponse({ result: 'error', error: 'Server error' });
  }
}

// ========== FUNCIÓN PRINCIPAL PARA GET ==========
function doGet(e) {
  try {
    const action = e.parameter.action;

    switch (action) {
      case 'getGuests':
        return handleGetGuests();
      case 'getLayout':
        return handleGetLayout();
      case 'getAssignments':
        return handleGetAssignments();
      default:
        return createResponse({ result: 'error', error: 'Unknown action' });
    }

  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return createResponse({ result: 'error', error: 'Server error' });
  }
}

// ========== HANDLERS PARA RSVP (CÓDIGO ORIGINAL) ==========
function handleRSVPSubmission(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1') ||
                SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // 🔒 Validaciones
  if (!data.nombre || !data.asistencia) {
    return createResponse({ result: 'error', error: 'Missing required fields' });
  }

  if (data.nombre.length < 3 || data.nombre.length > 100) {
    return createResponse({ result: 'error', error: 'Invalid name length' });
  }

  if (data.mensaje && data.mensaje.length > 500) {
    return createResponse({ result: 'error', error: 'Message too long' });
  }

  if (data.asistencia !== 'Si' && data.asistencia !== 'No') {
    return createResponse({ result: 'error', error: 'Invalid attendance value' });
  }

  const acompanantes = parseInt(data.acompanantes) || 0;
  if (acompanantes < 0 || acompanantes > 10) {
    return createResponse({ result: 'error', error: 'Invalid number of guests' });
  }

  // Rate limiting
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60000);
  const recentRows = sheet.getDataRange().getValues();
  let recentSubmissions = 0;

  for (let i = recentRows.length - 1; i >= 1; i--) {
    const rowDate = new Date(recentRows[i][0]);
    if (rowDate > oneMinuteAgo) {
      recentSubmissions++;
      if (recentSubmissions >= 5) {
        return createResponse({ result: 'error', error: 'Rate limit exceeded' });
      }
    } else {
      break;
    }
  }

  // Sanitización
  const sanitize = (str) => {
    if (!str) return '';
    return str.toString().substring(0, 500).replace(/[<>]/g, '');
  };

  // Generar ID único para el invitado
  const guestId = generateGuestId(data.nombre);

  // Guardar ID en la hoja GuestIDs
  const guestIdSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('GuestIDs');
  if (guestIdSheet) {
    guestIdSheet.appendRow([guestId, sanitize(data.nombre), new Date().toISOString()]);
  }

  // Crear fila con los datos
  const row = [
    data.timestamp || new Date().toISOString(),
    sanitize(data.nombre),
    sanitize(data.email),
    sanitize(data.telefono),
    data.asistencia,
    acompanantes,
    sanitize(data.mensaje)
  ];

  sheet.appendRow(row);

  return createResponse({
    result: 'success',
    message: 'RSVP received',
    guestId: guestId // Retornar el ID generado
  });
}

// ========== HANDLERS PARA CROQUIS ==========

// Obtener lista de invitados con IDs
function handleGetGuests() {
  const rsvpSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1') ||
                    SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const guestIdSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('GuestIDs');

  const rsvpData = rsvpSheet.getDataRange().getValues();
  const guests = [];

  // Crear un mapa de IDs
  const idMap = new Map();
  if (guestIdSheet) {
    const idData = guestIdSheet.getDataRange().getValues();
    for (let i = 1; i < idData.length; i++) {
      idMap.set(idData[i][1], idData[i][0]); // nombre -> id
    }
  }

  // Procesar invitados (saltar header en fila 0)
  for (let i = 1; i < rsvpData.length; i++) {
    const row = rsvpData[i];
    const nombre = row[1];
    const guestId = idMap.get(nombre) || generateGuestId(nombre);

    // Solo incluir invitados que confirmaron asistencia
    if (row[4] === 'Si') {
      guests.push({
        id: guestId,
        nombre: nombre,
        email: row[2] || '',
        telefono: row[3] || '',
        asistencia: row[4],
        acompanantes: parseInt(row[5]) || 0,
        mensaje: row[6] || ''
      });
    }
  }

  return createResponse({ result: 'success', guests: guests });
}

// Guardar layout del salón
function handleSaveLayout(data) {
  if (!data.layout) {
    return createResponse({ result: 'error', error: 'No layout data provided' });
  }

  const layoutSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Layout');
  if (!layoutSheet) {
    return createResponse({ result: 'error', error: 'Layout sheet not found' });
  }

  // Guardar como JSON en la segunda columna
  const layoutJSON = JSON.stringify(data.layout);
  const timestamp = new Date().toISOString();

  // Limpiar datos anteriores y guardar nuevo layout
  if (layoutSheet.getLastRow() > 1) {
    layoutSheet.deleteRows(2, layoutSheet.getLastRow() - 1);
  }
  layoutSheet.appendRow([timestamp, layoutJSON]);

  return createResponse({ result: 'success', message: 'Layout saved' });
}

// Obtener layout del salón
function handleGetLayout() {
  const layoutSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Layout');
  if (!layoutSheet || layoutSheet.getLastRow() < 2) {
    return createResponse({ result: 'success', layout: null });
  }

  const lastRow = layoutSheet.getLastRow();
  const layoutJSON = layoutSheet.getRange(lastRow, 2).getValue();

  try {
    const layout = JSON.parse(layoutJSON);
    return createResponse({ result: 'success', layout: layout });
  } catch (error) {
    return createResponse({ result: 'error', error: 'Invalid layout data' });
  }
}

// Guardar asignaciones de invitados
function handleSaveAssignments(data) {
  if (!data.assignments) {
    return createResponse({ result: 'error', error: 'No assignments data provided' });
  }

  const assignmentsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Assignments');
  if (!assignmentsSheet) {
    return createResponse({ result: 'error', error: 'Assignments sheet not found' });
  }

  const assignmentsJSON = JSON.stringify(data.assignments);
  const timestamp = new Date().toISOString();

  // Limpiar datos anteriores y guardar nuevas asignaciones
  if (assignmentsSheet.getLastRow() > 1) {
    assignmentsSheet.deleteRows(2, assignmentsSheet.getLastRow() - 1);
  }
  assignmentsSheet.appendRow([timestamp, assignmentsJSON]);

  return createResponse({ result: 'success', message: 'Assignments saved' });
}

// Obtener asignaciones de invitados
function handleGetAssignments() {
  const assignmentsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Assignments');
  if (!assignmentsSheet || assignmentsSheet.getLastRow() < 2) {
    return createResponse({ result: 'success', assignments: [] });
  }

  const lastRow = assignmentsSheet.getLastRow();
  const assignmentsJSON = assignmentsSheet.getRange(lastRow, 2).getValue();

  try {
    const assignments = JSON.parse(assignmentsJSON);
    return createResponse({ result: 'success', assignments: assignments });
  } catch (error) {
    return createResponse({ result: 'error', error: 'Invalid assignments data' });
  }
}

// ========== UTILIDADES ==========

// Generar ID único para invitado
function generateGuestId(name) {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 10000);
  const nameHash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `guest-${nameHash}-${timestamp}-${random}`;
}

// Crear respuesta JSON
function createResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ========== FUNCIÓN DE PRUEBA ==========
function testDoPost() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toISOString(),
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        telefono: '+1234567890',
        asistencia: 'Si',
        acompanantes: '2',
        mensaje: 'Soy vegetariano',
        token: SECRET_TOKEN,
        action: 'submitRSVP'
      })
    }
  };

  const result = doPost(testData);
  Logger.log(result.getContent());
}

function testGetGuests() {
  const result = handleGetGuests();
  Logger.log(result.getContent());
}
```

3. **Guarda** el proyecto (Ctrl+S o Cmd+S)

## Paso 3: Re-desplegar el Script

1. Haz clic en **Implementar** > **Administrar implementaciones**
2. Haz clic en el ícono de lápiz ✏️ junto a tu implementación activa
3. En "Versión", selecciona **Nueva versión**
4. Haz clic en **Implementar**
5. La URL de la aplicación web seguirá siendo la misma

## Paso 4: Probar los Nuevos Endpoints

Puedes probar los endpoints directamente desde Apps Script:

1. En Apps Script, selecciona la función `testGetGuests` en el menú desplegable
2. Haz clic en **Ejecutar**
3. Verifica en los **Logs** (Ver > Registros) que retorne los invitados correctamente

## Endpoints Disponibles

### GET Endpoints (consulta de datos)

- **Obtener invitados**: `TU_SCRIPT_URL?action=getGuests`
- **Obtener layout**: `TU_SCRIPT_URL?action=getLayout`
- **Obtener asignaciones**: `TU_SCRIPT_URL?action=getAssignments`

### POST Endpoints (guardar datos)

Todos requieren el token secreto en el body:

- **Guardar RSVP**: `{action: 'submitRSVP', ...datos, token: SECRET_TOKEN}`
- **Guardar layout**: `{action: 'saveLayout', layout: {...}, token: SECRET_TOKEN}`
- **Guardar asignaciones**: `{action: 'saveAssignments', assignments: [...], token: SECRET_TOKEN}`

## Estructura de Datos

### Guest (Invitado)
```json
{
  "id": "guest-123456",
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "telefono": "+1234567890",
  "asistencia": "Si",
  "acompanantes": 2,
  "mensaje": "Soy vegetariano"
}
```

### Layout (Configuración del salón)
```json
{
  "tables": [
    {
      "id": "table-1",
      "type": "round",
      "label": "Mesa 1",
      "position": { "x": 100, "y": 100 },
      "capacity": 8,
      "rotation": 0
    }
  ],
  "elements": [
    {
      "id": "element-1",
      "type": "bar",
      "label": "Barra de bebidas",
      "position": { "x": 500, "y": 100 },
      "width": 200,
      "height": 100,
      "rotation": 0
    }
  ]
}
```

### Assignment (Asignación)
```json
{
  "guestId": "guest-123456",
  "tableId": "table-1",
  "guestName": "Juan Pérez",
  "companions": 2
}
```

## Seguridad

- **Todos los endpoints POST requieren el token secreto**
- **Los endpoints GET son públicos** pero solo retornan datos de invitados confirmados
- **Los IDs de invitados son únicos** y se generan automáticamente
- **El layout y asignaciones sobrescriben los datos anteriores** (no hay historial)

## Troubleshooting

### Los invitados no tienen IDs
- Asegúrate de haber creado la hoja "GuestIDs"
- Los IDs se generan automáticamente al confirmar asistencia
- Para invitados anteriores, el sistema genera IDs al hacer GET por primera vez

### Error "Sheet not found"
- Verifica que hayas creado las 3 hojas nuevas: Layout, Assignments, GuestIDs
- Los nombres de las hojas son sensibles a mayúsculas

### Los datos no se guardan
- Verifica que hayas re-desplegado el script con "Nueva versión"
- Revisa los logs en Apps Script (Ver > Registros) para ver errores
- Asegúrate de estar enviando el token correcto

## Próximos Pasos

Una vez configurado Google Apps Script:
1. El frontend podrá obtener la lista de invitados confirmados
2. Podrás crear y guardar el layout del salón desde el panel admin
3. Podrás asignar invitados a mesas
4. Los invitados podrán ver su mesa asignada con su ID único

¡Listo! Tu Google Sheet ahora soporta todo el sistema de croquis de asientos.
