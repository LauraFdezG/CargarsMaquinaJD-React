import ast
import datetime
import json
import os
import io
import flask
from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import pandas as pd
from Packages.constants import no_labor_days_folder, resources_folder
from Packages.get_general_labor_days import get_general_labor_days, save_no_labor_days, get_cell_labor_days
from Packages.get_master_table import get_master_table
from Packages.get_orders_table import get_orders_table
from Packages.save_master_table import save_master_table
import warnings

from Packages.send_excel_as_response import send_excel_as_response

app = Flask(__name__)
CORS(app)


def getPOST():
    data = request.data
    data = data.decode('utf-8')
    try:
        data = ast.literal_eval(data)
    except ValueError:
        data = json.loads(data)
    return data


@app.route("/_get_master_table", methods=["GET"])
def _get_master_table():
    df = get_master_table()
    df = df.fillna('null')
    data = df.to_dict('records')
    resp = flask.jsonify(data)
    return resp


@app.route("/_save_master_table", methods=['POST'])
def _save_master_table():
    data = request.data
    data = data.decode('utf-8')
    data = ast.literal_eval(data)
    df = pd.DataFrame.from_records(data)
    save_master_table(df)
    return 'saved'


@app.route("/_get_general_calendar", methods=["GET"])
def _get_general_calendar():
    calendar = get_general_labor_days()
    resp = flask.jsonify(calendar)
    return resp


@app.route("/_save_general_calendar", methods=["POST"])
def _save_general_calendar():
    general_cal_dict = getPOST()
    calendar_df = pd.DataFrame.from_records(general_cal_dict)
    path = os.path.join(no_labor_days_folder, 'calendario_general.xlsx')
    calendar_df.to_excel(path, index=False)
    return ''


@app.route("/_save_cells_calendar", methods=["POST"])
def _save_cells_calendar():
    cells_cal_dict = getPOST()
    calendar_df = pd.DataFrame.from_records(cells_cal_dict)
    path = os.path.join(no_labor_days_folder, 'calendario_celulas.xlsx')
    calendar_df.to_excel(path, index=False)
    return ''


@app.route("/_get_cells_calendar", methods=["GET"])
def _get_cells_calendar():
    calendar = get_cell_labor_days()
    resp = flask.jsonify(calendar)
    return resp


@app.route("/_get_cells_list", methods=["GET"])
def _get_cells_list():
    df = get_master_table()
    df = df.fillna('null')
    cells = list(set(list(df['Celula'])))
    resp = flask.jsonify(cells)
    return resp


@app.route("/_get_orders_table", methods=["GET"])
def _get_orders_table():
    data = pd.read_excel(os.path.join(resources_folder, "orders_table.xlsx"))
    created_time = os.path.getmtime(os.path.join(resources_folder, "orders_table.xlsx"))
    created_time = datetime.datetime.fromtimestamp(created_time).strftime('%d/%m/%y %I:%M %p')
    df = pd.DataFrame(data)
    df = df.to_dict("records")
    result = {"ordersTable": df, "createdTime": created_time}
    return flask.jsonify(result)


@app.route("/_get_fiscal_calendar", methods=["GET"])
def _get_fiscal_calendar():
    data = pd.read_excel(
        r"\\fcefactory1\PROGRAMAS_DE_PRODUCCION\6.Planificacion\DOCUMENTOS COMUNES\CALENDARIO FISCAL.xlsx",
        sheet_name='Calendar')
    fiscal_calendar_df = pd.DataFrame(data).fillna("null")
    fiscal_calendar_df = fiscal_calendar_df.to_dict("records")
    return flask.jsonify(fiscal_calendar_df)


@app.route("/_get_cell_settings", methods=["GET"])
def _get_cell_settings():
    data = pd.read_excel(os.path.join(resources_folder, "ajustes_celula_cargas_de_maquina.xlsx"))
    df = pd.DataFrame(data)
    df = df.to_dict("records")
    return flask.jsonify(df)


@app.route("/_export_simulation", methods=["POST"])
def export_simulation():
    content_dict = getPOST()
    for key in content_dict:
        data = content_dict[key]
        df = pd.DataFrame.from_records(data)
        content_dict[key] = df
    # orders_df = pd.DataFrame.from_records(content_dict["ordersTable"])
    return send_excel_as_response(content_dict, filename="simulation")


@app.route("/_import_simulation", methods=["POST"])
def import_simulation():
    uploaded_file = request.files['file']
    sheet_names = pd.ExcelFile(uploaded_file).sheet_names
    response = {}
    for sheet_name in sheet_names:
        df = pd.DataFrame(pd.read_excel(uploaded_file, sheet_name=sheet_name))
        df = df.fillna("null")
        response[sheet_name] = df.to_dict("records")
    return flask.jsonify(response)


@app.route("/_get_monthly_nops", methods=["GET"])
def get_monthly_nops():
    with open(os.path.join(resources_folder, "nro_op_mensual.json")) as json_file:
        data = json.load(json_file)
        return flask.jsonify(data)


@app.route("/_update_orders_table", methods=["GET"])
def update_orders_table():
    get_orders_table()
    print("orders table updated succesfully")
    return ""


if __name__ == '__main__':
    warnings.filterwarnings('ignore')
    app.run(debug=True, host="0.0.0.0")
