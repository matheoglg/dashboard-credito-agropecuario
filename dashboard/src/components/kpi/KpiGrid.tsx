import { Grid } from '@mui/material';
import { KpiCard } from './KpiCard';
import type { Kpi } from '../../types';

interface KpiGridProps {
  items: Kpi[];
  /** Columnas por fila: 4 en escritorio, 2 en tablet y móvil. */
  columns?: number;
  compact?: boolean;
}

/** Crea una KpiCard por cada indicador del arreglo. */
export function KpiGrid({ items, columns = 4, compact = false }: KpiGridProps) {
  return (
    <Grid container spacing={compact ? 1.5 : 2.5}>
      {items.map((kpi) => (
        <Grid key={kpi.id} size={12 / columns}>
          <KpiCard
            label={kpi.label}
            value={kpi.value}
            format={kpi.format}
            delta={kpi.delta}
            deltaLabel={kpi.deltaLabel}
            compact={compact}
          />
        </Grid>
      ))}
    </Grid>
  );
}
