import type { ReactNode } from 'react';
import { Alert, AlertTitle, Box, CircularProgress, Typography } from '@mui/material';

interface DataStatusProps {
  cargando: boolean;
  error: string | null;
  mensajeCarga?: string;
  minHeight?: number;
  children: ReactNode;
}

/** Muestra un indicador mientras se cargan los datos, un aviso si hubo error o el contenido cuando ya están listos. */
export function DataStatus({ cargando, error, mensajeCarga = 'Cargando datos desde Firebase…', minHeight = 160, children }: DataStatusProps) {
  if (error) {
    return (
      <Alert severity="error" variant="outlined">
        <AlertTitle>Error de conexión</AlertTitle>
        {error}
      </Alert>
    );
  }
  if (cargando) {
    return (
      <Box sx={{ minHeight, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
        <CircularProgress size={32} />
        <Typography variant="body2" color="text.secondary">
          {mensajeCarga}
        </Typography>
      </Box>
    );
  }
  return <>{children}</>;
}
