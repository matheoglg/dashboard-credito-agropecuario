"""
Genera data/firebase/resumenes.json a partir de los JSON por año del Sprint 1.

El archivo contiene los totales por año y provincia que usa el dashboard para los KPI y
los gráficos. Así la aplicación no necesita descargar los 298 865 registros (100 MB):
lee este resumen (unos pocos cientos de KB) y solo consulta registros puntuales para la tabla.

Uso (desde la raíz del repositorio):
  python scripts/generar_resumenes.py
"""
import json
import unicodedata
from collections import defaultdict
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ENTRADA = RAIZ / 'data' / 'processed'
SALIDA = RAIZ / 'data' / 'firebase' / 'resumenes.json'
SECTORES = ['Agrícola', 'Pecuario', 'Otros', 'Acuícola', 'Silvícola']


def orden_alfabetico(texto):
    """Ordena sin tildes, para que 'Cañar' quede antes de 'Carchi'."""
    return ''.join(c for c in unicodedata.normalize('NFD', texto) if unicodedata.category(c) != 'Mn')


def nuevo():
    return {'monto': 0.0, 'operaciones': 0, 'montoMujeres': 0.0, 'registros': 0,
            'mensual': [0.0] * 12, 'sectores': defaultdict(float)}


def main():
    indice = json.loads((ENTRADA / 'indice.json').read_text(encoding='utf-8'))
    por_anio, provincias, total = {}, set(), 0
    for archivo in indice['archivos']:
        registros = json.loads((ENTRADA / archivo['archivo']).read_text(encoding='utf-8'))
        grupos = defaultdict(nuevo)
        for r in registros:
            provincias.add(r['provincia'])
            for clave in ('Todas', r['provincia']):
                g = grupos[clave]
                g['monto'] += r['valorUsd']
                g['operaciones'] += r['numOperaciones'] or 0
                g['registros'] += 1
                g['mensual'][r['mes'] - 1] += r['valorUsd']
                g['sectores'][r['sector']] += r['valorUsd']
                if r['genero'] == 'Femenino':
                    g['montoMujeres'] += r['valorUsd']
        por_anio[str(archivo['anio'])] = {
            prov: {
                'monto': round(g['monto'], 2),
                'operaciones': g['operaciones'],
                'montoMujeres': round(g['montoMujeres'], 2),
                'registros': g['registros'],
                'mensual': [round(v, 2) for v in g['mensual']],
                'sectores': {s: round(g['sectores'][s], 2) for s in SECTORES if g['sectores'].get(s)},
            }
            for prov, g in grupos.items()
        }
        total += len(registros)

    resultado = {
        'catalogos': {
            'anios': sorted((int(a) for a in por_anio), reverse=True),
            'provincias': sorted(provincias, key=orden_alfabetico),
            'sectores': SECTORES,
            'totalRegistros': total,
        },
        'porAnio': por_anio,
    }
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(resultado, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'Años: {len(por_anio)} · provincias: {len(provincias)} · registros resumidos: {total:,}')
    print(f'Archivo: {SALIDA.relative_to(RAIZ)} ({SALIDA.stat().st_size / 1024:.0f} KB)')


if __name__ == '__main__':
    main()
