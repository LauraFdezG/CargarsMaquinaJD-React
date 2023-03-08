import io
import pandas as pd
from flask import Response


def send_excel_as_response(content_dict: dict, filename: str = "output"):
    buffer = io.BytesIO()
    # create a excel writer object
    with pd.ExcelWriter(buffer) as writer:
        for key in content_dict:
            df: pd.DataFrame = content_dict[key]
            df.to_excel(writer, index=False, sheet_name=key)
    headers = {
        f'Content-Disposition': f'attachment; filename={filename}.xlsx',
        'Content-type': 'application/vnd.ms-excel'
    }
    return Response(buffer.getvalue(), mimetype='application/vnd.ms-excel', headers=headers)

def send_res_as_response(content_dict, filename: str = "output"):
    buffer = io.BytesIO()
    # create a excel writer object
    with pd.ExcelWriter(buffer) as writer:
        content_dict.to_excel(writer, index=True, sheet_name="datos")
    headers = {
        f'Content-Disposition': f'attachment; filename={filename}.xlsx',
        'Content-type': 'application/vnd.ms-excel'
    }
    return Response(buffer.getvalue(), mimetype='application/vnd.ms-excel', headers=headers)
