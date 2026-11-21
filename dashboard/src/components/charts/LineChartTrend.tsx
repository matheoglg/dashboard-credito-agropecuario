import { LineChart } from '@mui/x-charts/LineChart';
import type { PuntoMensual } from '../../types';
import { formatAxis } from '../../utils/format';

export interface SerieConfig {
  key: 'actual' | 'anterior';
  label: string;
  color: string;
  dashed?: boolean;
}

interface LineChartTrendProps {
  data: PuntoMensual[];
  series: SerieConfig[];
  valueFormatter?: (n: number) => string;
  height?: number;
  /** Muestra solo la inicial de cada mes (móvil). */
  shortLabels?: boolean;
}

/** Evolución mensual del monto: año seleccionado frente al anterior. */
export function LineChartTrend({ data, series, valueFormatter, height = 300, shortLabels = false }: LineChartTrendProps) {
  // Estilos: línea punteada para el año anterior y relleno suave del área.
  const estilos: Record<string, Record<string, string | number>> = { '& .MuiLineChart-area': { fillOpacity: 0.12 } };
  series
    .filter((s) => s.dashed)
    .forEach((s) => {
      estilos[`& .MuiLineChart-line[data-series="${s.key}"]`] = { strokeDasharray: '6 4', strokeWidth: 2 };
    });
  return (
    <LineChart
      height={height}
      hideLegend
      margin={{ left: 4, right: 12, top: 12, bottom: 4 }}
      xAxis={[
        {
          scaleType: 'point',
          data: data.map((d) => d.mes),
          valueFormatter: (m: string, ctx) => (shortLabels && ctx.location === 'tick' ? m.charAt(0) : m),
        },
      ]}
      yAxis={[{ valueFormatter: (v: number) => formatAxis(v), width: 48 }]}
      grid={{ horizontal: true }}
      series={series.map((s) => ({
        id: s.key,
        data: data.map((d) => d[s.key]),
        label: s.label,
        color: s.color,
        showMark: !s.dashed && !shortLabels,
        area: !s.dashed,
        curve: 'linear' as const,
        valueFormatter: (v: number | null) => (v === null ? '' : (valueFormatter ?? formatAxis)(v)),
      }))}
      sx={estilos}
    />
  );
}
