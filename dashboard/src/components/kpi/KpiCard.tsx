import { Box, Card, Stack, Typography } from '@mui/material';
import { Badge } from '../common/Badge';
import type { FormatoKpi } from '../../types';
import { formatCurrency, formatDelta, formatNumber, formatPercent } from '../../utils/format';

interface KpiCardProps {
  label: string;
  value: number;
  format: FormatoKpi;
  /** Variación frente al año anterior; define el color de la etiqueta. */
  delta?: number | null;
  deltaLabel?: string;
  compact?: boolean;
}

const FORMATOS: Record<FormatoKpi, (v: number) => string> = {
  currency: formatCurrency,
  number: formatNumber,
  percent: formatPercent,
};

/** Tarjeta de un indicador (KPI). */
export function KpiCard({ label, value, format, delta = null, deltaLabel, compact = false }: KpiCardProps) {
  const unidad = format === 'percent' ? 'pp' : '%';
  return (
    <Card sx={{ p: compact ? 1.75 : 2.5, height: '100%', position: 'relative' }}>
      {!compact && <Box sx={{ position: 'absolute', left: 0, top: 20, width: 3, height: 18, bgcolor: 'primary.main', borderRadius: 2 }} />}
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: compact ? 12 : 14 }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 700, fontSize: compact ? 20 : 28, my: compact ? 0.5 : 1, lineHeight: 1.25 }}>
        {FORMATOS[format](value)}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 0.5 }}>
        {delta !== null ? (
          <Badge label={formatDelta(delta, unidad)} tone={delta >= 0 ? 'success' : 'danger'} />
        ) : (
          <Badge label="Sin dato previo" />
        )}
        {deltaLabel && (
          <Typography variant="caption" color="text.secondary">
            {deltaLabel}
          </Typography>
        )}
      </Stack>
    </Card>
  );
}
