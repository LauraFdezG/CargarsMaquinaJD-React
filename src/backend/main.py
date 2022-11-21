import ast
import os

import flask
from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from Packages.constants import no_labor_days_folder
from Packages.get_general_labor_days import get_general_labor_days, save_no_labor_days
from Packages.get_master_table import get_master_table
from Packages.save_master_table import save_master_table
import warnings

app = Flask(__name__)
CORS(app)


def getPOST():
    data = request.data
    data = data.decode('utf-8')
    data = ast.literal_eval(data)
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


if __name__ == '__main__':
    warnings.filterwarnings('ignore')
    app.run(debug=True, host="0.0.0.0")
