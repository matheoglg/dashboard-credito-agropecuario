import type { ReactNode } from 'react';
import { Box, Card, Stack, Typography } from '@mui/material';

interface PanelProps {
  title: string;
  subtitle?: string;
  /** Contenido a la derecha del título (leyenda, buscador, etc.). */
  actions?: ReactNode;
  children: ReactNode;
  id?: string;
}

/** Tarjeta contenedora para gráficos y tablas. Todos los paneles comparten el mismo estilo. */
export function Panel({ title, subtitle, actions, children, id }: PanelProps) {
  return (
    <Card id={id} sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: { xs: 2, md: 3 }, scrollMarginTop: 80 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ mb: 2, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'flex-start' } }}
      >
        <Box>
          <Typography variant="h6">{title}</Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
      </Stack>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>{children}</Box>
    </Card>
  );
}
