import numpy as np
import pandas as pd
import pymssql
from Packages.constants import resources_folder
import os


def get_hrs() -> pd.DataFrame:
    """Funcion que ejecuta un query en la bd
    y devuelve una columna con todas las referencias y las horas estandar
    una referencia puede tener varias horas estandar"""
    connection = pymssql.connect(server='Fgetcesql1\inst1', database='TrabajoEquipo')
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
    final_df = pd.DataFrame(columns=["Celula", "Referencia", "HorasSTD"])

    for celula in celulas:
        filtered_df = df[df['Celula'] == celula]
        referencias = set(filtered_df['ReferenciaSAP'].tolist())
        for referencia in referencias:
            f_df = filtered_df[filtered_df['ReferenciaSAP'] == referencia]

            hrs_std = f_df['HorasSTD'].tolist()
            if len(hrs_std) > 1:
                for h in hrs_std:
                    h = h*100
                    h = round(h, 2)

                    final_df.loc[len(final_df.index)] = [celula, referencia, h]

                    final_df = final_df.drop_duplicates()

    return final_df

if __name__ == '__main__':
    df = get_hrs()
