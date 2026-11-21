import { Card, Stack, Typography } from '@mui/material';
import { Badge } from '../common/Badge';
import type { Registro } from '../../types';
import { formatCurrency } from '../../utils/format';
import { COLORES_SECTOR } from '../../utils/aggregate';

interface RecordCardProps {
  record: Registro;
}

/** Un registro mostrado como tarjeta (versión móvil de una fila de la tabla). */
export function RecordCard({ record }: RecordCardProps) {
  return (
    <Card sx={{ p: 1.75 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 14 }} noWrap>
          {record.canton}, {record.provincia}
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{formatCurrency(record.valorUsd)}</Typography>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1, minWidth: 0 }}>
        <Badge label={record.sector} color={COLORES_SECTOR[record.sector]} />
        <Typography variant="caption" color="text.secondary" noWrap>
          {record.producto} · {record.periodo}
        </Typography>
      </Stack>
    </Card>
  );
}
