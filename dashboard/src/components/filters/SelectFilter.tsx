import { useState } from 'react';
import { Chip, FormControl, InputLabel, ListItemText, Menu, MenuItem, Select } from '@mui/material';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import type { Opcion } from '../../types';

interface SelectFilterProps {
  label: string;
  value: string | null;
  options: Opcion[];
  /** Texto cuando no hay selección (por ejemplo, "Todas las provincias"). Si no se envía, el filtro es obligatorio. */
  placeholder?: string;
  onChange: (valor: string | null) => void;
  /** "select" en escritorio, "chip" en móvil. */
  variant?: 'select' | 'chip';
}

const TODAS = '__todas__';

/** Filtro desplegable reutilizable con dos presentaciones. */
export function SelectFilter({ label, value, options, placeholder, onChange, variant = 'select' }: SelectFilterProps) {
  // Elemento al que se ancla el menú en la variante chip (null = menú cerrado).
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const textoActual = options.find((o) => o.value === value)?.label ?? placeholder ?? label;
  const elegir = (v: string) => onChange(v === TODAS ? null : v);

  if (variant === 'chip') {
    const activo = value !== null && placeholder !== undefined;
    return (
      <>
        <Chip
          label={textoActual}
          onClick={(e) => setAnchor(e.currentTarget)}
          onDelete={(e) => setAnchor((e.currentTarget as HTMLElement).parentElement)}
          deleteIcon={<ArrowDropDownRoundedIcon />}
          color={activo ? 'primary' : 'default'}
          variant={activo ? 'filled' : 'outlined'}
          sx={{ height: 36, borderRadius: 18, fontWeight: 500, bgcolor: activo ? undefined : 'background.paper', flexShrink: 0 }}
        />
        <Menu anchorEl={anchor} open={anchor !== null} onClose={() => setAnchor(null)} slotProps={{ paper: { sx: { maxHeight: 360 } } }}>
          {placeholder && (
            <MenuItem selected={value === null} onClick={() => { elegir(TODAS); setAnchor(null); }}>
              <ListItemText>{placeholder}</ListItemText>
            </MenuItem>
          )}
          {options.map((o) => (
            <MenuItem key={o.value} selected={o.value === value} onClick={() => { elegir(o.value); setAnchor(null); }}>
              <ListItemText>{o.label}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }

  const id = `filtro-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <FormControl fullWidth size="small">
      <InputLabel id={id}>{label}</InputLabel>
      <Select
        labelId={id}
        label={label}
        value={value ?? (placeholder ? TODAS : '')}
        onChange={(e) => elegir(e.target.value)}
        sx={{ bgcolor: '#FAFBFA' }}
        MenuProps={{ slotProps: { paper: { sx: { maxHeight: 360 } } } }}
      >
        {placeholder && <MenuItem value={TODAS}>{placeholder}</MenuItem>}
        {options.map((o) => (
          <MenuItem key={o.value} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
