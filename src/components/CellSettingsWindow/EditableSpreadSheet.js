import Spreadsheet from "react-spreadsheet";
import {useEffect, useState} from "react";
import {DropdownList} from "react-widgets/cjs";
import {Table} from "react-bootstrap";
import {json} from "react-router-dom";
import DropdownMultiselect from "react-multiselect-dropdown-bootstrap";
import {components} from "react-select";
import { default as ReactSelect } from "react-select";

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

    useEffect(() => {
        setData(props.tableData)
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
        return (
            Object.keys(props.tableData[0]).map((value, index) => {
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
                return (
                    <tr key={index}>
                        <td>{index}</td>
                        {Object.keys(props.tableData[0]).map((columnName, index2) => {
                            let rowData = {index: index, columnName: columnName}
                            return (
                                <td key={index2}>
                                    <input value={dict[columnName]} className={'spreadsheet-input'} onChange={handleDataChanged} id={JSON.stringify(rowData)}/>
                                </td>
                            )
                        })}
                    </tr>
                )
            })
        )
    }

    if (data.length === 0) {return }

    return (
        <div>
            <Table striped hover bordered size={"sm"}>
                <thead>
                    <tr>
                        <th></th>
                        {tableHeaders()}
                    </tr>
                </thead>
                <tbody>
                    {tableBody()}
                </tbody>
            </Table>
        </div>
    )
}

export default EditableSpreadSheet