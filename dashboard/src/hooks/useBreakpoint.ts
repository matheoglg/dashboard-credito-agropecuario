import { useMediaQuery, useTheme } from '@mui/material';
import type { Breakpoint } from '../types';

/**
 * Devuelve el tamaño de pantalla según los breakpoints del tema:
 * mobile (< 768 px), tablet (768–1279 px) y desktop (≥ 1280 px).
 */
export function useBreakpoint(): Breakpoint {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  if (isMobile) return 'mobile';
  return isDesktop ? 'desktop' : 'tablet';
}
