import { useEffect, useState } from 'react';
import { describirError, obtenerRegistros } from '../services/creditoService';
import type { Registro } from '../types';

/** Consulta los registros de la tabla cada vez que cambia el año o la provincia. */
export function useRegistros(anio: number, provincia: string | null) {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si el usuario cambia de filtro antes de que llegue la respuesta, la respuesta vieja se ignora.
    let activo = true;

    const cargar = async () => {
      setCargando(true);
      setError(null);
      try {
        const resultado = await obtenerRegistros(anio, provincia);
        if (activo) setRegistros(resultado);
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
  }, [anio, provincia]); // se vuelve a ejecutar cuando cambia alguno de estos valores

  return { registros, cargando, error };
}
