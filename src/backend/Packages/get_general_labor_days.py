import datetime
import os.path
import warnings
from pprint import pprint

import dateutil.parser
import pandas as pd
import datetime as dt
import json

from Packages.constants import no_labor_days_folder


def get_default_labor_days_calendar():
    data = pd.read_excel(
        r"\\fcefactory1\PROGRAMAS_DE_PRODUCCION\6.Planificacion\DOCUMENTOS COMUNES\CALENDARIO FISCAL.xlsx",
        sheet_name='Calendar')
    df = pd.DataFrame(data)
    df['Causa'] = ''
    for index in df.index:
        day = int(df['Day Number of Week'][index])
        if day not in (6, 7):
            df['habil'][index] = True
        elif day in (6, 7):
            df['habil'][index] = False
            df['Causa'][index] = 'Fin de Semana'
    return df


def save_no_labor_days(no_labor_days: dict, cell=None):
    """:param no_labor_days: diccionario de los dias que no hay trabajo
    :param cell: si es None se guarda para el calendario general"""
    if cell is None:
        path = os.path.join(no_labor_days_folder, 'general_no_labor_days.json')
        with open(path, 'r') as fp:
            d = json.load(fp)
            fp.close()
        with open(path, 'w') as fp:
            no_labor_days.update(d)
            json.dump(no_labor_days, fp)
    else:
        path = os.path.join(no_labor_days_folder, f'{cell}_no_labor_days.json')
        if os.path.isfile(path):
            with open(path, 'r') as fp:
                d = json.load(fp)
                fp.close()
            with open(path, 'w') as fp:
                no_labor_days.update(d)
                json.dump(no_labor_days, fp)
        else:
            with open(os.path.join(no_labor_days_folder, 'empty.json')) as f:
                data = json.load(f)
            with open(path, 'w') as f:
                json.dump(data, f)
            with open(path, 'w') as f:
                json.dump(no_labor_days, f)


def delete_no_labor_day(date, cell=None):
    if cell is None:
        path = os.path.join(no_labor_days_folder, 'general_no_labor_days.json')
        with open(path, 'r') as fp:
            no_labor_days: dict = json.load(fp)
            fp.close()
        # remove no labor day
        no_labor_days.pop(date)
        with open(path, 'w') as fp:
            json.dump(no_labor_days, fp)
    else:
        path = os.path.join(no_labor_days_folder, f'{cell}_no_labor_days.json')
        if os.path.isfile(path):
            with open(path, 'r') as fp:
                no_labor_days = json.load(fp)
                fp.close()
            # remove no labor day
            no_labor_days.pop(date)
            with open(path, 'w') as fp:
                json.dump(no_labor_days, fp)


def get_labor_days_per_month(cell: str, months: list) -> dict:
    # get general labor days first
    path = os.path.join(no_labor_days_folder, 'general_no_labor_days.json')
    with open(path) as json_file:
        general_no_labor_days = json.load(json_file)
    df = get_default_labor_days_calendar(general_no_labor_days)
    cell_path = os.path.join(no_labor_days_folder, f'{cell}_no_labor_days.json')
    if os.path.isfile(cell_path):
        with open(cell_path) as json_file:
            cell_no_labor_days = json.load(json_file)
        for no_labor_date in cell_no_labor_days.keys():
            date = dt.datetime.strptime(no_labor_date, '%d-%m-%Y')
            df.loc[df['Date'] == date, 'habil'] = False
            df.loc[df['Date'] == date, 'Causa'] = cell_no_labor_days[no_labor_date]
    labor_days = {}
    fiscal_month: pd.Timestamp = (df['FiscalMonth'][0])  # 2015-11-01 00:00:00
    for month in months:
        m = month[0:3] + '-01' + month[3:]
        date = dateutil.parser.parse(m, yearfirst=True, dayfirst=False)
        days = df.loc[(df['FiscalMonth'] == date) & (df['habil'] == True), 'habil'].sum()
        labor_days[month] = days

    return labor_days


def get_general_labor_days() -> list:
    # get general labor days first
    df = get_default_labor_days_calendar()
    today = dt.datetime.today()
    today = pd.to_datetime(today).floor('D')
    last_day = pd.to_datetime(today.replace(year=today.year + 3)).floor('D')
    previous_year_day = pd.to_datetime(today.replace(year=today.year -1)).floor('D')
    current_month = get_fiscal_month(date=today)
    last_month = get_fiscal_month(date=last_day)
    previous_year_month = get_fiscal_month(date=previous_year_day)
    df = df[(last_month >= df['FiscalMonth']) &
            (df['FiscalMonth'] >= previous_year_month) & (df['habil'] == False)]
    no_labor_days_cal = []
    registered_fiscal_months = []
    for index in df.index:
        start_fiscal_month = df['1st Day Of Fiscal Month'][index] - datetime.timedelta(1)
        if start_fiscal_month not in registered_fiscal_months:
            data = {'name': 'Fin mes fiscal', 'startDate': start_fiscal_month,
                    'endDate': start_fiscal_month, 'color': ''}
            no_labor_days_cal.append(data)
            registered_fiscal_months.append(start_fiscal_month)
        causa = df['Causa'][index]
        date = df['Date'][index]
        data = {'name': causa, 'startDate': date, 'endDate': date, 'color': ''}
        no_labor_days_cal.append(data)

    try:
        path = os.path.join(no_labor_days_folder, 'calendario_general.xlsx')
        d = pd.read_excel(path)
        saved_calendar = pd.DataFrame(d)
        for index in saved_calendar.index:
            name = saved_calendar["name"][index]
            date = saved_calendar["startDate"][index]
            # filtered_cal = list(filter(lambda d: (d["name"] == name) & (d["startDate"] == date), no_labor_days_cal))
            if name not in ("Fin de Semana", "Fin mes fiscal"):
                data = {'name': name, 'startDate': date, 'endDate': date, 'color': ''}
                no_labor_days_cal.append(data)
    except FileNotFoundError:
        pass

    return no_labor_days_cal


def get_cell_labor_days(cell: str, df: pd.DataFrame):
    general_calendar = df
    # apply cell specific labor days
    cell_path = os.path.join(no_labor_days_folder, f'{cell}_no_labor_days.json')
    if os.path.isfile(cell_path):
        with open(cell_path) as json_file:
            cell_no_labor_days = json.load(json_file)
        for no_labor_date in cell_no_labor_days.keys():
            date = dt.datetime.strptime(no_labor_date, '%d-%m-%Y')
            general_calendar.loc[general_calendar['Date'] == date, 'habil'] = False
            general_calendar.loc[general_calendar['Date'] == date, 'Causa'] = cell_no_labor_days[no_labor_date]
    return general_calendar


def get_fiscal_month(date: dt.datetime.today()):
    data = pd.read_excel(
        r"\\fcefactory1\PROGRAMAS_DE_PRODUCCION\6.Planificacion\DOCUMENTOS COMUNES\CALENDARIO FISCAL.xlsx",
        sheet_name='Calendar')
    fiscal_calendar_df = pd.DataFrame(data)
    fiscal_calendar_df['Date'] = pd.to_datetime(fiscal_calendar_df['Date'])
    fiscal_month: pd.DataFrame = fiscal_calendar_df.loc[fiscal_calendar_df['Date'] == date]
    fiscal_month: dt.date = fiscal_month['FiscalMonth'][fiscal_month.index[0]]
    return fiscal_month


if __name__ == '__main__':
    warnings.filterwarnings("ignore")
    calendar_df = get_general_labor_days()
    pprint(len(calendar_df))
