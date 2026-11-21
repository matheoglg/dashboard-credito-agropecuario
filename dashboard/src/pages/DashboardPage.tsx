import { useMemo, useState } from 'react';
import { Box, Grid, Stack } from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import InsertChartRoundedIcon from '@mui/icons-material/InsertChartRounded';
import TableRowsRoundedIcon from '@mui/icons-material/TableRowsRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';

import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';
import { FilterBar } from '../components/filters/FilterBar';
import type { OpcionesFiltro } from '../components/filters/FilterBar';
import { KpiGrid } from '../components/kpi/KpiGrid';
import { Panel } from '../components/common/Panel';
import { Badge } from '../components/common/Badge';
import { ChartLegend } from '../components/common/ChartLegend';
import { LineChartTrend } from '../components/charts/LineChartTrend';
import { DonutChart } from '../components/charts/DonutChart';
import { BarRanking } from '../components/charts/BarRanking';
import { SearchInput } from '../components/table/SearchInput';
import { DataTable } from '../components/table/DataTable';
import type { Columna } from '../components/table/DataTable';
import { RecordCardList } from '../components/table/RecordCardList';

import { useBreakpoint } from '../hooks/useBreakpoint';
import { ANIOS_DISPONIBLES, PROVINCIAS, REGISTROS, SECTORES } from '../data/mockData';
import { buildKpis, COLORES_SECTOR, distribucionSectores, getResumen, rankingProvincias, serieMensual } from '../utils/aggregate';
import { formatCurrency, formatNumber, formatPercent } from '../utils/format';
import type { Filtros, Registro } from '../types';

const FILTROS_INICIALES: Filtros = { anio: ANIOS_DISPONIBLES[0], provincia: null, sector: null };
const POR_PAGINA = { desktop: 8, tablet: 8, mobile: 4 };

const OPCIONES: OpcionesFiltro = {
  anios: ANIOS_DISPONIBLES.map((a) => ({ value: String(a), label: String(a) })),
  provincias: PROVINCIAS.map((p) => ({ value: p, label: p })),
  sectores: SECTORES.map((s) => ({ value: s, label: s })),
};

const COLUMNAS: Columna<Registro>[] = [
  { key: 'periodo', header: 'Período' },
  { key: 'provincia', header: 'Provincia' },
  { key: 'canton', header: 'Cantón' },
  { key: 'sector', header: 'Sector', render: (r) => <Badge label={r.sector} color={COLORES_SECTOR[r.sector]} /> },
  { key: 'producto', header: 'Producto', hideBelow: 'lg' },
  { key: 'institucion', header: 'Institución', hideBelow: 'xl' },
  { key: 'numOperaciones', header: 'Op.', align: 'right', render: (r) => formatNumber(r.numOperaciones ?? 0) },
  { key: 'valorUsd', header: 'Monto (USD)', align: 'right', render: (r) => <b>{formatCurrency(r.valorUsd)}</b> },
];

const NAV = [
  { id: 'inicio', label: 'Inicio', icon: <HomeRoundedIcon /> },
  { id: 'graficos', label: 'Gráficos', icon: <InsertChartRoundedIcon /> },
  { id: 'registros', label: 'Registros', icon: <TableRowsRoundedIcon /> },
  { id: 'filtros', label: 'Filtros', icon: <TuneRoundedIcon /> },
];

function exportarCsv(registros: Registro[]) {
  const campos: (keyof Registro)[] = ['periodo', 'provincia', 'canton', 'sector', 'producto', 'institucion', 'numOperaciones', 'valorUsd'];
  const filas = registros.map((r) => campos.map((c) => `"${String(r[c] ?? '').replace(/"/g, '""')}"`).join(';'));
  const blob = new Blob(['﻿' + [campos.join(';'), ...filas].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: 'credito_agropecuario_filtrado.csv' });
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Componente contenedor: guarda el estado (filtros, búsqueda, página y sección activa),
 * calcula los datos y los reparte por props a los componentes de presentación.
 */
export function DashboardPage() {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'mobile';

  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIALES);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(0);
  const [seccion, setSeccion] = useState('inicio');

  // Cada vez que cambia un filtro o la búsqueda se vuelve a la primera página.
  const cambiarFiltro = (clave: keyof Filtros, valor: string | null) => {
    setFiltros((prev) => ({ ...prev, [clave]: clave === 'anio' ? Number(valor) : valor }));
    setPagina(0);
  };
  const limpiarFiltros = () => {
    setFiltros(FILTROS_INICIALES);
    setBusqueda('');
    setPagina(0);
  };
  const buscar = (texto: string) => {
    setBusqueda(texto);
    setPagina(0);
  };
  const navegar = (id: string) => {
    setSeccion(id);
    if (id === 'inicio') window.scrollTo({ top: 0, behavior: 'smooth' });
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Datos derivados del estado: se recalculan solo cuando cambian los filtros.
  const actual = useMemo(() => getResumen(filtros.anio, filtros.provincia), [filtros.anio, filtros.provincia]);
  const anterior = useMemo(() => getResumen(filtros.anio - 1, filtros.provincia), [filtros.anio, filtros.provincia]);
  const kpis = useMemo(() => buildKpis(actual, anterior, filtros.anio - 1), [actual, anterior, filtros.anio]);
  const serie = useMemo(() => serieMensual(actual, anterior), [actual, anterior]);
  const sectores = useMemo(() => distribucionSectores(actual), [actual]);
  const ranking = useMemo(() => rankingProvincias(filtros.anio), [filtros.anio]);

  const registros = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return REGISTROS.filter(
      (r) =>
        r.anio === filtros.anio &&
        (!filtros.provincia || r.provincia === filtros.provincia) &&
        (!filtros.sector || r.sector === filtros.sector) &&
        (!texto || `${r.canton} ${r.producto}`.toLowerCase().includes(texto)),
    );
  }, [filtros, busqueda]);

  const porPagina = POR_PAGINA[breakpoint];
  const paginaActual = registros.slice(pagina * porPagina, (pagina + 1) * porPagina);
  const lugar = filtros.provincia ?? 'Ecuador';
  const total = sectores.reduce((s, c) => s + c.value, 0);

  const buscador = <SearchInput value={busqueda} onChange={buscar} placeholder="Buscar cantón o producto…" />;

  return (
    <DashboardLayout
      breakpoint={breakpoint}
      header={
        <Header
          title="Crédito público agropecuario"
          subtitle="Monitoreo de créditos otorgados por provincia, cantón, sector e institución (2013 – 2026)"
          source="MAG · Datos Abiertos Ecuador"
          cutoffDate="octubre 2026"
          onExport={() => exportarCsv(registros)}
          compact={isMobile}
        />
      }
      bottomNav={<BottomNav items={NAV} activeId={seccion} onNavigate={navegar} />}
    >
      <Box id="filtros" sx={{ scrollMarginTop: 80 }}>
        <FilterBar filters={filtros} options={OPCIONES} onFilterChange={cambiarFiltro} onClear={limpiarFiltros} variant={isMobile ? 'chips' : 'bar'} />
      </Box>

      <KpiGrid items={kpis} columns={breakpoint === 'desktop' ? 4 : 2} compact={isMobile} />

      <Grid container spacing={isMobile ? 2 : 3} id="graficos" sx={{ scrollMarginTop: 80 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Panel
            title="Evolución mensual del monto otorgado"
            subtitle={`USD · ${lugar} · ${filtros.anio} frente a ${filtros.anio - 1}`}
            actions={
              <ChartLegend
                items={[
                  { label: String(filtros.anio), color: '#1E6B47' },
                  { label: String(filtros.anio - 1), color: '#A9B3AE', dashed: true },
                ]}
              />
            }
          >
            <LineChartTrend
              data={serie}
              series={[
                { key: 'actual', label: String(filtros.anio), color: '#1E6B47' },
                { key: 'anterior', label: String(filtros.anio - 1), color: '#A9B3AE', dashed: true },
              ]}
              valueFormatter={formatCurrency}
              height={isMobile ? 220 : 300}
              shortLabels={isMobile}
            />
          </Panel>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Panel title="Distribución por sector productivo" subtitle={`% del monto otorgado · ${lugar} · ${filtros.anio}`}>
            <Stack direction={{ xs: 'column', sm: 'row', md: 'column', xl: 'row' }} spacing={2.5} sx={{ alignItems: 'center' }}>
              <DonutChart
                data={sectores}
                centerValue={formatCurrency(total)}
                centerLabel={`Total ${filtros.anio}`}
                size={isMobile ? 180 : 210}
                onSliceClick={(s) => cambiarFiltro('sector', s)}
              />
              <Box sx={{ width: '100%' }}>
                <ChartLegend
                  direction="column"
                  items={sectores.map((s) => ({ label: s.name, color: s.color ?? '#A9B3AE', value: formatPercent(total ? (s.value / total) * 100 : 0) }))}
                />
              </Box>
            </Stack>
          </Panel>
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Panel title="Provincias con mayor monto" subtitle={`Top ${isMobile ? 5 : 8} · USD · ${filtros.anio}`}>
            <BarRanking
              data={ranking}
              limit={isMobile ? 5 : 8}
              highlight={filtros.provincia}
              valueFormatter={formatCurrency}
              onBarClick={(p) => cambiarFiltro('provincia', p === filtros.provincia ? null : p)}
            />
          </Panel>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }} id="registros" sx={{ scrollMarginTop: 80 }}>
          <Panel title="Detalle de registros" subtitle="Registros de mayor monto por provincia" actions={isMobile ? undefined : buscador}>
            {isMobile ? (
              <Stack spacing={1.5}>
                {buscador}
                <RecordCardList records={paginaActual} page={pagina} pageCount={Math.ceil(registros.length / porPagina)} onPageChange={setPagina} />
              </Stack>
            ) : (
              <DataTable columns={COLUMNAS} rows={paginaActual} totalItems={registros.length} page={pagina} rowsPerPage={porPagina} onPageChange={setPagina} />
            )}
          </Panel>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}
