import { Box, Typography } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import type { Categoria } from '../../types';

interface DonutChartProps {
  data: Categoria[];
  centerValue?: string;
  centerLabel?: string;
  size?: number;
  /** Se llama con el nombre de la categoría al hacer clic en un sector. */
  onSliceClick?: (name: string) => void;
}

/** Gráfico de dona con el total en el centro. */
export function DonutChart({ data, centerValue, centerLabel, size = 220, onSliceClick }: DonutChartProps) {
  return (
    <Box sx={{ position: 'relative', width: size, height: size, mx: 'auto', flexShrink: 0 }}>
      <PieChart
        width={size}
        height={size}
        hideLegend
        margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
        series={[
          {
            data: data.map((d) => ({ id: d.name, value: d.value, label: d.name, color: d.color })),
            innerRadius: size * 0.31,
            outerRadius: size * 0.48,
            paddingAngle: 1.5,
            cornerRadius: 4,
            highlightScope: { fade: 'global', highlight: 'item' },
          },
        ]}
        onItemClick={(_, item) => onSliceClick?.(data[item.dataIndex].name)}
        sx={{ cursor: onSliceClick ? 'pointer' : 'default' }}
      />
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        {centerValue && <Typography sx={{ fontWeight: 700, fontSize: size > 200 ? 18 : 15 }}>{centerValue}</Typography>}
        {centerLabel && (
          <Typography variant="caption" color="text.secondary">
            {centerLabel}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
