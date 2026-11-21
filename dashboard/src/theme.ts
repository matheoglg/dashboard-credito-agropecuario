import { createTheme } from '@mui/material/styles';

// Colores y tipografía del prototipo de la Fase 2.
export const theme = createTheme({
  breakpoints: {
    values: { xs: 0, sm: 600, md: 768, lg: 1280, xl: 1536 },
  },
  palette: {
    primary: { main: '#1E6B47', light: '#E3F0E8', contrastText: '#FFFFFF' },
    secondary: { main: '#D99A1E' },
    success: { main: '#1E6B47' },
    error: { main: '#B3261E' },
    background: { default: '#F3F5F2', paper: '#FFFFFF' },
    text: { primary: '#17241D', secondary: '#5E6B64' },
    divider: '#E1E6E2',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, fontSize: '1.75rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    overline: { fontWeight: 600, letterSpacing: '0.06em', lineHeight: 1.6 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: { root: { borderColor: '#E1E6E2', boxShadow: '0 1px 3px rgba(23,36,29,0.06)' } },
    },
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiTableCell: {
      styleOverrides: {
        head: { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#5E6B64', backgroundColor: '#F6F8F6' },
      },
    },
  },
});
