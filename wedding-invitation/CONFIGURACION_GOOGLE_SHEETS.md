# Configuración de Google Sheets para el Formulario de Confirmación

## Paso 1: Crear Google Sheet

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. Nómbrala "Confirmaciones de Asistencia - Boda"
4. En la primera fila, agrega estos encabezados:

   | A | B | C | D | E | F | G |
   |---|---|---|---|---|---|---|
   | Timestamp | Nombre | Email | Teléfono | Asistencia | Acompañantes | Mensaje |

## Paso 2: Crear Google Apps Script

1. En tu Google Sheet, ve a **Extensiones** > **Apps Script**
2. Elimina el código que aparece por defecto
3. Pega el siguiente código:

```javascript
// ⚠️ IMPORTANTE: Cambia este token por uno único y secreto
// Genera uno aleatorio aquí: https://www.uuidgenerator.net/
const SECRET_TOKEN = 'CAMBIA_ESTE_TOKEN_POR_UNO_ALEATORIO_123456';

function doPost(e) {
  try {
    // Obtener la hoja activa
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Parsear los datos recibidos
    const data = JSON.parse(e.postData.contents);

    // 🔒 VALIDACIÓN 1: Verificar token de seguridad
    if (!data.token || data.token !== SECRET_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ 'result': 'error', 'error': 'Invalid token' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 🔒 VALIDACIÓN 2: Campos requeridos
    if (!data.nombre || !data.asistencia) {
      return ContentService
        .createTextOutput(JSON.stringify({ 'result': 'error', 'error': 'Missing required fields' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 🔒 VALIDACIÓN 3: Longitud de campos
    if (data.nombre.length < 3 || data.nombre.length > 100) {
      return ContentService
        .createTextOutput(JSON.stringify({ 'result': 'error', 'error': 'Invalid name length' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (data.mensaje && data.mensaje.length > 500) {
      return ContentService
        .createTextOutput(JSON.stringify({ 'result': 'error', 'error': 'Message too long' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 🔒 VALIDACIÓN 4: Valores válidos para asistencia
    if (data.asistencia !== 'Si' && data.asistencia !== 'No') {
      return ContentService
        .createTextOutput(JSON.stringify({ 'result': 'error', 'error': 'Invalid attendance value' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 🔒 VALIDACIÓN 5: Validar acompañantes
    const acompanantes = parseInt(data.acompanantes) || 0;
    if (acompanantes < 0 || acompanantes > 10) {
      return ContentService
        .createTextOutput(JSON.stringify({ 'result': 'error', 'error': 'Invalid number of guests' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 🔒 VALIDACIÓN 6: Rate limiting simple
    // Verificar que no haya más de 5 envíos en el último minuto
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    const recentRows = sheet.getDataRange().getValues();
    let recentSubmissions = 0;

    for (let i = recentRows.length - 1; i >= 1; i--) { // Empezar desde 1 para saltar header
      const rowDate = new Date(recentRows[i][0]);
      if (rowDate > oneMinuteAgo) {
        recentSubmissions++;
        if (recentSubmissions >= 5) {
          return ContentService
            .createTextOutput(JSON.stringify({ 'result': 'error', 'error': 'Rate limit exceeded' }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      } else {
        break; // Ya no hay más envíos recientes
      }
    }

    // Sanitizar datos (remover caracteres peligrosos)
    const sanitize = (str) => {
      if (!str) return '';
      return str.toString().substring(0, 500).replace(/[<>]/g, '');
    };

    // Crear fila con los datos validados y sanitizados
    const row = [
      data.timestamp || new Date().toISOString(),
      sanitize(data.nombre),
      sanitize(data.email),
      sanitize(data.telefono),
      data.asistencia,
      acompanantes,
      sanitize(data.mensaje)
    ];

    // Agregar la fila a la hoja
    sheet.appendRow(row);

    // Retornar respuesta exitosa
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'message': 'RSVP received' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // Log del error (visible en Executions en Apps Script)
    Logger.log('Error: ' + error.toString());

    // Retornar error genérico (no revelar detalles)
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': 'Server error' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Función de prueba (opcional)
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
        token: SECRET_TOKEN // Usar el mismo token que definiste arriba
      })
    }
  };

  const result = doPost(testData);
  Logger.log(result.getContent());
}
```

4. Guarda el proyecto (dale un nombre como "Formulario Boda")

## Paso 3: Desplegar el Script como Web App

1. Haz clic en **Implementar** > **Nueva implementación**
2. Haz clic en el ícono de engranaje ⚙️ junto a "Seleccionar tipo"
3. Selecciona **Aplicación web**
4. Configura:
   - **Descripción**: "Formulario de confirmación de asistencia"
   - **Ejecutar como**: Tu cuenta (@gmail.com)
   - **Quién tiene acceso**: **Cualquier usuario**
5. Haz clic en **Implementar**
6. Autoriza la aplicación (si te lo pide)
7. **IMPORTANTE**: Copia la **URL de la aplicación web** que aparece

## Paso 4: Generar Token Secreto

1. Ve a https://www.uuidgenerator.net/ y genera un UUID aleatorio
2. O usa este comando en terminal: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. **Guarda este token**, lo necesitarás en 2 lugares

## Paso 5: Actualizar el Token en Apps Script

1. Vuelve a tu Google Apps Script
2. En la línea 3, reemplaza `CAMBIA_ESTE_TOKEN_POR_UNO_ALEATORIO_123456` con tu token generado
3. **Guarda** el proyecto
4. **Implementa nuevamente** (Implementar > Administrar implementaciones > ✏️ Editar > Nueva versión > Implementar)

## Paso 6: Configurar las Variables de Entorno

1. En la raíz del proyecto, crea un archivo `.env`:

```bash
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/TU_ID_AQUI/exec
VITE_FORM_SECRET_TOKEN=tu-token-secreto-generado-aqui
```

2. Reemplaza:
   - La URL del script que copiaste en el Paso 3
   - El token secreto que generaste en el Paso 4

## Paso 7: Probar Localmente

1. Ejecuta el proyecto en desarrollo:
```bash
npm run dev
```

2. Abre el formulario y envía una prueba
3. Verifica que los datos aparezcan en tu Google Sheet

## Paso 8: Desplegar a Netlify

1. Agrega las variables de entorno en Netlify:
   - Ve a tu sitio en Netlify
   - **Site settings** > **Environment variables**
   - Agrega **DOS** variables:
     - `VITE_GOOGLE_SCRIPT_URL` con tu URL del script
     - `VITE_FORM_SECRET_TOKEN` con tu token secreto (el mismo del Paso 4)

2. Haz commit de los cambios:
```bash
git add .
git commit -m "feat: add RSVP form with Google Sheets integration"
git push
```

3. Netlify hará el deploy automáticamente

## 🔒 Medidas de Seguridad Implementadas

Este formulario incluye **protección básica** contra spam y abuse:

### Protecciones en el Frontend:
1. **Honeypot Field**: Campo invisible que solo los bots llenan (rechazo automático)
2. **Rate Limiting**: Máximo 1 envío cada 10 segundos por sesión
3. **Validación de datos**: Nombre mínimo 3 caracteres
4. **Token secreto**: Solo tu sitio puede enviar datos válidos

### Protecciones en el Backend (Apps Script):
1. **Verificación de token**: Rechaza requests sin token válido
2. **Validación de campos**: Verifica campos requeridos y tipos de datos
3. **Límites de longitud**: Nombre max 100 chars, mensaje max 500 chars
4. **Valores permitidos**: Solo "Si" o "No" para asistencia
5. **Sanitización**: Remueve caracteres peligrosos (< >)
6. **Rate limiting**: Máximo 5 envíos por minuto globales
7. **Errores genéricos**: No revela información del sistema

### Lo que ESTÁ protegido:
- ✅ Bots simples y scrapers automáticos
- ✅ Usuarios casuales intentando hacer spam
- ✅ Envíos masivos automatizados básicos
- ✅ Inyección de código básica

### Lo que NO está protegido (requiere seguridad avanzada):
- ❌ Ataques dirigidos y sofisticados
- ❌ Alguien que analice tu código y replique el token
- ❌ Bots muy avanzados con JavaScript habilitado
- ❌ Ataques DDoS distribuidos

**Para una boda/evento normal**: Esta seguridad es **más que suficiente** ✅

## Notas Importantes

- **Privacidad**: Los datos se guardan en tu Google Sheet privado (solo tú puedes verlos)
- **Token secreto**: NUNCA compartas tu token con nadie. Mantenlo en el `.env` local y en Netlify
- **Notificaciones**: Puedes configurar notificaciones por email en Google Sheets (Herramientas > Reglas de notificación)
- **Backup**: Google Sheets guarda automáticamente todo
- **Exportar**: Puedes exportar los datos a Excel o CSV cuando quieras
- **NO subas el archivo `.env` a git** - ya está en el `.gitignore`
- **Monitoreo**: Revisa tu Google Sheet ocasionalmente para detectar spam

## Troubleshooting

Si el formulario no funciona:

1. Verifica que la URL del script sea correcta
2. Asegúrate de que el script esté desplegado como "Cualquier usuario"
3. Revisa los permisos del script en Google Apps Script
4. Verifica que la variable de entorno esté configurada en Netlify
