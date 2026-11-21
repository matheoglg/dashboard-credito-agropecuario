import { Box, Stack, Typography } from '@mui/material';

export interface LegendItem {
  label: string;
  color: string;
  value?: string;
  dashed?: boolean;
}

interface ChartLegendProps {
  items: LegendItem[];
  direction?: 'row' | 'column';
}

/** Leyenda reutilizable para los gráficos. */
export function ChartLegend({ items, direction = 'row' }: ChartLegendProps) {
  return (
    <Stack direction={direction} spacing={direction === 'row' ? 2 : 1.25} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
      {items.map((item) => (
        <Stack key={item.label} direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Box
            sx={
              item.dashed
                ? { width: 18, borderTop: `2px dashed ${item.color}` }
                : { width: 12, height: 12, borderRadius: '3px', bgcolor: item.color, flexShrink: 0 }
            }
          />
          <Typography variant="body2" sx={{ fontWeight: 500, flexGrow: 1 }}>
            {item.label}
          </Typography>
          {item.value && (
            <Typography variant="body2" sx={{ fontWeight: 600, pl: 1 }}>
              {item.value}
            </Typography>
          )}
        </Stack>
      ))}
    </Stack>
  );
}
