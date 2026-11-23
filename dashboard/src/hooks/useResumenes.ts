import { useEffect, useState } from 'react';
import { describirError, obtenerResumenes } from '../services/creditoService';
import type { DatosResumen } from '../types';

/** Carga el nodo /resumenes una sola vez, cuando se monta el componente que usa el hook. */
export function useResumenes() {
  const [datos, setDatos] = useState<DatosResumen | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true; // evita actualizar el estado si el componente ya se desmontó

    const cargar = async () => {
      try {
        const resultado = await obtenerResumenes();
        if (activo) setDatos(resultado);
      } catch (e) {
        if (activo) setError(describirError(e));
      } finally {
        if (activo) setCargando(false);
      }
    };

    void cargar();
    return () => {
      activo = false;
    };
  }, []); // [] = solo cuando se carga el componente

  return { datos, cargando, error };
}
