import { Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';

type Tono = 'success' | 'danger' | 'neutral';

interface BadgeProps {
  label: string;
  tone?: Tono;
  /** Color propio; si se envía tiene prioridad sobre tone (se usa para los sectores). */
  color?: string;
}

const COLOR_TONO: Record<Tono, string> = { success: '#1E6B47', danger: '#B3261E', neutral: '#5E6B64' };

/** Etiqueta pequeña de color: fecha de corte, variación de los KPI y sector de un registro. */
export function Badge({ label, tone = 'neutral', color }: BadgeProps) {
  const base = color ?? COLOR_TONO[tone];
  return (
    <Chip
      label={label}
      size="small"
      sx={{ bgcolor: alpha(base, 0.12), color: base, fontWeight: 600, fontSize: 12, height: 24, borderRadius: '12px' }}
    />
  );
}
