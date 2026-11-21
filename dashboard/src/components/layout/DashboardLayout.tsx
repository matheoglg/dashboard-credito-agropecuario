import type { ReactNode } from 'react';
import { Box, Container, Stack } from '@mui/material';
import type { Breakpoint } from '../../types';

interface DashboardLayoutProps {
  header: ReactNode;
  children: ReactNode;
  breakpoint: Breakpoint;
  /** Navegación inferior; solo se envía en móvil. */
  bottomNav?: ReactNode;
}

/** Estructura general: encabezado arriba, secciones en columna y navegación inferior en móvil. */
export function DashboardLayout({ header, children, breakpoint, bottomNav }: DashboardLayoutProps) {
  const isMobile = breakpoint === 'mobile';
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: isMobile ? 11 : 4 }}>
      {isMobile && header}
      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 3, lg: 5 }, pt: isMobile ? 2 : 4 }}>
        <Stack spacing={isMobile ? 2 : 3}>
          {!isMobile && header}
          {children}
        </Stack>
      </Container>
      {isMobile && bottomNav}
    </Box>
  );
}
