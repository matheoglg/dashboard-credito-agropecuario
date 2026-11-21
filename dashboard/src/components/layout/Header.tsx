import { AppBar, Box, Button, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { alpha } from '@mui/material/styles';

interface HeaderProps {
  title: string;
  subtitle?: string;
  source: string;
  cutoffDate: string;
  onExport: () => void;
  /** Versión reducida para móvil. */
  compact?: boolean;
}

/** Encabezado del dashboard: título, fuente, fecha de corte y botón de exportar. */
export function Header({ title, subtitle, source, cutoffDate, onExport, compact = false }: HeaderProps) {
  if (compact) {
    return (
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 1, minHeight: 64 }}>
          <IconButton edge="start" aria-label="Menú">
            <MenuRoundedIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 17 }} noWrap>
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap component="p">
              {source} · Corte: {cutoffDate}
            </Typography>
          </Box>
          <IconButton
            onClick={onExport}
            aria-label="Exportar CSV"
            sx={{ bgcolor: 'primary.light', color: 'primary.main', borderRadius: 2 }}
          >
            <DownloadRoundedIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <Stack
      component="header"
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}
    >
      <Box>
        <Typography variant="overline" color="primary" component="p">
          {source}
        </Typography>
        <Typography variant="h4" component="h1">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexShrink: 0 }}>
        <Box
          sx={(t) => ({
            px: 1.5,
            py: 0.75,
            borderRadius: 5,
            bgcolor: alpha(t.palette.primary.main, 0.1),
            color: 'primary.main',
            fontSize: 12,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          })}
        >
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
          Datos al corte: {cutoffDate}
        </Box>
        <Button variant="contained" startIcon={<DownloadRoundedIcon />} onClick={onExport}>
          Exportar CSV
        </Button>
      </Stack>
    </Stack>
  );
}
