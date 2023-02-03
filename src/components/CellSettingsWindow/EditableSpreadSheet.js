import Spreadsheet from "react-spreadsheet";
import {useEffect, useState} from "react";
import {DropdownList} from "react-widgets/cjs";
import {Collapse, Fade, Table} from "react-bootstrap";
import {json} from "react-router-dom";
import DropdownMultiselect from "react-multiselect-dropdown-bootstrap";
import {components} from "react-select";
import { default as ReactSelect } from "react-select";
import {motion, AnimatePresence} from "framer-motion";


const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"

// funcion para array de columnas por el siguiente orden de prioridad
const sortByPreferredColumns = (array) => {
    // minifabica -> grupos -> celulas -> cajas -> refeferencias
    let preferences = {"minifabrica": 0, "grupos":1, "celulas":2, "cajas":3, "referencias":4}
    let columnOrder = {}
    for (let item of array) {
        for (let key in preferences) {
            if (key.toLowerCase().includes(item.toLowerCase().trim())) {
                columnOrder[preferences[key]] = item
            }
        }
    }
    let result = Object.keys(columnOrder).map(key => columnOrder[key])
    let missingItems = array.filter(item => result.includes(item) === false)
    return result.concat(missingItems)
}

const Option = (props) => {
    return (
        <div>
            <components.Option {...props}>
                <input
                    type="checkbox"
                    checked={props.isSelected}
                    onChange={() => null}
                />{" "}
                <label>{props.label}</label>
            </components.Option>
        </div>
    );
};

const EditableSpreadSheet = (props) => {
    const [data, setData] = useState(props.tableData)
    const [headers, setHeaders] = useState(Object.keys(props.tableData[0]))
    const [dataBackUp, setdataBackUp] = useState([])
    const [filteredColumns, setFilteredColumns] = useState({})

    // componente que establece los filtros para cada columna
    const filterComponent = (columnName) => {
        let dataList = props.tableData.map((dict) => {
            return (
                dict[columnName].toString()
            )
        })
        dataList = new Set(dataList)
        dataList = Array.from(dataList).sort()
        dataList = dataList.map((value) => {
            return (
                {value: value, label: value}
            )
        })

        const filterSelected = (selected) => {
            selected = selected.map(dict => dict.value)
            let filters = {...filteredColumns}
            filters[columnName] = selected
            setFilteredColumns(filters)
        }

        return (
            <ReactSelect
                options={dataList}
                isMulti
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                onChange={filterSelected}
                allowSelectAll={true}
                // value={filteredColumns[columnName]}
                components={{
                    Option
                }}
                placeholder={"(Todas)"}
                className={'spreadsheet-filter'}
                // menuIsOpen={true}
            />
        )
    }

    // cargar los datos dados al spreadsheet
    useEffect(() => {
        setData(props.tableData)
        setHeaders(Object.keys(props.tableData[0]))
    }, [props.tableData])

    // handler de cambios de tabla
    const handleDataChanged = (event) => {
        let d = [...data]
        let rowData = JSON.parse(event.target.id)
        d[rowData.index][rowData.columnName] = event.target.value.trim()
        setData(d)
    }

    // funcion que comprueba si la fila se puede mostrar o no
    const displayRow = (dict) => {
        for (let columnName in dict) {
            let value = dict[columnName].toString()
            let allowedValues = filteredColumns[columnName]
            if (allowedValues === undefined) {
                continue
            }
            if (allowedValues.length  === 0) {
                continue
            }
            if (allowedValues.includes(value) === false) {
                return false
            }
        }
        return true
    }

    // encabezados para la tabla
    const tableHeaders = () => {
        let h = Object.keys(props.tableData[0])
        h = sortByPreferredColumns(h)
        return (
            h.map((value, index) => {
                if (value === "id") return
                return (
                <th key={index}>
                        {value}
                        {filterComponent(value)}
                    </th>
                )
            })
        )
    }

    // cuerpo con los datos de la tabla
    const tableBody = () => {
        return (
            data.map((dict, index) => {
                if (displayRow(dict) === false) {return }
                let h = Object.keys(props.tableData[0])
                h = sortByPreferredColumns(h)
                return (
                    <motion.tr key={dict.id}
                               initial={{ scale: 0 }}
                               animate={{ scale: 1 }}
                               transition={{duration: 0.2}}
                               exit={{scale: 0}}
                               layout
                               layoutId={dict.id}
                    >
                        <td>{index}</td>
                        {h.map((columnName, index2) => {
                            let rowData = {index: index, columnName: columnName}
                            if (columnName === "id") return
                            return (
                                <td key={index2}>
                                    <input value={dict[columnName]} className={'spreadsheet-input'} onChange={handleDataChanged} id={JSON.stringify(rowData)}/>
                                </td>
                            )
                        })}
                        <td>
                            <button className={'delete-row-button'} id={index} onClick={deleteRow}>X</button>
                        </td>
                    </motion.tr>
                )
            })
        )
    }

    const deleteRow = (event) => {
        props.deleteRow(event)
    }


    if (data.length === 0) {return }

    return (
        <div className={'animated-container'}>
            <Table striped hover bordered size={"sm"}>
                <thead>
                    <tr>
                        <td></td>
                        {Object.keys(props.tableData[0]).map((columnName, index) => {
                            return (
                                <td key={index}>{alphabet[index]}</td>
                            )
                        })}
                    </tr>
                    <tr>
                        <th></th>
                        {tableHeaders()}
                    </tr>
                </thead>
                <tbody>
                    <AnimatePresence>
                        {tableBody()}
                    </AnimatePresence>
                </tbody>
            </Table>
        </div>
    )
}

export default EditableSpreadSheet