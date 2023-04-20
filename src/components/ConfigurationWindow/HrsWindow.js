import {useEffect, useState} from "react";
import {Col, Container, Form, Row, Table} from "react-bootstrap";
import DropdownMultiselect from "react-multiselect-dropdown-bootstrap";
import NavBar from "../NavBar";
import "./ConfigurationWindow.css"
import {DropdownList} from "react-widgets/cjs";
import LoadingWindow from "../LoadingWindow";
import flaskAddress from "../Constants";
import ErrorWindow from "../ErrorWindow/ErrorWindow";
import UploadFilePopUp from "../CargasMaquinaWindow/UploadFilePopUp";


const HrsWindow = () => {
    const [hrsSTDTable, sethrsSTDTable] = useState([])
    const [references, setreferences] = useState([])
    const headers = ['Referencia', 'Celula', 'Horas STD']
    const [selectedRef, setselectedRef] = useState('Ver Todos')
    const [HRSSTDExcel, setHRSSTDExcel] = useState([])
    const [showPopUp, setshowPopUp] = useState(false)
    const [imported, setimported] = useState(false)


    const get_hrs = async () => {
        const body = {
            method:"GET",
            headers: {
                "Content-Type":"application/json"
            }
        }
        fetch(`${flaskAddress}_get_hrs`, body)
            .then(response => response.json())
            .then(json => {
                // console.log(json)
                // console.log(json)
                sethrsSTDTable(json)
            })
    }

    // obtener tabla con hrs
    const getHrsTable = async () => {
        const msg = {
            method:"GET",
            headers: {
                "Content-Type":"application/json"
            }
        }
        fetch(`${flaskAddress}_get_hrs_table`, msg)
            .then(response => response.json())
            .then(json => {
                json.map((dict, index) => {
                    dict.id = index
                    return (dict)
                })
                setHRSSTDExcel(json)
                console.log(json)
            })
    }


    // obtener la master table al iniciar la aplicacion
    useEffect(() => {
        get_hrs().then(r => r)
        getHrsTable().then(r => r)
    }, [])

    // tranformar la tabla maestra en el formato deseado para la gui
    useEffect(() => {
        let refs = []
        let cells = []
        for (let i in hrsSTDTable) {
            let row = hrsSTDTable[i]
            // console.log(row)
            refs.push(row.Referencia)
            cells.push(row.Celula)
        }
        refs = [...new Set(refs)]
        cells = [...new Set(cells)]

        // console.log(refs)
        let result = []
        // eslint-disable-next-line array-callback-return
        refs.map((ref) => {

            // reference_df.map((dict) => {
            cells.map((cell) => {
                let d = {}
                d.reference = ref
                d.cell = cell
                d.hrs = {}

                for (let dict of hrsSTDTable) {
                    if (dict.Celula === cell && dict.Referencia === ref) {
                        d.hrs[dict.HorasSTD] = {'HRSSTD': dict.HorasSTD, selected: false}
                    }
                }
                if (Object.values(d.hrs).length > 1) {
                    result.push(d)
                }
            })


        })

        let excelData = [... HRSSTDExcel]

        for (let dict of result) {
            for (let excHrs of excelData) {
                // console.log(dict)
                // console.log(excHrs)
                if (excHrs.reference === dict.reference && toString(excHrs.cell) === toString(dict.cell)) {
                    // console.log(Object.keys(dict.hrs))
                    // let excel_hours = excHrs.hrs
                    // console.log(String(excel_hours))
                    if (Object.keys(dict.hrs).includes(String(excHrs.hrs))) {
                        console.log("excHrs")
                        dict.hrs[excHrs.hrs].selected = true
                    }
                }
            }
        }

        console.log(result)
        setreferences(result)
    }, [hrsSTDTable, HRSSTDExcel])

    // obtener std para cada dropdown
    const getHRSSTD = (dict) => {
        let hrs_std = []
        for (let h in dict.hrs) {
            hrs_std.push(h)
        }
        return hrs_std
    }

    // insertar los otros entries en la tabla al seleccionar el dropdown (WIP)
    const handleHRSSelected = (reference, cell, std) => {
        console.log(reference)
        console.log(std)

        let refs = [...references]

        for (let dict of refs) {
            if (dict.reference === reference && dict.cell === cell) {
                for (let hrs of Object.keys(dict.hrs)) {
                    dict.hrs[hrs].selected = false
                }
                dict.hrs[std].selected = true
            }
        }
        setreferences(refs)
    }

    // guardar cambios cada ves que se modifica un porcentaje
    const saveChanges = () => {
        let HRSSTD = []
        for (let ref_row of references) {
            for (let hrs of Object.keys(ref_row.hrs)) {
                if (ref_row.hrs[hrs].selected === true) {
                    let newEntry = {}
                    newEntry.reference = ref_row.reference
                    newEntry.cell = ref_row.cell
                    newEntry.hrs = hrs

                    HRSSTD.push(newEntry)
                }
            }
        }

        const body = {
            method:"POST",
            headers: {
                "Content-Type":"application/json"
            },
            body: JSON.stringify(HRSSTD)
        }
        fetch(`${flaskAddress}_save_hrs_table`, body)
            .then(response => response)
        alert('Cambios Guardados exitosamente')
    }

    // obtener lista de referencias
    const filersList = () => {
        let result = {refs:['Ver Todos'], cells:['Ver Todos']}
        for (let dict of hrsSTDTable) {
            let ref = dict.Referencia
            if (result.refs.includes(ref) === false) {
                result.refs.push(ref)
            }
        }
        return result
    }

    // obtener los valores por defecto
    const getDefault = (ref, cell) => {
        for (let dict of HRSSTDExcel) {
            if (dict.reference === ref && String(dict.cell) === String(cell)) {
                return (dict.hrs)
            }
        }
    }

    const handleSaveSimulation = () => {
        const contentsDict = {
            hrstable: HRSSTDExcel
        }
        const body = {
            method:"POST",
            headers: {
                "Content-Type":"application/json",
            },
            body: JSON.stringify(contentsDict)
        }
        fetch(`${flaskAddress}_export_simulation`, body)
            .then(res => res.blob())
            .then(blob => {
                let FileSaver = require('file-saver');
                FileSaver.saveAs(blob, `hrs-std.xlsx`);
            })

    }

    // abrir el popup
    const handleImportSimulation = () => {
        setshowPopUp(true)
    }

    // cerrar el popup
    const closePopUp = () => {
        setshowPopUp(false)
    }

    // aplicar tablas importadas a los ajustes de referencia
    const applySimulationData = (response) => {
        // aplicar tablas descargadas
        setHRSSTDExcel(response.hrstable)
        setimported(!!imported)
        alert("Ajustes Importados correctamente")
    }


    if (sessionStorage.getItem("user") !== "Administrador" && sessionStorage.getItem("user") !== "Manager") {
        return (
            <ErrorWindow/>
        )
    }

    // mostar pantalla de loading mientras se obtienen los datos
    if (hrsSTDTable.length === 0) {
        return (
            <>
                <NavBar title={"Ajustes de Referencia"} currentConfiguration={'/hrs_std'}/>
                <LoadingWindow/>
            </>
        )
    }

    return (
        <>
            <NavBar
                handleSaveRefTable={saveChanges}
                title={'Ajustes de Referencia'}
                currentConfiguration={'/hrs_std'}
                exportSettings={handleSaveSimulation}
                importSettings={handleImportSimulation}
            />
            <UploadFilePopUp show={showPopUp} close={closePopUp} applySimulationData={applySimulationData}/>
            <div className={"config-table"}>
                <Table striped bordered hover responsive>
                    <thead>
                    <tr>
                        { headers.map((value) => {return (<th key={value}>{value}</th>)}) }
                    </tr>
                    </thead>
                    <tbody>
                    {
                        references.map((dict, key) => {
                            let selected_cells = []
                            for (let c in dict.cells) {
                                let selected = dict.cells[c].selected
                                if (selected) {
                                    selected_cells.push(c)
                                }
                            }
                            if (dict.reference !== selectedRef && selectedRef !== 'Ver Todos') {return null}

                            return (
                                <tr key={key}>
                                    <td>{dict.reference}</td>
                                    <td>{dict.cell}</td>
                                    <td>
                                        <DropdownList
                                            data={getHRSSTD(dict)}
                                            placeholder={'Seleccione un estandar'}
                                            defaultValue={getDefault(dict.reference, dict.cell)}
                                            onChange={(std) => handleHRSSelected(dict.reference, dict.cell, std)}
                                            // value={getDefault(dict.reference, dict.cell)}
                                        />
                                    </td>
                                </tr>
                            )
                        })
                    }
                    </tbody>
                </Table>
            </div>
            <div className={'filters-container'}>
                <Container>
                    <Row className={"justify-content-center"}>
                        <h4>Filtros</h4>
                    </Row>
                    <Row>
                        <Col>Referencia:</Col>
                        <Col><DropdownList
                            defaultValue={selectedRef}
                            data={filersList().refs}
                            placeholder={'Reference'}
                            value={selectedRef} onChange={(val) => {setselectedRef(val)}}/>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    )
}

export default HrsWindow