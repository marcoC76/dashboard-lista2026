# Dashboard Lista 2026

Dashboard interactivo para visualizar y gestionar el progreso de entregas y puntos extra de estudiantes.

## Archivos

- `google-apps-script.gs` - Codigo para Google Apps Script (publica la hoja como API JSON)
- `index.html` - Dashboard principal
- `styles.css` - Estilos del dashboard
- `app.js` - Logica del dashboard (fetch, graficos, CRUD)

## Configuracion

### Paso 1: Configurar Google Apps Script

1. Ve a [Google Apps Script](https://script.google.com/)
2. Haz clic en **New project**
3. Borra el codigo existente y pega el contenido de `google-apps-script.gs`
4. Cambia las constantes:
   - `SPREADSHEET_ID`: El ID de tu hoja de calculo (lo encuentras en la URL: `https://docs.google.com/spreadsheets/d/ESTE_ES_EL_ID/edit`)
   - `SHEET_NAME`: El nombre de la hoja (default: 'ListaAlumnos')
5. Guarda el proyecto (Ctrl + S)
6. Haz clic en **Deploy > New deployment**
7. Selecciona **Web app**
8. Configura:
   - Description: "Dashboard API"
   - Execute as: "Me"
   - Who has access: "Anyone"
9. Haz clic en **Deploy**
10. Copia la URL generada (la necesitaras para el dashboard)

### Paso 2: Configurar GitHub Pages

1. Crea un repositorio en GitHub
2. Sube estos archivos al repositorio
3. Ve a **Settings > Pages**
4. Selecciona la rama "main" y haz clic en **Save**
5. Espera unos minutos y tu dashboard estara disponible en: `https://TU_USUARIO.github.io/TU_REPOSITORIO/`

### Paso 3: Usar el Dashboard

1. Abre el dashboard en tu navegador
2. Ingresa el **Spreadsheet ID** (lo encuentras en la URL de Google Sheets)
3. Pega la **URL de Google Apps Script** en el campo de configuracion
4. Haz clic en **Cargar Datos**
5. Usa los filtros para ver datos por grupo
6. Haz clic en los botones "Toggle J1/J2/J3" para cambiar estados de entrega

## Funcionalidades

- **Estadisticas generales**: Total de estudiantes, juegos entregados/pendientes, puntos extra promedio
- **Graficos interactivos**: Progreso de entregas por juego y distribucion de puntos extra
- **Tabla de estudiantes**: Lista completa con estados y botones para actualizar
- **Filtrado**: Por grupo (1E, 1B)
- **Modificacion en tiempo real**: Cambia estados de entrega desde el dashboard

## Notas

- Los cambios en el dashboard se reflejan inmediatamente en Google Sheets
- La URL de Google Apps Script y el Spreadsheet ID se guardan en el navegador (localStorage)
- Asegurate de que la hoja de calculo este compartida o sea publica para que la API funcione
- El script es externo y puede trabajar con cualquier hoja de calculo proporcionando el ID
