import { Container, Typography } from '@mui/material';

// Pantalla temporal: se reemplaza por DashboardPage al integrar los componentes.
export default function App() {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1">
        Crédito público agropecuario
      </Typography>
      <Typography color="text.secondary">Proyecto configurado con Vite, React, TypeScript y Material UI.</Typography>
    </Container>
  );
}
