"""
Transforma el CSV de Crédito Público Agropecuario (MAG - Datos Abiertos Ecuador) a JSON.

Pasos:
  1. Lee el CSV detectando codificación (UTF-8 / Latin-1) y separador (; , o tab).
  2. Limpia espacios en blanco y unifica variantes de mayúsculas/minúsculas.
  3. Convierte tipos: numéricas -> number, categóricas -> string, temporales -> fecha ISO.
  4. Trata valores faltantes o inconsistentes y los registra.
  5. Escribe un JSON por año (para que ningún archivo pase el límite de 100 MB de GitHub),
     un índice, una muestra legible y un reporte de validación.
  6. Vuelve a leer los JSON generados y valida estructura, tipos y cantidad de registros.

Uso:
  python scripts/transformar_csv_json.py
  python scripts/transformar_csv_json.py --entrada data/raw/archivo.csv.zip

El CSV puede estar suelto (.csv) o comprimido (.csv.zip).
"""
import argparse
import csv
import json
import re
import sys
import unicodedata
import zipfile
from collections import Counter, defaultdict
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ENTRADA = RAIZ / 'data' / 'raw' / 'mag_creditopublicoagropecuario_2026octubre.csv'
SALIDA = RAIZ / 'data' / 'processed'

# columna del CSV -> (campo en JSON, tipo)
ESQUEMA = {
    'CP_ANIO': ('anio', 'int'),
    'CP_MES': ('mes', 'mes'),
    'DPA_PROVIN': ('codProvincia', 'codigo'),
    'DPA_DESPRO': ('provincia', 'str'),
    'DPA_DESCAN': ('canton', 'str'),
    'CP_SECTOR': ('sector', 'str'),
    'CP_SUBSECTOR': ('subsector', 'str'),
    'CP_PRODUCTO_ORIGINAL': ('productoOriginal', 'str'),
    'CP_PRODUCTO_HOMOLOGADO': ('producto', 'str'),
    'CP_GENERO': ('genero', 'str'),
    'CP_INSTITUCION': ('institucion', 'str'),
    'CP_VALOR_USD': ('valorUsd', 'float'),
    'CP_NUM_OPERACIONES': ('numOperaciones', 'int'),
}
OBLIGATORIAS = ['CP_ANIO', 'CP_MES', 'CP_VALOR_USD']        # sin ellas el registro no sirve para el dashboard
VACIOS = {'', 'NA', 'N/A', 'NULL', 'NONE', 'NAN', '-', '--', 'S/D', 'SIN DATO'}
SIN_DATO = 'NO REGISTRADO'
MESES = {'ENERO': 1, 'FEBRERO': 2, 'MARZO': 3, 'ABRIL': 4, 'MAYO': 5, 'JUNIO': 6, 'JULIO': 7, 'AGOSTO': 8,
         'SEPTIEMBRE': 9, 'SETIEMBRE': 9, 'OCTUBRE': 10, 'NOVIEMBRE': 11, 'DICIEMBRE': 12}


def sin_tildes(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')


def limpiar(v):
    """Quita espacios al inicio/fin, saltos de línea y espacios repetidos."""
    if v is None:
        return ''
    return re.sub(r'\s+', ' ', str(v).replace('﻿', '')).strip()


def es_vacio(v):
    return limpiar(v).upper() in VACIOS


def a_numero(v):
    """Acepta 1234.5 · 1234,5 · 1.234,5 · 1,234.5 · $ 1 234,50. Devuelve float o None."""
    s = limpiar(v).replace('$', '').replace(' ', '')
    if not s:
        return None
    if ',' in s and '.' in s:
        s = s.replace('.', '').replace(',', '.') if s.rfind(',') > s.rfind('.') else s.replace(',', '')
    elif ',' in s:
        s = s.replace(',', '.') if s.count(',') == 1 else s.replace(',', '')   # 1234,5 -> decimal; 1,234,567 -> miles
    try:
        return float(s)
    except ValueError:
        return None


def a_mes(v):
    s = sin_tildes(limpiar(v)).upper()
    if s in MESES:
        return MESES[s]
    n = a_numero(s)
    return int(n) if n is not None and n == int(n) and 1 <= n <= 12 else None


def leer_csv(ruta):
    if ruta.suffix.lower() == '.zip':
        with zipfile.ZipFile(ruta) as z:
            nombre = next(n for n in z.namelist() if n.lower().endswith('.csv'))
            crudo = z.read(nombre)
    else:
        crudo = ruta.read_bytes()
    for cod in ('utf-8-sig', 'cp1252', 'latin-1'):
        try:
            texto = crudo.decode(cod)
            break
        except UnicodeDecodeError:
            continue
    primera = texto.splitlines()[0]
    sep = max([';', ',', '\t', '|'], key=primera.count)
    lector = csv.reader(texto.splitlines(), delimiter=sep)
    cab = [sin_tildes(limpiar(c)).upper() for c in next(lector)]
    filas = [f for f in lector if any(limpiar(x) for x in f)]
    return cab, filas, cod, sep


def transformar(entrada, salida):
    cab, filas, cod, sep = leer_csv(entrada)
    rep = {'archivo_entrada': entrada.name, 'codificacion': cod, 'separador': sep,
           'registros_csv': len(filas), 'columnas_csv': cab}
    faltan = [c for c in ESQUEMA if c not in cab]
    extra = [c for c in cab if c not in ESQUEMA]
    if faltan:
        sys.exit(f'ERROR: el CSV no tiene las columnas {faltan}. Columnas encontradas: {cab}')
    idx = {c: cab.index(c) for c in ESQUEMA}

    vacios = Counter()          # faltantes por columna
    invalidos = Counter()       # valores que no se pudieron convertir
    descartes = Counter()       # motivo -> cantidad
    ejemplos_descarte = []
    espacios = Counter()        # celdas a las que se les quitó espacios
    registros = []

    for n, fila in enumerate(filas, start=2):          # n = número de línea en el CSV
        fila = fila + [''] * (len(cab) - len(fila))
        reg, motivo = {}, None
        for col, (campo, tipo) in ESQUEMA.items():
            bruto = fila[idx[col]]
            if bruto != limpiar(bruto):
                espacios[col] += 1
            if es_vacio(bruto):
                vacios[col] += 1
                valor = None
            elif tipo == 'str':
                valor = limpiar(bruto)
            elif tipo == 'codigo':
                valor = limpiar(bruto)
                valor = valor.zfill(2) if valor.isdigit() else valor
            elif tipo == 'mes':
                valor = a_mes(bruto)
            else:
                valor = a_numero(bruto)
                if valor is not None and tipo == 'int':
                    valor = int(round(valor))
            if valor is None and not es_vacio(bruto):
                invalidos[col] += 1
            if tipo == 'str' and valor is None:
                valor = SIN_DATO
            reg[campo] = valor
            if col in OBLIGATORIAS and valor is None and not motivo:
                motivo = f'{col} vacío o no válido'
        if not motivo and not (2000 <= reg['anio'] <= 2100):
            motivo = 'CP_ANIO fuera de rango'
        if not motivo and reg['valorUsd'] < 0:
            motivo = 'CP_VALOR_USD negativo'
        if not motivo and reg['numOperaciones'] is not None and reg['numOperaciones'] < 0:
            motivo = 'CP_NUM_OPERACIONES negativo'
        if motivo:
            descartes[motivo] += 1
            if len(ejemplos_descarte) < 10:
                ejemplos_descarte.append({'linea_csv': n, 'motivo': motivo})
            continue
        reg['valorUsd'] = round(reg['valorUsd'], 2)
        reg['periodo'] = f"{reg['anio']:04d}-{reg['mes']:02d}"
        reg['fecha'] = f"{reg['periodo']}-01"
        registros.append(reg)

    # unificar variantes que solo cambian en mayúsculas/tildes (ej. "Guayas" y "GUAYAS")
    unificados = {}
    for campo in [c for c, t in ESQUEMA.values() if t == 'str']:
        grupos = defaultdict(Counter)
        for r in registros:
            grupos[sin_tildes(r[campo]).upper()][r[campo]] += 1
        mapa = {}
        for variantes in grupos.values():
            if len(variantes) > 1:
                principal = variantes.most_common(1)[0][0]
                for v in variantes:
                    if v != principal:
                        mapa[v] = principal
        if mapa:
            unificados[campo] = mapa
            for r in registros:
                r[campo] = mapa.get(r[campo], r[campo])

    # orden de campos y id
    orden = ['id', 'fecha', 'periodo', 'anio', 'mes', 'codProvincia', 'provincia', 'canton', 'sector', 'subsector',
             'productoOriginal', 'producto', 'genero', 'institucion', 'valorUsd', 'numOperaciones']
    registros.sort(key=lambda r: (r['fecha'], r['provincia'], r['canton']))
    registros = [{k: ({**r, 'id': f'R{i:06d}'})[k] for k in orden} for i, r in enumerate(registros, start=1)]

    duplicados = sum(c - 1 for c in Counter(json.dumps({k: v for k, v in r.items() if k != 'id'}, sort_keys=True)
                                            for r in registros).values() if c > 1)
    # un archivo JSON por año
    carpeta = salida / 'por_anio'
    carpeta.mkdir(parents=True, exist_ok=True)
    for viejo in carpeta.glob('credito_agropecuario_*.json'):
        viejo.unlink()
    por_anio = defaultdict(list)
    for r in registros:
        por_anio[r['anio']].append(r)
    archivos = []
    for anio in sorted(por_anio):
        ruta = carpeta / f'credito_agropecuario_{anio}.json'
        ruta.write_text(json.dumps(por_anio[anio], ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
        archivos.append({'anio': anio, 'archivo': f'por_anio/{ruta.name}', 'registros': len(por_anio[anio]),
                         'tamano_mb': round(ruta.stat().st_size / 1_048_576, 2)})
    indice = {'dataset': 'Crédito público agropecuario por rubro, provincia y cantón desde el año 2013 (MAG)',
              'total_registros': len(registros), 'campos': orden, 'archivos': archivos}
    (salida / 'indice.json').write_text(json.dumps(indice, ensure_ascii=False, indent=2), encoding='utf-8')
    muestra = salida / 'muestra_credito_agropecuario.json'
    muestra.write_text(json.dumps(registros[:5], ensure_ascii=False, indent=2), encoding='utf-8')

    rep.update({
        'columnas_no_usadas': extra,
        'registros_json': len(registros),
        'registros_descartados': sum(descartes.values()),
        'motivos_descarte': dict(descartes),
        'ejemplos_descarte': ejemplos_descarte,
        'valores_faltantes_por_columna': dict(vacios),
        'valores_no_convertibles_por_columna': dict(invalidos),
        'celdas_con_espacios_corregidas': dict(espacios),
        'categorias_unificadas': unificados,
        'registros_duplicados_exactos': duplicados,
        'tratamiento': {
            'categoricas_vacias': f'se reemplazan por "{SIN_DATO}"',
            'numOperaciones_vacio': 'queda como null y el registro se conserva',
            'anio_mes_valor_vacios_o_invalidos': 'el registro se descarta',
            'negativos': 'el registro se descarta',
        },
    })
    return registros, rep, muestra


def validar(salida, rep):
    """Relee los JSON por año y comprueba estructura, tipos, cantidad y formato de fecha."""
    indice = json.loads((salida / 'indice.json').read_text(encoding='utf-8'))
    datos, errores_arch = [], []
    for a in indice['archivos']:
        parte = json.loads((salida / a['archivo']).read_text(encoding='utf-8'))
        if not isinstance(parte, list):
            errores_arch.append(f"{a['archivo']}: la raíz no es un arreglo")
            continue
        if len(parte) != a['registros']:
            errores_arch.append(f"{a['archivo']}: tiene {len(parte)} registros y el índice dice {a['registros']}")
        if any(r['anio'] != a['anio'] for r in parte):
            errores_arch.append(f"{a['archivo']}: contiene registros de otro año")
        datos.extend(parte)
    tipos = {'id': str, 'fecha': str, 'periodo': str, 'anio': int, 'mes': int, 'codProvincia': (str, type(None)),
             'provincia': str, 'canton': str, 'sector': str, 'subsector': str, 'productoOriginal': str, 'producto': str,
             'genero': str, 'institucion': str, 'valorUsd': (int, float), 'numOperaciones': (int, type(None))}
    errores = list(errores_arch)
    for i, r in enumerate(datos):
        if set(r) != set(tipos):
            errores.append(f'Registro {i}: campos distintos al esquema')
        for k, t in tipos.items():
            if k in r and not isinstance(r[k], t):
                errores.append(f'Registro {i}: {k} tiene tipo {type(r[k]).__name__}')
        if not re.fullmatch(r'\d{4}-\d{2}-01', r.get('fecha', '')):
            errores.append(f'Registro {i}: fecha con formato incorrecto')
        if any(isinstance(v, str) and v != v.strip() for v in r.values()):
            errores.append(f'Registro {i}: texto con espacios al inicio o final')
        if len(errores) > 20:
            break
    ids = [r['id'] for r in datos]
    if len(ids) != len(set(ids)):
        errores.append('Hay ids repetidos')
    esperado = rep['registros_csv'] - rep['registros_descartados']
    if len(datos) != esperado:
        errores.append(f'Cantidad: JSON tiene {len(datos)} y se esperaban {esperado}')
    fechas = sorted(r['fecha'] for r in datos)
    rep['validacion_json'] = {
        'estado': 'OK' if not errores else 'CON ERRORES',
        'errores': errores[:20],
        'registros_validados': len(datos),
        'rango_fechas': [fechas[0], fechas[-1]] if fechas else None,
        'monto_total_usd': round(sum(r['valorUsd'] for r in datos), 2),
        'operaciones_totales': sum(r['numOperaciones'] or 0 for r in datos),
        'valores_distintos': {k: len({r[k] for r in datos}) for k in
                              ['provincia', 'canton', 'sector', 'subsector', 'producto', 'genero', 'institucion']},
        'archivos_json': len(indice['archivos']),
        'tamano_total_mb': round(sum(a['tamano_mb'] for a in indice['archivos']), 2),
        'archivo_mas_grande_mb': max((a['tamano_mb'] for a in indice['archivos']), default=0),
    }
    return errores


def main():
    ap = argparse.ArgumentParser(description='CSV de crédito agropecuario -> JSON')
    ap.add_argument('--entrada', type=Path, default=ENTRADA)
    ap.add_argument('--salida', type=Path, default=SALIDA, help='carpeta de salida')
    a = ap.parse_args()
    if not a.entrada.exists() and a.entrada.with_name(a.entrada.name + '.zip').exists():
        a.entrada = a.entrada.with_name(a.entrada.name + '.zip')
    if not a.entrada.exists():
        sys.exit(f'ERROR: no existe {a.entrada}. Descarga el CSV y colócalo en data/raw/')

    registros, rep, muestra = transformar(a.entrada, a.salida)
    errores = validar(a.salida, rep)
    ruta_rep = a.salida / 'reporte_validacion.json'
    ruta_rep.write_text(json.dumps(rep, ensure_ascii=False, indent=2), encoding='utf-8')

    v = rep['validacion_json']
    print('=' * 60)
    print(' TRANSFORMACIÓN CSV -> JSON')
    print('=' * 60)
    print(f" Archivo CSV           : {rep['archivo_entrada']} ({rep['codificacion']}, separador '{rep['separador']}')")
    print(f" Registros en el CSV   : {rep['registros_csv']:,}")
    print(f" Registros descartados : {rep['registros_descartados']:,} {rep['motivos_descarte'] or ''}")
    print(f" Registros en el JSON  : {rep['registros_json']:,}")
    print(f" Faltantes por columna : {rep['valores_faltantes_por_columna'] or 'ninguno'}")
    print(f" Celdas con espacios   : {sum(rep['celdas_con_espacios_corregidas'].values()):,} corregidas")
    print(f" Categorías unificadas : {sum(len(m) for m in rep['categorias_unificadas'].values())}")
    print(f" Duplicados exactos    : {rep['registros_duplicados_exactos']}")
    print(f" Rango de fechas       : {v['rango_fechas']}")
    print(f" Monto total (USD)     : {v['monto_total_usd']:,.2f}")
    print(f" Archivos JSON         : {v['archivos_json']} (uno por año), {v['tamano_total_mb']} MB en total")
    print(f" Archivo más grande    : {v['archivo_mas_grande_mb']} MB")
    print(f" Validación            : {v['estado']}")
    for e in v['errores']:
        print('   -', e)
    print('-' * 60)
    print(' Salida   : data/processed/por_anio/  +  indice.json, muestra_credito_agropecuario.json, reporte_validacion.json')
    if v['archivo_mas_grande_mb'] > 95:
        print(' AVISO: un archivo JSON supera los 95 MB; GitHub no acepta archivos de más de 100 MB.')
    sys.exit(1 if errores else 0)


if __name__ == '__main__':
    main()
