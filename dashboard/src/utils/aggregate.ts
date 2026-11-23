// Cálculos a partir de los resúmenes leídos desde Firebase (/resumenes).
// DashboardPage los usa para preparar la información que reciben los componentes por props.
import type { Categoria, DatosResumen, Kpi, PuntoMensual, Resumen } from '../types';

export const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export const COLORES_SECTOR: Record<string, string> = {
  Agrícola: '#1E6B47',
  Pecuario: '#D99A1E',
  Otros: '#2E6A96',
  Acuícola: '#6FB08C',
  Silvícola: '#C9B48A',
};

const VACIO: Resumen = { monto: 0, operaciones: 0, montoMujeres: 0, mensual: Array(12).fill(0), sectores: {} };

export function getResumen(datos: DatosResumen | null, anio: number, provincia: string | null): Resumen {
  return datos?.porAnio?.[String(anio)]?.[provincia ?? 'Todas'] ?? VACIO;
}

const variacion = (actual: number, anterior: number) => (anterior > 0 ? ((actual - anterior) / anterior) * 100 : null);

export function buildKpis(actual: Resumen, anterior: Resumen, anioAnterior: number): Kpi[] {
  const promedio = (r: Resumen) => (r.operaciones > 0 ? r.monto / r.operaciones : 0);
  const pctMujeres = (r: Resumen) => (r.monto > 0 ? (r.montoMujeres / r.monto) * 100 : 0);
  const etiqueta = `vs. ${anioAnterior}`;
  return [
    { id: 'monto', label: 'Monto total otorgado', value: actual.monto, format: 'currency', delta: variacion(actual.monto, anterior.monto), deltaLabel: etiqueta },
    { id: 'operaciones', label: 'Operaciones de crédito', value: actual.operaciones, format: 'number', delta: variacion(actual.operaciones, anterior.operaciones), deltaLabel: etiqueta },
    { id: 'promedio', label: 'Monto promedio por operación', value: promedio(actual), format: 'currency', delta: variacion(promedio(actual), promedio(anterior)), deltaLabel: etiqueta },
    {
      id: 'mujeres',
      label: 'Monto otorgado a mujeres',
      value: pctMujeres(actual),
      format: 'percent',
      delta: anterior.monto > 0 ? pctMujeres(actual) - pctMujeres(anterior) : null,
      deltaLabel: etiqueta,
    },
  ];
}

export function serieMensual(actual: Resumen, anterior: Resumen): PuntoMensual[] {
  return MESES.map((mes, i) => ({ mes, actual: actual.mensual[i], anterior: anterior.mensual[i] }));
}

export function distribucionSectores(resumen: Resumen): Categoria[] {
  // Firebase no guarda objetos vacíos, por eso se usa ?? {}
  return Object.entries(resumen.sectores ?? {})
    .map(([name, value]) => ({ name, value, color: COLORES_SECTOR[name] ?? '#A9B3AE' }))
    .sort((a, b) => b.value - a.value);
}

export function rankingProvincias(datos: DatosResumen | null, anio: number): Categoria[] {
  const provincias = datos?.catalogos.provincias ?? [];
  return provincias
    .map((name) => ({ name, value: getResumen(datos, anio, name).monto }))
    .filter((p) => p.value > 0)
    .sort((a, b) => b.value - a.value);
}
