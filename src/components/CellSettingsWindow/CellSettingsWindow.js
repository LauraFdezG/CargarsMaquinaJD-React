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
    const [currentFileName, setCurrentFileName] = useState("")

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
                json.map((dict, index) => {
                    dict.id = index
                    return (dict)
                })
                setcellSettings(json)
                setcurrentTable(json)
                setCurrentFileName("ajustes_celula_cargas_de_maquina.xlsx")
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
                json.map((dict, index) => {
                    dict.id = index
                    return (dict)
                })
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
                json.map((dict, index) => {
                    dict.id = index
                    return (dict)
                })
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
                json.map((dict, index) => {
                    dict.id = index
                    return (dict)
                })
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
        setcurrentTable(tables[value].data)
        setCurrentFileName(tables[value].fileName)
    }

     // handler para guardar los cambio realizados
    const saveSettings = () => {
        const msg = {
            method:"POST",
            headers: {
                "Content-Type":"application/json"
            },
            body: JSON.stringify({filename: currentFileName, data: currentTable})
        }
        fetch(`${flaskAddress}save_settings`, msg)
            .then(response => alert("Cambios guardados exitosamente"))
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
        emptyRow.id = table.length
        console.log(emptyRow)
        table.unshift(emptyRow)
        setcurrentTable(table)
    }

    // eliminar fila de la tabla de datos
    const deleteRow = (event) => {
        let table = [...currentTable]
        table.splice(event.target.id, 1)
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
    const tables = {
        cellSettings: {data: cellSettings, fileName:"ajustes_celula_cargas_de_maquina.xlsx"},
        cellOpTypes: {data: cellOpTypes, fileName: "tabla_celulas_operaciones.xlsx"},
        desglosesMotor: {data: desglosesMotor, fileName: "desglose_piezas_engranajes_motor.xlsx"},
        desglosesInternos: {data: desglosesInternos, fileName: "desglose_piezas_engranajes_internos.xlsx"}
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
            <EditableSpreadSheet tableData={currentTable} deleteRow={deleteRow}/>
        </div>
    )
}

export default CellSettingsWindow