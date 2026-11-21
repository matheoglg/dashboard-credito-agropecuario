import { InputAdornment, TextField } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

interface SearchInputProps {
  value: string;
  placeholder?: string;
  onChange: (texto: string) => void;
}

/** Campo de búsqueda controlado por el componente padre. */
export function SearchInput({ value, placeholder = 'Buscar…', onChange }: SearchInputProps) {
  return (
    <TextField
      size="small"
      fullWidth
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      sx={{ minWidth: { sm: 260 }, '& .MuiOutlinedInput-root': { bgcolor: '#FAFBFA' } }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon fontSize="small" />
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
