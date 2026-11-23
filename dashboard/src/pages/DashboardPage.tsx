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

import { DataStatus } from '../components/common/DataStatus';

import { useBreakpoint } from '../hooks/useBreakpoint';
import { useResumenes } from '../hooks/useResumenes';
import { useRegistros } from '../hooks/useRegistros';
import { LIMITE_REGISTROS } from '../services/creditoService';
import { buildKpis, COLORES_SECTOR, distribucionSectores, getResumen, rankingProvincias, serieMensual } from '../utils/aggregate';
import { formatCurrency, formatNumber, formatPercent } from '../utils/format';
import type { Filtros, Registro } from '../types';

// 2025 es el último año completo del dataset (2026 llega hasta septiembre).
const FILTROS_INICIALES: Filtros = { anio: 2025, provincia: null, sector: null };
const POR_PAGINA = { desktop: 8, tablet: 8, mobile: 4 };
const aOpciones = (valores: (string | number)[]) => valores.map((v) => ({ value: String(v), label: String(v) }));

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
 * Componente contenedor: obtiene los datos de Firebase con los hooks useResumenes y useRegistros,
 * guarda el estado de la interfaz (filtros, búsqueda, página y sección activa),
 * calcula los datos y los reparte por props a los componentes de presentación.
 */
export function DashboardPage() {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'mobile';

  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIALES);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(0);
  const [seccion, setSeccion] = useState('inicio');

  // Datos desde Firebase Realtime Database.
  const { datos, cargando: cargandoResumen, error: errorResumen } = useResumenes();
  const { registros: registrosAnio, cargando: cargandoRegistros, error: errorRegistros } = useRegistros(filtros.anio, filtros.provincia);

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

  // Datos derivados: se recalculan cuando llegan datos de Firebase o cambian los filtros.
  const opciones = useMemo<OpcionesFiltro>(
    () => ({
      anios: aOpciones(datos?.catalogos.anios ?? [FILTROS_INICIALES.anio]),
      provincias: aOpciones(datos?.catalogos.provincias ?? []),
      sectores: aOpciones(datos?.catalogos.sectores ?? []),
    }),
    [datos],
  );
  const actual = useMemo(() => getResumen(datos, filtros.anio, filtros.provincia), [datos, filtros.anio, filtros.provincia]);
  const anterior = useMemo(() => getResumen(datos, filtros.anio - 1, filtros.provincia), [datos, filtros.anio, filtros.provincia]);
  const kpis = useMemo(() => buildKpis(actual, anterior, filtros.anio - 1), [actual, anterior, filtros.anio]);
  const serie = useMemo(() => serieMensual(actual, anterior), [actual, anterior]);
  const sectores = useMemo(() => distribucionSectores(actual), [actual]);
  const ranking = useMemo(() => rankingProvincias(datos, filtros.anio), [datos, filtros.anio]);

  // El año y la provincia ya se filtraron en la consulta a Firebase; sector y búsqueda se aplican aquí.
  const registros = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return registrosAnio.filter(
      (r) => (!filtros.sector || r.sector === filtros.sector) && (!texto || `${r.canton} ${r.producto}`.toLowerCase().includes(texto)),
    );
  }, [registrosAnio, filtros.sector, busqueda]);

  const porPagina = POR_PAGINA[breakpoint];
  const paginaActual = registros.slice(pagina * porPagina, (pagina + 1) * porPagina);
  const lugar = filtros.provincia ?? 'Ecuador';
  const total = sectores.reduce((s, c) => s + c.value, 0);

  const buscador = <SearchInput value={busqueda} onChange={buscar} placeholder="Buscar cantón o producto…" />;
  const anios = datos?.catalogos.anios ?? [];
  const rango = anios.length ? ` (${Math.min(...anios)} – ${Math.max(...anios)})` : '';
  const subtituloTabla = filtros.provincia
    ? `Registros de ${filtros.provincia} en ${filtros.anio}, ordenados por monto`
    : `Los ${LIMITE_REGISTROS} registros de mayor monto de ${filtros.anio}`;

  return (
    <DashboardLayout
      breakpoint={breakpoint}
      header={
        <Header
          title="Crédito público agropecuario"
          subtitle={`Monitoreo de créditos otorgados por provincia, cantón, sector e institución${rango}`}
          source="MAG · Datos Abiertos Ecuador · Firebase"
          cutoffDate="octubre 2026"
          onExport={() => exportarCsv(registros)}
          compact={isMobile}
        />
      }
      bottomNav={<BottomNav items={NAV} activeId={seccion} onNavigate={navegar} />}
    >
      <Box id="filtros" sx={{ scrollMarginTop: 80 }}>
        <FilterBar filters={filtros} options={opciones} onFilterChange={cambiarFiltro} onClear={limpiarFiltros} variant={isMobile ? 'chips' : 'bar'} />
      </Box>

      <DataStatus cargando={cargandoResumen} error={errorResumen} minHeight={320}>
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
            <Panel title="Detalle de registros" subtitle={subtituloTabla} actions={isMobile ? undefined : buscador}>
              <DataStatus cargando={cargandoRegistros} error={errorRegistros} mensajeCarga="Consultando registros en Firebase…">
                {isMobile ? (
                  <Stack spacing={1.5}>
                    {buscador}
                    <RecordCardList records={paginaActual} page={pagina} pageCount={Math.ceil(registros.length / porPagina)} onPageChange={setPagina} />
                  </Stack>
                ) : (
                  <DataTable
                    columns={COLUMNAS}
                    rows={paginaActual}
                    totalItems={registros.length}
                    page={pagina}
                    rowsPerPage={porPagina}
                    onPageChange={setPagina}
                  />
                )}
              </DataStatus>
            </Panel>
          </Grid>
        </Grid>
      </DataStatus>
    </DashboardLayout>
  );
}
