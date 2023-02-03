import {useEffect, useState} from "react";
import {Col, Container, Form, Row, Table} from "react-bootstrap";
import DropdownMultiselect from "react-multiselect-dropdown-bootstrap";
import NavBar from "../NavBar";
import "./ConfigurationWindow.css"
import {DropdownList} from "react-widgets/cjs";
import LoadingWindow from "../LoadingWindow";
import flaskAddress from "../Constants";


const ConfigurationTable = () => {
    const [masterTable, setmasterTable] = useState([])
    const [references, setreferences] = useState([])
    const headers = ['Referencia', 'Tipo de Operacion', 'Celulas', 'Porcentaje de Pedidos']
    const [selectedRef, setselectedRef] = useState('Ver Todos')
    const [selectedCell, setselectedCell] = useState('Ver Todos')
    const [selectedOpType, setselectedOpType] = useState('Ver Todos')

    const getmasterTable = async () => {
        const body = {
            method:"GET",
            headers: {
                "Content-Type":"application/json"
            }
        }
        fetch(`${flaskAddress}_get_master_table`, body)
            .then(response => response.json())
            .then(json => {
                // console.log(json)
                console.log(json[0])
                setmasterTable(json)
            })
    }

    // obtener la master table al iniciar la aplicacion
    useEffect(() => {
        getmasterTable().then(r => r)
    }, [])

    // tranformar la tabla maestra en el formato deseado para la gui
    useEffect(() => {
        let refs = []
        for (let i in masterTable) {
            let row = masterTable[i]
            refs.push(row.ReferenciaSAP)
        }
        refs = [...new Set(refs)]
        let result = []
        // eslint-disable-next-line array-callback-return
        refs.map((ref) => {
            let reference_df = masterTable.filter(obj => {return obj.ReferenciaSAP === ref})
            // reference_df.map((dict) => {
            for (let dict of reference_df) {
                let op_type = dict['Tipo de Operacion']
                let op_type_df = reference_df.filter(obj => {return obj['Tipo de Operacion'] === op_type})
                let d = {}
                d.reference = ref
                d.op_type = op_type
                d.cells = {}
                // eslint-disable-next-line array-callback-return
                op_type_df.map((row) => {
                    let dd = {}
                    let perc = row['Porcentaje de Pedidos']
                    dd['percentage'] = perc
                    if (perc > 0) {dd['selected'] = true}
                    else {dd['selected'] = false}
                    let cell = row.Celula
                    d.cells[cell] = dd
                })
                let filter_df = result.filter(obj => {return obj.reference === ref && obj.op_type === op_type})
                if (filter_df.length === 0){
                    result.push(d)
                }
            }
        })
        setreferences(result)
        console.log(result)
    }, [masterTable])

    // obtener celulas para cada dropdown
    const getCells = (dict) => {
        let cells = []
        for (let cell in dict.cells) {
            cells.push(cell)
        }
        return cells
    }

    // insertar los otros entries en la tabla al seleccionar el dropdown (WIP)
    const handleCellSelected= (reference, op_type, all_row_cells) => (selected) => {
        let selected_cells = {}

        for (let cell of all_row_cells) {
            selected_cells[cell] = !!selected.includes(cell);
        }

        let refs_copy = [...references]
        for (let cel in selected_cells) {
            for (let dict of refs_copy) {
                if (dict.reference === reference && dict.op_type === op_type) {
                    if (selected_cells[cel]) {dict.cells[cel].selected = true}
                    else {
                        dict.cells[cel].selected = false
                        dict.cells[cel].percentage = 0
                    }
                }
            }
        }
        setreferences(refs_copy)
    }

    // entries de porcentaje
    const PercEntries = (dict) => {
        let reference = dict.reference
        let op_type = dict.op_type

        return (
            // eslint-disable-next-line array-callback-return
            Object.entries(dict.cells).map((value) => {
                let cell = value[0]
                let selected = value[1].selected
                if (selected) {
                    return (
                        <Container>
                            <Row>
                                <Col sm={2}>
                                    <text>{cell}:</text>
                                </Col>
                                <Col>
                                    <Form.Control
                                        type={"text"}
                                        id={cell}
                                        className={"percentage-input"}
                                        value={references.filter(dict => {
                                            return (
                                                dict.reference === reference &&
                                                dict.op_type === op_type
                                            )})[0].cells[cell]['percentage']
                                        }
                                        onChange={handlePercentageChanged(reference, op_type, cell)}
                                    />
                                </Col>
                            </Row>
                        </Container>
                    )
                }
            })
        )
    }

    // handler de cuando se cambia un porcentage
    const handlePercentageChanged = (reference, op_type, cell) => (event) => {
        let value = event.target.value
        let refs = [...references]
        for (let dict of refs) {
            if (dict.reference === reference && dict.op_type === op_type) {
                dict.cells[cell].percentage = value
                break
            }
        }
        setreferences(refs)
    }

    // guardar cambios cada ves que se modifica un porcentaje
    const saveChanges = () => {
        let mt = [...masterTable]
        for (let ref_row of references) {
            for (let table_row of mt) {
                if (ref_row.reference === table_row.ReferenciaSAP && ref_row.op_type === table_row['Tipo de Operacion']) {
                    table_row['Porcentaje de Pedidos'] = ref_row.cells[table_row.Celula].percentage
                }
            }
        }
        setmasterTable(mt)
        const body = {
            method:"POST",
            headers: {
                "Content-Type":"application/json"
            },
            body: JSON.stringify(mt)
        }
        fetch(`${flaskAddress}_save_master_table`, body)
            .then(response => response)
        alert('Cambios Guardados exitosamente')
    }

    // obtener lista de referencias
    const filersList = () => {
        let result = {refs:['Ver Todos'], cells:['Ver Todos'], op_types:['Ver Todos']}
        for (let dict of masterTable) {
            let ref = dict.ReferenciaSAP
            let cell = dict.Celula
            let op_type = dict['Tipo de Operacion']
            if (result.refs.includes(ref) === false) {
                result.refs.push(ref)
            }
            if (result.cells.includes(cell) === false) {
                result.cells.push(cell)
            }
            if (result.op_types.includes(op_type) === false) {
                result.op_types.push(op_type)
            }
        }
        return result
    }

    // mostar pantalla de loading mientras se obtienen los datos
    if (masterTable.length === 0) {
        return (
            <>
                <NavBar />
                <LoadingWindow/>
            </>
        )}

    return (
        <>
            <NavBar handleSaveRefTable={saveChanges} title={'Ajustes de Referencia'}/>
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
                                if (dict.op_type !== selectedOpType && selectedOpType !== 'Ver Todos') {return null}
                                if (getCells(dict).includes(selectedCell) === false && selectedCell !== 'Ver Todos') {return null}

                                return (
                                    <tr key={key}>
                                        <td>{dict.reference}</td>
                                        <td>{dict.op_type}</td>
                                        <td>
                                            <DropdownMultiselect
                                                options={getCells(dict)}
                                                name="countries"
                                                placeholder={"Selecciona una Célula"}
                                                handleOnChange={handleCellSelected(dict.reference, dict.op_type, getCells(dict))}
                                                selected={selected_cells}
                                            />
                                        </td>
                                        <td className={'percentage-column'}>
                                            {PercEntries(dict)}
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
                    <Row>
                        <Col>Celula: </Col>
                        <Col><DropdownList
                            defaultValue={selectedCell}
                            data={filersList().cells}
                            placeholder={'Celula'}
                            value={selectedCell} onChange={(val) => {setselectedCell(val)}}/></Col>
                    </Row>
                    <Row>
                        <Col>Tipo de Operacion: </Col>
                        <Col><DropdownList
                            defaultValue={selectedOpType}
                            data={filersList().op_types}
                            placeholder={'Tipo de Operacion'}
                            value={selectedOpType} onChange={(val) => {setselectedOpType(val)}}/></Col>
                    </Row>
                </Container>
            </div>
        </>
    )
}

export default ConfigurationTable