import NavBar from "../NavBar";
import LoadingWindow from "../LoadingWindow";
import flaskAddress from "../Constants";
import {useEffect, useState} from "react";
import {Button, Table} from "react-bootstrap";
import EditableSpreadSheet from "../CellSettingsWindow/EditableSpreadSheet";
import {DropdownList} from "react-widgets/cjs";
import { default as ReactSelect } from "react-select";
import {motion, AnimatePresence} from "framer-motion";
import {components} from "react-select";
import Autocomplete from "react-widgets/Autocomplete";
import ErrorWindow from "../ErrorWindow/ErrorWindow";

const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"

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

const RoleWindow = () => {
    const [roleSettings, setroleSettings] = useState([])
    const [filteredColumns, setFilteredColumns] = useState({})
    const [roleList, setroleList] = useState([{label: "Administrador", value: "Administrador"}, {label: "Manager", value: "Manager"}, {label: "Usuario", value: "Usuario"}])

    // obetener tabla con roles
    const getRoles = async () => {
        const msg = {
            method:"GET",
            headers: {
                "Content-Type":"application/json"
            }
        }
        fetch(`${flaskAddress}_get_roles`, msg)
            .then(response => response.json())
            .then(json => {
                json.map((dict, index) => {
                    dict.id = index
                    return (dict)
                })
                setroleSettings(json)
                console.log(json)
            })

    }

    useEffect(()=> {
        getRoles().then(r=>r)
    }, [])

    // botones que iran en el navbar
    const settingsButtons = () => {
        return (
            <div className={'cell-settings-container'}>
                <Button onClick={addRow}>Agregar Fila</Button>
                <Button onClick={saveSettings}>Guardar Cambios</Button>
            </div>
        )
    }

    // handler para guardar los cambio realizados
    const saveSettings = () => {
        const msg = {
            method:"POST",
            headers: {
                "Content-Type":"application/json"
            },
            body: JSON.stringify({filename: "roles_table.xlsx", data: roleSettings})
        }
        fetch(`${flaskAddress}save_settings`, msg)
            .then(response => alert("Cambios guardados exitosamente"))
    }

    // agregar fila a la tabla de datos
    const addRow = () => {
        let table = [...roleSettings]
        let emptyRow = {}
        for (let columnName in table[0]) {
            emptyRow[columnName] = ""
        }
        emptyRow.id = table.length
        console.log(emptyRow)
        table.unshift(emptyRow)
        setroleSettings(table)
    }

    // eliminar fila de la tabla de datos
    const deleteRow = (event) => {
        let table = [...roleSettings]
        table.splice(event.target.id, 1)
        setroleSettings(table)
    }

    // encabezados para la tabla
    const tableHeaders = () => {
        let h = Object.keys(roleSettings[0])
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

    // componente que establece los filtros para cada columna
    const filterComponent = (columnName) => {
        let dataList = roleSettings.map((dict) => {
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

    const sortByPreferredColumns = (array) => {
        // minifabica -> grupos -> celulas -> cajas -> refeferencias
        let preferences = {"Usuario": 0, "Rol":1, "Minifabrica": 2, "Departamento":3, "Operacion":4}
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

    // handler de cambios de tabla
    const handleDataChanged = (event) => {
        let d = [...roleSettings]
        let rowData = JSON.parse(event.target.id)
        d[rowData.index][rowData.columnName] = event.target.value.trim()
        setroleSettings(d)
    }

    // cuerpo con los datos de la tabla
    const tableBody = () => {
        return (
            roleSettings.map((dict, index) => {
                if (displayRow(dict) === false) {return }
                let h = Object.keys(roleSettings[0])
                h = sortByPreferredColumns(h)
                return (
                    <motion.tr key={dict.id}
                               initial={{ scale: 0 }}
                               animate={{ scale: 1 }}
                               transition={{duration: 0.1}}
                               exit={{scale: 0}}
                               layout
                               layoutId={dict.id}
                    >
                        <td>{index}</td>
                        {h.map((columnName, index2) => {
                            let rowData = {index: index, columnName: columnName}
                            if (columnName === "id") {return}
                            if (columnName === "Usuario") {
                                return (
                                    <td key={index2}>
                                        <input value={dict[columnName]} className={'spreadsheet-input'} onChange={handleDataChanged} id={JSON.stringify(rowData)}/>
                                    </td>
                                )
                            }
                            if (columnName === "Rol") {
                                return (
                                    <td key={index2}>
                                        <input value={dict[columnName]} className={'spreadsheet-input'} onChange={handleDataChanged} id={JSON.stringify(rowData)}/>
                                        {/*<ReactSelect*/}
                                        {/*    options={roleList}*/}
                                        {/*    closeMenuOnSelect={false}*/}
                                        {/*    hideSelectedOptions={false}*/}
                                        {/*    allowSelectAll={true}*/}
                                        {/*    // value={filteredColumns[columnName]}*/}
                                        {/*    components={{*/}
                                        {/*        Option*/}
                                        {/*    }}*/}
                                        {/*    placeholder={dict[columnName]}*/}


                                        {/*    // menuIsOpen={true}*/}
                                        {/*/>*/}
                                        {/*<Autocomplete*/}
                                        {/*    getItemValue={(item) => item.label}*/}
                                        {/*    items={[*/}
                                        {/*        { label: 'Administrador' },*/}
                                        {/*        { label: 'Manager' },*/}
                                        {/*        { label: 'Usuario' }*/}
                                        {/*    ]}*/}
                                        {/*    renderItem={(item, isHighlighted) =>*/}
                                        {/*        <div style={{ background: isHighlighted ? 'lightgray' : 'white' }}>*/}
                                        {/*            {item.label}*/}
                                        {/*        </div>*/}
                                        {/*    }*/}
                                        {/*    value={dict[columnName]}*/}
                                        {/*    // onChange={(e) => value = e.target.value}*/}
                                        {/*    // onSelect={(val) => value = val}*/}
                                        {/*/>*/}
                                    </td>
                                )
                            }
                            else {
                                return (
                                    <td key={index2}>
                                        <input value={dict[columnName]} className={'spreadsheet-input'} onChange={handleDataChanged} id={JSON.stringify(rowData)}/>
                                    </td>
                                )
                            }

                        })}
                        <td>
                            <button className={'delete-row-button'} id={index} onClick={deleteRow}>X</button>
                        </td>
                    </motion.tr>
                )
            })
        )
    }

    if (sessionStorage.getItem("user") !== "Administrador") {
        return (
            <ErrorWindow/>
        )
    }

    if (roleSettings.length === 0) {
        return (
            <div>
                <NavBar title={"Roles"}/>
                <LoadingWindow/>
            </div>
        )
    }

    return (
        <div style={{marginTop: 54}}>
            <NavBar title={"Roles"} settingsButtons={settingsButtons()}/>
            {/*<EditableSpreadSheet tableData={roleSettings} deleteRow={deleteRow}/>*/}
            <div className={'animated-container'}>
                <Table striped hover bordered size={"sm"}>
                    <thead>
                    <tr>
                        <td></td>
                        {Object.keys(roleSettings[0]).map((columnName, index) => {
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

                    {tableBody()}

                    </tbody>
                </Table>
            </div>
        </div>
    )
}

export default RoleWindow