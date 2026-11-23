// Consultas a Firebase Realtime Database. Los componentes no llaman a Firebase directamente:
// usan estas funciones a través de los hooks useResumenes y useRegistros.
import { equalTo, get, limitToLast, orderByChild, query, ref } from 'firebase/database';
import { db } from '../firebase/firebase';
import type { DatosResumen, Registro } from '../types';

/** Cantidad máxima de registros que se piden para la tabla cuando no hay provincia seleccionada. */
export const LIMITE_REGISTROS = 200;

/** Lee una sola vez el nodo /resumenes (totales por año y provincia y catálogos de filtros). */
export async function obtenerResumenes(): Promise<DatosResumen> {
  const snapshot = await get(ref(db, 'resumenes'));
  if (!snapshot.exists()) {
    throw new Error('No se encontró el nodo /resumenes en la base de datos.');
  }
  return snapshot.val() as DatosResumen;
}

/**
 * Lee los registros de un año desde /registros/{anio}.
 * - Sin provincia: los LIMITE_REGISTROS de mayor monto (orderByChild + limitToLast).
 * - Con provincia: todos los registros de esa provincia (orderByChild + equalTo).
 * Las dos consultas usan los índices definidos en las reglas (.indexOn).
 */
export async function obtenerRegistros(anio: number, provincia: string | null): Promise<Registro[]> {
  const nodo = ref(db, `registros/${anio}`);
  const consulta = provincia
    ? query(nodo, orderByChild('provincia'), equalTo(provincia))
    : query(nodo, orderByChild('valorUsd'), limitToLast(LIMITE_REGISTROS));

  const snapshot = await get(consulta);
  const registros: Registro[] = [];
  snapshot.forEach((hijo) => {
    registros.push(hijo.val() as Registro);
  });
  // Mayor monto primero.
  return registros.sort((a, b) => b.valorUsd - a.valorUsd);
}

/** Convierte el error de Firebase en un mensaje que se puede mostrar en pantalla. */
export function describirError(error: unknown): string {
  const texto = error instanceof Error ? error.message : String(error);
  if (/permission[_ ]denied/i.test(texto)) {
    return 'Firebase negó el acceso a los datos (permission_denied). Revisa las reglas de Realtime Database.';
  }
  return `No se pudieron cargar los datos desde Firebase: ${texto}`;
}
