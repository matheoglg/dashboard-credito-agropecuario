// Tipos compartidos por los componentes del dashboard (definidos en la Fase 3).

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

/** Un registro del dataset ya transformado en el Sprint 1. */
export interface Registro {
  id: string;
  periodo: string; // AAAA-MM
  anio: number;
  provincia: string;
  canton: string;
  sector: string;
  producto: string;
  genero: string;
  institucion: string;
  valorUsd: number;
  numOperaciones: number | null;
}

/** Totales de un año para todo el país o para una provincia. */
export interface Resumen {
  monto: number;
  operaciones: number;
  montoMujeres: number;
  mensual: number[]; // 12 valores, enero a diciembre
  sectores: Record<string, number>;
}

/** Filtros seleccionados por el usuario. null = todas las opciones. */
export interface Filtros {
  anio: number;
  provincia: string | null;
  sector: string | null;
}

export type FormatoKpi = 'currency' | 'number' | 'percent';

export interface Kpi {
  id: string;
  label: string;
  value: number;
  format: FormatoKpi;
  delta: number | null; // variación frente al año anterior
  deltaLabel: string;
}

export interface Opcion {
  value: string;
  label: string;
}

export interface PuntoMensual {
  mes: string;
  actual: number;
  anterior: number;
}

export interface Categoria {
  name: string;
  value: number;
  color?: string;
}
