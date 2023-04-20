import {default as ReactSelect} from "react-select";
import {components} from "react-select";
import {useEffect, useState} from "react";
import {Button, Modal} from "react-bootstrap";

const AddPopUp = (props) =>{
    const [list, setlist] = useState()
    const [selected, setselected] = useState()

    useEffect(() => {
        const initialList = props.inputList.map((filter) => {
            return (
                {label: filter, value: filter}
            )
        })

        const initialSelected = props.inputSelected.map((filter) => {
            return (
                {label: filter, value: filter}
            )
        })

        setlist(initialList)
        setselected(initialSelected)

    }, [])

    const addSelected = () => {
        const selectedItems = selected.map((filter) => filter.label)

        props.addItems(selectedItems)
        props.close()
    }

    const addAll = () => {
        setselected(list)
    }


    return (
        <Modal show={props.show} onHide={props.close}>
            <Modal.Header closeButton>
                <Modal.Title>{props.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ReactSelect
                    options={list}
                    isMulti
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    onChange={(selected) => setselected(selected)}
                    allowSelectAll={true}
                    value={selected}
                    components={
                        <components.Option {...props}>
                            <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => null}
                            />{" "}
                            <label>{props.label}</label>
                        </components.Option>
                    }
                />
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={addAll}>
                    Agregar Todos
                </Button>
                <Button onClick={addSelected}>
                    Aceptar Cambios
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default AddPopUp