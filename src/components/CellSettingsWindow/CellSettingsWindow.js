import "./CellSettingsWindow.css"
import NavBar from "../NavBar";
import LoadingWindow from "../LoadingWindow";
import flaskAddress from "../Constants";
import {useEffect, useState} from "react";
import {Button, Table} from "react-bootstrap";
import Spreadsheet from "react-spreadsheet";
import EditableSpreadSheet from "./EditableSpreadSheet";
import {DropdownList} from "react-widgets/cjs";

const CellSettingsWindow = (props) => {
    const [cellSettings, setcellSettings] = useState([])
    const [cellOpTypes, setcellOpTypes] = useState([])
    const [currentTable, setcurrentTable] = useState([])
    const [desglosesInternos, setDesglosesInternos] = useState([])
    const [desglosesMotor, setDesglosesMotor] = useState([])

    // obtener tabla con ajustes de la celulas: productividad, absentismo, nro turnos etc
    const getCellSettings = async () => {
        const msg = {
            method:"GET",
            headers: {
                "Content-Type":"application/json"
            }
        }
        fetch(`${flaskAddress}_get_cell_settings`, msg)
            .then(response => response.json())
            .then(json => {
                setcellSettings(json)
                setcurrentTable(json)
            })
    }

    // obetener tabla con tipos de operacion por cada celula
    const getCellOpTypes = async () => {
        const msg = {
            method:"GET",
            headers: {
                "Content-Type":"application/json"
            }
        }
        fetch(`${flaskAddress}_get_cell_op_types`, msg)
            .then(response => response.json())
            .then(json => {
                setcellOpTypes(json)
            })
    }

    // obetener tabla desgloses internos
    const getdDesglosesInternos = async () => {
        const msg = {
            method:"GET",
            headers: {
                "Content-Type":"application/json"
            }
        }
        fetch(`${flaskAddress}_get_desgloses_internos`, msg)
            .then(response => response.json())
            .then(json => {
                setDesglosesInternos(json)
            })
    }

    // obetener tabla desgloses motor
    const getdDesglosesMotor = async () => {
        const msg = {
            method:"GET",
            headers: {
                "Content-Type":"application/json"
            }
        }
        fetch(`${flaskAddress}_get_desgloses_motor`, msg)
            .then(response => response.json())
            .then(json => {
                setDesglosesMotor(json)
            })
    }

    // descargar tablas a editar
    useEffect(()=> {
        getCellSettings().then(r=>r)
        getCellOpTypes().then(r=>r)
        getdDesglosesInternos().then(r=>r)
        getdDesglosesMotor().then(r=>r)
    }, [])

    // handler de cuando se selecciona una tabla nueva
    const tableSelected = (value) => {
        setcurrentTable(tables[value])
    }
     // handler para guardar los cambio realizados
    const saveSettings = () => {
        alert("hey!")
    }

    // botones que iran en el navbar
    const settingsButtons = () => {
        return (
            <div className={'cell-settings-container'}>
                <DropdownList
                    defaultValue={Object.keys(tables)[0]}
                    data={Object.keys(tables)}
                    onChange={tableSelected}
                    className={'table-selector'}
                />
                <Button onClick={addRow}>Agregar Fila</Button>
                <Button onClick={saveSettings}>Guardar Cambios</Button>
            </div>
        )
    }

    // agregar fila a la tabla de datos
    const addRow = () => {
        let table = [...currentTable]
        let emptyRow = {}
        for (let columnName in table[0]) {
            emptyRow[columnName] = ""
        }
        table.unshift(emptyRow)
        setcurrentTable(table)
    }


    if (cellSettings.length*cellOpTypes.length*desglosesMotor.length*desglosesInternos.length === 0) {
        return (
            <div>
                <NavBar title={"Ajustes de Celula"}/>
                <LoadingWindow/>
            </div>
        )
    }
    let tables = {
        cellSettings: cellSettings,
        cellOpTypes: cellOpTypes,
        desglosesMotor: desglosesMotor,
        desglosesInternos: desglosesInternos
    }
    return (
        <div style={{marginTop: 54}}>
            <NavBar title={"Ajustes de Celula"} settingsButtons={settingsButtons()}/>
            {/*<div className={'cell-settings-container'}>*/}
            {/*    <DropdownList*/}
            {/*        defaultValue={Object.keys(tables)[0]}*/}
            {/*        data={Object.keys(tables)}*/}
            {/*        onChange={tableSelected}*/}
            {/*        className={'table-selector'}*/}
            {/*    />*/}
            {/*    <Button>Guardar Cambios</Button>*/}
            {/*</div>*/}
            <EditableSpreadSheet tableData={currentTable}/>
        </div>
    )
}

export default CellSettingsWindow