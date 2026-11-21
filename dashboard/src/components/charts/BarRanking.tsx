import { ButtonBase, LinearProgress, Stack, Typography } from '@mui/material';
import type { Categoria } from '../../types';

interface BarRankingProps {
  data: Categoria[];
  /** Cantidad de barras: 8 en escritorio, 5 en móvil. */
  limit?: number;
  /** Elemento resaltado (por ejemplo, la provincia seleccionada en el filtro). */
  highlight?: string | null;
  valueFormatter?: (n: number) => string;
  onBarClick?: (name: string) => void;
}

/** Ranking horizontal ordenado de mayor a menor. */
export function BarRanking({ data, limit = 8, highlight = null, valueFormatter = String, onBarClick }: BarRankingProps) {
  const visibles = data.slice(0, limit);
  const max = visibles[0]?.value ?? 1;
  return (
    <Stack spacing={1.5}>
      {visibles.map((item, i) => {
        const activo = item.name === highlight;
        return (
          <ButtonBase
            key={item.name}
            onClick={() => onBarClick?.(item.name)}
            disabled={!onBarClick}
            sx={{ display: 'block', textAlign: 'left', borderRadius: 2, p: 0.75, mx: -0.75, bgcolor: activo ? 'primary.light' : 'transparent' }}
          >
            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.75 }}>
              <Typography variant="body2" sx={{ fontWeight: activo ? 700 : 500 }}>
                {i + 1}. {item.name}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {valueFormatter(item.value)}
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={(item.value / max) * 100}
              color={activo ? 'secondary' : 'primary'}
              sx={{ height: 10, borderRadius: 5, bgcolor: '#EDF0ED', '& .MuiLinearProgress-bar': { borderRadius: 5, opacity: activo || i < 3 ? 1 : 0.65 } }}
            />
          </ButtonBase>
        );
      })}
    </Stack>
  );
}
