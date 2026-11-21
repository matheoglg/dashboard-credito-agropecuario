import type { ReactNode } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material';

export interface Columna<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  /** Cómo se dibuja la celda; si no se envía se muestra row[key]. */
  render?: (row: T) => ReactNode;
  /** Oculta la columna en pantallas más angostas que este breakpoint ('lg' = 1280 px, 'xl' = 1536 px). */
  hideBelow?: 'lg' | 'xl';
}

interface DataTableProps<T extends { id: string }> {
  columns: Columna<T>[];
  rows: T[];
  totalItems: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  emptyMessage?: string;
}

/** Tabla genérica: recibe la definición de columnas y las filas de la página actual. */
export function DataTable<T extends { id: string }>({ columns, rows, totalItems, page, rowsPerPage, onPageChange, emptyMessage = 'No hay registros para los filtros seleccionados.' }: DataTableProps<T>) {
  const ocultar = (c: Columna<T>) => (c.hideBelow ? { display: { xs: 'none', [c.hideBelow]: 'table-cell' } } : {});
  return (
    <>
      <TableContainer>
        <Table size="small" sx={{ '& td, & th': { py: 1.25, whiteSpace: 'nowrap' } }}>
          <TableHead>
            <TableRow>
              {columns.map((c) => (
                <TableCell key={c.key} align={c.align} sx={ocultar(c)}>
                  {c.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} hover>
                {columns.map((c) => (
                  <TableCell key={c.key} align={c.align} sx={ocultar(c)}>
                    {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalItems}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[]}
        onPageChange={(_, p) => onPageChange(p)}
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count} registros`}
      />
    </>
  );
}
