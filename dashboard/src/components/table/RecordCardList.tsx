import { Pagination, Stack, Typography } from '@mui/material';
import { RecordCard } from './RecordCard';
import type { Registro } from '../../types';

interface RecordCardListProps {
  records: Registro[];
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

/** Lista de registros como tarjetas, con paginación. Reemplaza a la tabla en móvil. */
export function RecordCardList({ records, page, pageCount, onPageChange }: RecordCardListProps) {
  return (
    <Stack spacing={1.25}>
      {records.map((r) => (
        <RecordCard key={r.id} record={r} />
      ))}
      {records.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          No hay registros para los filtros seleccionados.
        </Typography>
      )}
      {pageCount > 1 && (
        <Pagination count={pageCount} page={page + 1} onChange={(_, p) => onPageChange(p - 1)} siblingCount={0} color="primary" sx={{ alignSelf: 'center', pt: 1 }} />
      )}
    </Stack>
  );
}
