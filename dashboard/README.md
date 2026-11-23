# Dashboard – Crédito Público Agropecuario (React + Vite + TypeScript + Material UI)

Interfaz del dashboard del crédito público agropecuario del MAG. Los componentes se desarrollaron en el **Sprint 2** y desde el **Sprint 3** los datos se leen de **Firebase Realtime Database**.

## Tecnologías

- React 19 + TypeScript, creado con Vite (`create-vite@9.3.4`, plantilla `react-ts`)
- Material UI 9 (`@mui/material`, `@mui/icons-material`) y MUI X Charts (`@mui/x-charts`)
- Fuente Inter (`@fontsource/inter`)
- Firebase JS SDK 13 (`firebase`) para leer Realtime Database

## Cómo ejecutar

Requisitos: Node.js 20.19 o superior.

```bash
cd dashboard
npm install
npm run dev
```

Abrir la dirección que muestra la consola (por defecto http://localhost:5173). Para generar la versión de producción: `npm run build`.

## Estructura

```
src/
├── main.tsx                 # Punto de entrada: ThemeProvider + CssBaseline
├── App.tsx                  # Monta DashboardPage
├── theme.ts                 # Colores, tipografía y breakpoints (móvil < 768 px, escritorio ≥ 1280 px)
├── types/index.ts           # Tipos compartidos: Registro, Resumen, DatosResumen, Filtros, Kpi…
├── firebase/firebase.ts     # Configuración e inicialización de Firebase (exporta db)
├── services/creditoService.ts  # Consultas a Realtime Database (get, query, orderByChild…)
├── utils/
│   ├── format.ts            # Formato de montos, números y porcentajes (es-EC)
│   └── aggregate.ts         # Cálculo de KPI, serie mensual, sectores y ranking
├── hooks/
│   ├── useResumenes.ts      # useEffect + useState: lee /resumenes al cargar la página
│   ├── useRegistros.ts      # useEffect + useState: lee /registros/{año} al cambiar año o provincia
│   └── useBreakpoint.ts     # mobile | tablet | desktop con useMediaQuery
├── pages/DashboardPage.tsx  # Contenedor: estado con useState y reparto de props
└── components/
    ├── layout/              # Header, DashboardLayout, BottomNav
    ├── filters/             # SelectFilter, FilterBar
    ├── kpi/                 # KpiCard, KpiGrid
    ├── charts/              # LineChartTrend, DonutChart, BarRanking
    ├── table/               # DataTable, SearchInput, RecordCard, RecordCardList
    └── common/              # Panel, Badge, ChartLegend, DataStatus (carga y error)
```

## Datos desde Firebase

| Nodo | Contenido | Quién lo usa |
|---|---|---|
| `/resumenes` | Totales por año y provincia y listas para los filtros (generado con `scripts/generar_resumenes.py`) | `useResumenes` → KPI, gráficos y filtros |
| `/registros/{año}` | Los registros del JSON del Sprint 1, un nodo por año | `useRegistros` → tabla de detalle |

- Sin provincia seleccionada se piden los 200 registros de mayor monto del año (`orderByChild('valorUsd')` + `limitToLast(200)`).
- Con provincia se piden todos los registros de esa provincia en el año (`orderByChild('provincia')` + `equalTo(provincia)`).
- Mientras llega la respuesta se muestra un indicador de carga y, si Firebase responde con error, un aviso (componente `DataStatus`).

La configuración del proyecto de Firebase está en `src/firebase/firebase.ts`. Las reglas de la base de datos están en `../firebase/database.rules.json`.

## Interacción con useState

`DashboardPage` guarda cuatro estados:

| Estado | Para qué sirve |
|---|---|
| `filtros` (`{ anio, provincia, sector }`) | Al cambiar el año o la provincia se recalculan los KPI y los gráficos; el sector filtra la tabla. También se cambia al hacer clic en una provincia del ranking o en un sector de la dona. |
| `busqueda` | Texto del buscador; filtra la tabla por cantón o producto. |
| `pagina` | Página actual de la tabla o de las tarjetas en móvil. |
| `seccion` | Opción activa de la navegación inferior en móvil. |

Los componentes hijos no guardan estos datos: los reciben por props y avisan los cambios con funciones (`onFilterChange`, `onChange`, `onPageChange`, `onNavigate`).

## Diseño responsivo

| Pantalla | Cambios |
|---|---|
| Escritorio (≥ 1280 px) | Filtros en una fila, 4 KPI por fila, gráficos en dos columnas y tabla de 8 columnas. |
| Tablet (768–1279 px) | Filtros y KPI en 2 columnas, gráficos a ancho completo, tabla sin Producto ni Institución. |
| Móvil (< 768 px) | Barra superior compacta, filtros como chips, KPI en 2 × 2, ranking top 5, tabla convertida en tarjetas y navegación inferior. |

Capturas en [`docs/capturas`](docs/capturas).
