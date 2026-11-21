// Funciones para mostrar cifras con el formato usado en Ecuador (es-EC).

const numero = (decimales: number) =>
  new Intl.NumberFormat('es-EC', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });

/** 3217981 -> "$ 3,22 M" · 49950 -> "$ 49,9 mil" · 50 -> "$ 50,00" */
export function formatCurrency(valor: number): string {
  const abs = Math.abs(valor);
  if (abs >= 1_000_000) return `$ ${numero(2).format(valor / 1_000_000)} M`;
  if (abs >= 10_000) return `$ ${numero(1).format(valor / 1_000)} mil`;
  return `$ ${numero(2).format(valor)}`;
}

/** Versión corta para ejes de gráficos: 250000 -> "250k" */
export function formatAxis(valor: number): string {
  const abs = Math.abs(valor);
  if (abs >= 1_000_000) return `${numero(1).format(valor / 1_000_000)}M`;
  if (abs >= 1_000) return `${numero(0).format(valor / 1_000)}k`;
  return numero(0).format(valor);
}

export function formatNumber(valor: number): string {
  return numero(0).format(valor);
}

export function formatPercent(valor: number): string {
  return `${numero(1).format(valor)} %`;
}

/** Variación con signo: 9.7 -> "+9,7 %" */
export function formatDelta(valor: number, unidad: '%' | 'pp' = '%'): string {
  const signo = valor > 0 ? '+' : '';
  return `${signo}${numero(1).format(valor)} ${unidad}`;
}
