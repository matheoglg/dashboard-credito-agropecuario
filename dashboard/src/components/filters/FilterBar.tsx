import { Button, Card, Grid, Stack } from '@mui/material';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';
import { SelectFilter } from './SelectFilter';
import type { Filtros, Opcion } from '../../types';

export interface OpcionesFiltro {
  anios: Opcion[];
  provincias: Opcion[];
  sectores: Opcion[];
}

interface FilterBarProps {
  filters: Filtros;
  options: OpcionesFiltro;
  onFilterChange: (clave: keyof Filtros, valor: string | null) => void;
  onClear: () => void;
  /** "bar" en escritorio y tablet, "chips" en móvil. */
  variant?: 'bar' | 'chips';
}

/** Agrupa los filtros del dashboard. No guarda estado: avisa cada cambio al componente padre. */
export function FilterBar({ filters, options, onFilterChange, onClear, variant = 'bar' }: FilterBarProps) {
  const campos = [
    { clave: 'anio' as const, label: 'Año', value: String(filters.anio), options: options.anios, placeholder: undefined },
    { clave: 'provincia' as const, label: 'Provincia', value: filters.provincia, options: options.provincias, placeholder: 'Todas las provincias' },
    { clave: 'sector' as const, label: 'Sector productivo', value: filters.sector, options: options.sectores, placeholder: 'Todos los sectores' },
  ];

  if (variant === 'chips') {
    return (
      <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5, mx: -2, px: 2, scrollbarWidth: 'none' }}>
        {campos.map((c) => (
          <SelectFilter key={c.clave} variant="chip" label={c.label} value={c.value} options={c.options} placeholder={c.placeholder} onChange={(v) => onFilterChange(c.clave, v)} />
        ))}
      </Stack>
    );
  }

  return (
    <Card sx={{ p: 2.5 }}>
      <Grid container spacing={2} sx={{ alignItems: 'center' }}>
        {campos.map((c) => (
          <Grid key={c.clave} size={{ xs: 12, sm: 6, lg: 3 }}>
            <SelectFilter label={c.label} value={c.value} options={c.options} placeholder={c.placeholder} onChange={(v) => onFilterChange(c.clave, v)} />
          </Grid>
        ))}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }} sx={{ display: 'flex', justifyContent: { lg: 'flex-end' } }}>
          <Button variant="outlined" color="inherit" startIcon={<FilterAltOffRoundedIcon />} onClick={onClear} sx={{ borderColor: 'divider', height: 40 }}>
            Limpiar filtros
          </Button>
        </Grid>
      </Grid>
    </Card>
  );
}
