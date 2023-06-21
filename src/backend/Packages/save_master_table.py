import os
import pandas as pd
from Packages.constants import resources_folder


def save_master_table(df: pd.DataFrame):
    """Funcion que guarda la tabla maestra de configuraciones en la carpeta en linea"""
    save_file_path = os.path.join(resources_folder, 'master_configuration_table.xlsx')
    df.to_excel(save_file_path, index=False)

def save_hrs_table(df: pd.DataFrame):
    """Funcion que guarda la tabla de horas std en la carpeta en linea"""
    save_file_path = os.path.join(resources_folder, 'hrs_table.xlsx')
    df.to_excel(save_file_path, index=False)