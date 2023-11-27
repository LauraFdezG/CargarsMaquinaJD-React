import numpy as np
import pandas as pd
import pymssql
from Packages.constants import resources_folder
import os


def get_master_table() -> pd.DataFrame:
    """Funcion que ejecuta un query en la bd
    y devuelve una columna con todas las referencias"""
    connection = pymssql.connect(server='Fgetcesql19\inst1', database='TrabajoEquipo')
    text_query = "SELECT ref.ReferenciaSAP, ref.Celula, eq.NombreEquipo, dep.Minifabrica, dep.CodMinif, tiempos.HorasSTD " \
                 " FROM TReferencias ref " \
                 " INNER JOIN VEquipos eq " \
                 " ON ref.CodEquipo = eq.CodEquipo" \
                 " INNER JOIN VDepartamentos dep" \
                 " ON eq.Departamento = dep.Departamento" \
                 " INNER JOIN CReferenciasConSTD tiempos" \
                 " ON ref.Referencia = tiempos.Referencia" \
                 " WHERE ref.ReferenciaSAP != '' AND dep.CodMinif = 'EJYE' AND len(ref.Celula) = 3" \
                 " AND tiempos.Activa = 1 "
    sql_query = pd.read_sql(text_query, connection)
    df = pd.DataFrame(sql_query)
    # Escoger la mayor HoraSTD para cada celula/referencia
    celulas = set(df['Celula'].tolist())

    for celula in celulas:
        filtered_df = df[df['Celula'] == celula]
        referencias = set(filtered_df['ReferenciaSAP'].tolist())
        for referencia in referencias:
            f_df = filtered_df[filtered_df['ReferenciaSAP'] == referencia]
            max_val = max(f_df['HorasSTD'].tolist()) * 100
            max_val = round(max_val, 2)
            df.loc[(df['Celula'] == celula) & (df['ReferenciaSAP'] == referencia), 'HorasSTD'] = max_val
            df = df.drop_duplicates()



    # Agregar los tipos de operaciones segun celula a la tabla
    data2 = pd.read_excel(os.path.join(resources_folder, 'tabla_celulas_operaciones.xlsx'))
    tabla_op = pd.DataFrame(data2, dtype=str)
    df = pd.merge(df, tabla_op, how='left', left_on='Celula', right_on='Celulas')
    df = df.drop(columns=['Celulas'])

    # Agregar las celulas combinadas a la tabla v1
    # text_query2 = "select Celula, Combinada from VCelulas_Comb WHERE Combinada != '' "
    # sql_query2 = pd.read_sql(text_query2, connection)
    # tabla_cel_comb = pd.DataFrame(sql_query2, dtype=str)
    #
    # print(len(set(tabla_cel_comb["Celula"])))
    #
    # df = pd.merge(df, tabla_cel_comb, how='left', left_on='Celula', right_on='Celula')
    # df["Celula"] = df["Celula"] + df["Combinada"].fillna('')
    # df = df.drop(columns=['Combinada'])
    #
    # print(set(df["Celula"]))
    # print(len(set(df["Celula"])))


    # Agregar las celulas combinadas a la tabla v2
    text_query2 = "select Celula, Combinada from VCelulas_Comb WHERE Combinada != '' "
    sql_query2 = pd.read_sql(text_query2, connection)
    tabla_cel_comb = pd.DataFrame(sql_query2, dtype=str)

    # buscar TODAS las celulas
    celulas_combinadas = "select Celula, Combinada from VCelulas"
    sql_query_celulas_combinadas = pd.read_sql(celulas_combinadas, connection)
    tabla_celulas_comb = pd.DataFrame(sql_query_celulas_combinadas, dtype=str)

    tabla_cel_comb = tabla_cel_comb[tabla_cel_comb.groupby('Celula').Celula.transform(len) > 1]
    normal_cells = []

    for i in set(tabla_cel_comb["Celula"]):
        d = tabla_celulas_comb[tabla_celulas_comb["Celula"] == i]
        if float(d["Combinada"]) == 1.0:
            normal_cells.append(i)

    for c in normal_cells:
        index_names = tabla_cel_comb[tabla_cel_comb["Celula"] == c].index
        tabla_cel_comb.drop(index_names, inplace=True)


    df = pd.merge(df, tabla_cel_comb, how='left', left_on='Celula', right_on='Celula')
    df["Celula"] = df["Celula"] + df["Combinada"].fillna('')
    df = df.drop(columns=['Combinada'])

    # Agregar columna de porcentajes
    df["Porcentaje de Pedidos"] = 0


    # modificar con ajustes actuales
    data = pd.read_excel(
        r"\\fcefactory1\PROGRAMAS_DE_PRODUCCION\6.Planificacion\Cargas de Maquina JD\resources\master_configuration_table.xlsx")
    imported_master_table = pd.DataFrame(data=data)

    for index in df.index:
        referencia = df['ReferenciaSAP'][index]
        celula = df['Celula'][index]
        op_type = df['Tipo de Operacion'][index]
        try:
            imported_perc = imported_master_table.loc[(imported_master_table['ReferenciaSAP'] == referencia) &
                                                      (imported_master_table['Celula'] == celula) &
                                                      (imported_master_table['Tipo de Operacion'] == op_type)]['Porcentaje de Pedidos'].values[0]
        except IndexError:
            imported_perc = 0
        df['Porcentaje de Pedidos'][index] = imported_perc

    return df


if __name__ == '__main__':
    df = get_master_table()

