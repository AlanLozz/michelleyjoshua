# Invitación de Bodas Web - Guía de Personalización

## Inicio Rápido

### Instalar y ejecutar
```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Compilar para producción
```bash
npm run build
```

---

## Personalización

### 1. Nombres y Fecha de la Boda

**Archivo: `src/components/Hero.jsx`**

Cambia los textos en las líneas 36-42:
```jsx
<motion.h1 className="hero-title" variants={itemVariants}>
  Tu Nombre & Tu Pareja  {/* Cambia aquí */}
</motion.h1>
<motion.p className="hero-subtitle" variants={itemVariants}>
  Nos casamos  {/* O personaliza el texto */}
</motion.p>
<motion.p className="hero-date" variants={itemVariants}>
  Sábado, 15 de Junio 2025  {/* Cambia la fecha */}
</motion.p>
```

**Archivo: `src/App.jsx`**

Cambia la fecha de la boda para la cuenta regresiva (línea 10):
```jsx
const weddingDate = "2025-06-15T17:00:00"; // Formato: YYYY-MM-DDTHH:MM:SS
```

### 2. Detalles del Evento

**Archivo: `src/components/EventInfo.jsx`**

Actualiza la información del evento (líneas 43, 57, 71-73):
```jsx
// Fecha
<p>Sábado, 15 de Junio 2025</p>

// Hora
<p>5:00 PM</p>

// Lugar
<p>Hacienda Los Robles</p>
<p className="event-address">Calle Principal 123, Ciudad</p>
```

Para el enlace de Google Maps (línea 74):
```jsx
href="TU_ENLACE_DE_GOOGLE_MAPS"  // Obtén el enlace desde Google Maps
```

### 3. Google Forms para RSVP

**Archivo: `src/components/RSVP.jsx`**

1. Crea un formulario en Google Forms
2. Haz clic en "Enviar" → Copiar enlace
3. Pega el enlace en la línea 7:
```jsx
const googleFormUrl = "https://forms.gle/TU_ENLACE_AQUI";
```

Opcional: Cambia la fecha límite de confirmación (línea 36):
```jsx
Por favor confirma tu asistencia antes del 1 de Mayo.
```

### 4. Fotos del Carrusel

**Archivo: `src/components/Gallery.jsx`**

La galería ahora es un carrusel con navegación por botones, arrastrar (swipe) y puntos indicadores.

Opción A - Subir fotos al proyecto:
1. Coloca tus fotos en la carpeta `src/assets/images/`
2. Importa las fotos al inicio del archivo:
```jsx
import foto1 from '../assets/images/foto1.jpg';
import foto2 from '../assets/images/foto2.jpg';
// ... etc
```

3. Actualiza el array de fotos (líneas 8-15):
```jsx
const photos = [
  { id: 1, src: foto1, alt: 'Descripción foto 1' },
  { id: 2, src: foto2, alt: 'Descripción foto 2' },
  // ... agrega más fotos
];
```

Opción B - Usar URLs de imágenes en línea:
```jsx
const photos = [
  { id: 1, src: 'https://tu-servidor.com/foto1.jpg', alt: 'Descripción' },
  // ...
];
```

**Funcionalidades del Carrusel:**
- Navegación con botones (◀ ▶)
- Arrastrar/Swipe en móviles y desktop
- Indicadores (dots) para saltar a cualquier foto
- Animaciones suaves con Framer Motion
- Marco decorativo estilo vintage

### 5. Colores del Tema

**Archivo: `src/index.css`**

Personaliza la paleta de colores (líneas 5-13):
```css
:root {
  --color-primary: #8B7355;      /* Color principal */
  --color-secondary: #A0826D;    /* Color secundario */
  --color-accent: #6B8E23;       /* Color de acento */
  --color-light: #F5F1E8;        /* Fondo claro */
  --color-cream: #FFF8E7;        /* Crema */
  --color-dark: #4A3C2F;         /* Texto oscuro */
}
```

### 6. Tipografía

**Archivo: `src/index.css`**

Cambia las fuentes editando la línea 2 y las variables (líneas 16-18):
```css
@import url('URL_DE_GOOGLE_FONTS');

:root {
  --font-display: 'Tu Fuente Display', serif;
  --font-body: 'Tu Fuente Body', serif;
  --font-accent: 'Tu Fuente Accent', sans-serif;
}
```

Busca fuentes en: https://fonts.google.com

---

## Estructura del Proyecto

```
wedding-invitation/
├── src/
│   ├── components/        # Componentes React
│   │   ├── Hero.jsx       # Portada con nombres
│   │   ├── Countdown.jsx  # Cuenta regresiva
│   │   ├── EventInfo.jsx  # Detalles del evento
│   │   ├── Gallery.jsx    # Galería de fotos
│   │   └── RSVP.jsx       # Confirmación de asistencia
│   ├── styles/            # Archivos CSS por componente
│   ├── assets/            # Imágenes y recursos
│   ├── App.jsx            # Componente principal
│   └── index.css          # Estilos globales
├── package.json
└── vite.config.js
```

---

## Despliegue

### Opción 1: Netlify (Recomendado - Gratis)
1. Crea una cuenta en https://netlify.com
2. Conecta tu repositorio de GitHub
3. Netlify detectará automáticamente Vite
4. Deploy automático

### Opción 2: Vercel (Gratis)
1. Crea una cuenta en https://vercel.com
2. Importa tu proyecto desde GitHub
3. Deploy automático

### Opción 3: GitHub Pages
```bash
npm run build
# Sube el contenido de la carpeta 'dist' a GitHub Pages
```

---

## Consejos de Optimización

### Imágenes
- Usa formato WebP o JPEG optimizado
- Tamaño recomendado: 800x800px máximo
- Comprime las imágenes antes de subirlas
- Herramienta recomendada: https://tinypng.com

### Performance
- Mantén máximo 8-10 fotos en la galería
- Las animaciones están optimizadas
- El diseño es completamente responsive

---

## Soporte

Si tienes problemas:
1. Revisa que todas las dependencias estén instaladas: `npm install`
2. Limpia la caché: `npm run build --force`
3. Verifica la consola del navegador para errores

---

## Tecnologías Utilizadas

- **React** - Framework de UI
- **Vite** - Build tool
- **Framer Motion** - Animaciones
- **React Icons** - Iconos
- **CSS3** - Estilos personalizados

---

¡Felicidades por tu boda! 💍
