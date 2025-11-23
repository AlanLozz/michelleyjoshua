# Instrucciones: Sistema de IDs Persistentes y Seguros

## ✅ Cambios Completados en el Frontend

Los siguientes archivos ya fueron actualizados:

- ✅ `src/store/seatingStore.js` - Sistema simplificado que confía en IDs del backend
- ✅ `src/components/admin/GuestAssigner.jsx` - Código de debugging eliminado
- ✅ `src/components/admin/LinkGenerator.jsx` - Carga de datos simplificada
- ✅ `src/pages/SeatingChartPage.jsx` - Búsqueda directa por ID, sin nombre de invitado
- ✅ `src/styles/SeatingChart.css` - Estilos innecesarios eliminados

## 📋 Pasos para Implementar en Google Apps Script

### 1. Abrir el Editor de Apps Script

1. Ve a tu Google Sheet de invitados
2. Click en **Extensiones** → **Apps Script**
3. Se abrirá el editor de código

### 2. Reemplazar el Código

1. **Copia TODO el contenido** del archivo `GOOGLE_APPS_SCRIPT_ACTUALIZADO.js`
2. En el editor de Apps Script, **borra todo el código existente**
3. **Pega el nuevo código**

### 3. Configurar las Constantes

En la parte superior del código, actualiza estas dos constantes:

```javascript
const SECRET_TOKEN = 'TU_SECRET_TOKEN_AQUI'; // Debe coincidir con tu .env
const SPREADSHEET_ID = 'TU_SPREADSHEET_ID_AQUI';
```

**Para obtener el SPREADSHEET_ID:**
- Abre tu Google Sheet
- Mira la URL: `https://docs.google.com/spreadsheets/d/ABC123XYZ456/edit`
- El ID es la parte entre `/d/` y `/edit`: `ABC123XYZ456`

**Para el SECRET_TOKEN:**
- Debe ser el mismo valor que `VITE_FORM_SECRET_TOKEN` en tu archivo `.env`

### 4. Ajustar Nombre de la Hoja

En la función `handleGetGuests()`, línea ~125, actualiza el nombre de tu hoja:

```javascript
const sheet = ss.getSheetByName('Respuestas de formulario 1'); // ← Cambia esto
```

Cambia `'Respuestas de formulario 1'` por el nombre exacto de tu hoja con las respuestas.

### 5. Verificar Mapeo de Columnas

En `handleGetGuests()`, líneas ~138-150, verifica que los nombres de columnas coincidan con tu formulario:

```javascript
if (header.includes('Nombre') || header.includes('nombre')) {
  guest.nombre = value;
} else if (header.includes('Email') || header.includes('email') || header.includes('Correo')) {
  guest.email = value;
}
// ... etc
```

Si tus columnas tienen nombres diferentes, ajusta estas condiciones.

### 6. Ejecutar Función de Prueba

1. En el editor de Apps Script, selecciona la función `testGuestIds` en el dropdown
2. Click en **▶️ Ejecutar**
3. La primera vez te pedirá permisos → **Revisar permisos** → selecciona tu cuenta → **Permitir**
4. Ve a **Ver** → **Logs** para ver el resultado
5. Deberías ver algo como:
   ```
   === PRUEBA DE SISTEMA DE IDs ===
   ID para Juan Pérez (fila 2): guest-a3f9k2m8
   ID para Juan Pérez de nuevo: guest-a3f9k2m8
   IDs coinciden: true
   ID para María López (fila 3): guest-x7b4n1p9
   === PRUEBA COMPLETADA ===
   ```

### 7. Implementar la Web App (si no lo has hecho)

1. Click en **Implementar** → **Nueva implementación**
2. Tipo: **Aplicación web**
3. Configuración:
   - **Descripción**: Sistema de Invitados Wedding
   - **Ejecutar como**: Yo (tu email)
   - **Quién tiene acceso**: Cualquier persona
4. Click **Implementar**
5. **Copia la URL** que te da (la necesitas para el .env)
6. Esta URL debe estar en tu `.env` como `VITE_GOOGLE_SCRIPT_URL`

### 8. Verificar Hoja GuestIDs

Después de ejecutar la prueba o cargar invitados, verifica que se creó la hoja **GuestIDs**:

1. Ve a tu Google Sheet
2. Deberías ver una nueva pestaña llamada "GuestIDs"
3. Debe tener 3 columnas: `Fila | GuestID | Nombre`
4. Cada invitado confirmado debe tener un ID único

## 🔧 Qué Hacer Después de la Instalación

### 1. Limpiar Asignaciones Antiguas (Opcional)

Si ya tenías asignaciones con IDs viejos, es mejor empezar de cero:

1. Ve al panel de admin → tab "Asignar Invitados"
2. Verás que probablemente no haya invitados asignados (IDs no coinciden)
3. Asigna los invitados a sus mesas nuevamente
4. Click en **"💾 Guardar Asignaciones"**

### 2. Generar Links Nuevos

1. Ve al tab "Generar Links"
2. Los invitados ahora tienen IDs estables y seguros
3. Copia los links (individualmente o todos juntos)
4. Envía estos nuevos links a tus invitados

### 3. Probar un Link

1. Copia un link de ejemplo
2. Ábrelo en una ventana de incógnito
3. Deberías ver el croquis con la mesa asignada
4. **NO** debería aparecer el nombre del invitado (por privacidad)

## 🔐 Seguridad del Sistema

### IDs Aleatorios

Los IDs ahora son aleatorios de 8 caracteres:
- ✅ `guest-a3f9k2m8` (seguro, impredecible)
- ❌ `guest-row-5` (inseguro, predecible)

Esto previene que alguien pueda "adivinar" otros links cambiando números.

### Persistencia

- Los IDs se guardan en la hoja **GuestIDs**
- Están asociados al número de fila + nombre del invitado
- Si reordenas tu hoja, el sistema los reconoce por nombre
- Una vez asignado un ID, **nunca cambia**

## 🐛 Solución de Problemas

### "No se encuentran invitados"

1. Verifica que el nombre de la hoja en `handleGetGuests()` sea correcto
2. Verifica que existan invitados con `asistencia = "Sí"` o `"Si"`
3. Ejecuta la función de prueba `testGuestIds()` y revisa los logs

### "Links no funcionan"

1. Asegúrate de haber guardado las asignaciones después de asignar mesas
2. Verifica que el `VITE_GOOGLE_SCRIPT_URL` en `.env` sea correcto
3. Abre la consola del navegador (F12) y busca errores

### "Hoja GuestIDs vacía"

1. Carga el panel de admin → "Asignar Invitados"
2. Esto debería triggerar `getGuests` que crea los IDs
3. Refresca tu Google Sheet y verifica la pestaña GuestIDs

### "CORS errors"

El código ya maneja CORS con `mode: 'no-cors'`. Si ves errores CORS:
1. Verifica que la implementación de Apps Script sea pública
2. Asegúrate de copiar la URL correcta de la implementación

## 📊 Cómo Funciona el Sistema

### Primera Carga
```
Admin abre "Asignar Invitados"
    ↓
Frontend llama getGuests endpoint
    ↓
Backend lee hoja de respuestas
    ↓
Para cada invitado confirmado:
  - Busca en GuestIDs por fila
  - Si no existe: genera ID aleatorio y lo guarda
  - Si existe: usa el ID guardado
    ↓
Retorna invitados con IDs estables
```

### Cargas Subsiguientes
```
Frontend llama getGuests
    ↓
Backend encuentra IDs en GuestIDs
    ↓
Retorna los MISMOS IDs
    ↓
Links permanecen válidos
```

### Reordenamiento de Filas
```
María estaba en fila 5, ahora en fila 8
    ↓
Backend busca fila 8 en GuestIDs
    ↓
Encuentra que fila 8 era "Pedro"
    ↓
Busca "María" por nombre en toda la hoja
    ↓
Encuentra su ID guardado
    ↓
Actualiza número de fila a 8
    ↓
Retorna el mismo ID de María
```

## ✨ Ventajas del Nuevo Sistema

- 🔒 **Seguro**: IDs impredecibles
- 🎯 **Estable**: IDs nunca cambian
- 💾 **Persistente**: Guardados en Google Sheets
- 🔄 **Robusto**: Sobrevive reordenamientos
- 🚀 **Simple**: Frontend solo confía en backend
- 🧹 **Limpio**: Sin código de migración complejo

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de Apps Script: **Ver** → **Logs**
2. Revisa la consola del navegador (F12)
3. Verifica que todas las hojas existan: Respuestas, Layout, Assignments, GuestIDs
