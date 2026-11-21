import type { ReactNode } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';

export interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

interface BottomNavProps {
  items: NavItem[];
  activeId: string;
  onNavigate: (id: string) => void;
}

/** Navegación inferior fija. Solo se muestra en móvil. */
export function BottomNav({ items, activeId, onNavigate }: BottomNavProps) {
  return (
    <Paper
      elevation={0}
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: 1, borderColor: 'divider', zIndex: (t) => t.zIndex.appBar }}
    >
      <BottomNavigation showLabels value={activeId} onChange={(_, id: string) => onNavigate(id)} sx={{ height: 68 }}>
        {items.map((item) => (
          <BottomNavigationAction key={item.id} value={item.id} label={item.label} icon={item.icon} />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
