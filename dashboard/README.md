# Dashboard – Crédito Público Agropecuario (React + Vite + TypeScript + Material UI)

Interfaz del dashboard desarrollada en el **Sprint 2**. Muestra indicadores, gráficos y una tabla de registros del crédito público agropecuario del MAG, con datos de ejemplo tomados de los JSON generados en el Sprint 1.

## Tecnologías

- React 19 + TypeScript, creado con Vite (`create-vite@9.3.4`, plantilla `react-ts`)
- Material UI 9 (`@mui/material`, `@mui/icons-material`) y MUI X Charts (`@mui/x-charts`)
- Fuente Inter (`@fontsource/inter`)

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
├── types/index.ts           # Tipos compartidos: Registro, Resumen, Filtros, Kpi, Opcion…
├── data/mockData.ts         # Datos de ejemplo (agregados por año y provincia del Sprint 1)
├── utils/
│   ├── format.ts            # Formato de montos, números y porcentajes (es-EC)
│   └── aggregate.ts         # Cálculo de KPI, serie mensual, sectores y ranking
├── hooks/useBreakpoint.ts   # mobile | tablet | desktop con useMediaQuery
├── pages/DashboardPage.tsx  # Contenedor: estado con useState y reparto de props
└── components/
    ├── layout/              # Header, DashboardLayout, BottomNav
    ├── filters/             # SelectFilter, FilterBar
    ├── kpi/                 # KpiCard, KpiGrid
    ├── charts/              # LineChartTrend, DonutChart, BarRanking
    ├── table/               # DataTable, SearchInput, RecordCard, RecordCardList
    └── common/              # Panel, Badge, ChartLegend
```

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
