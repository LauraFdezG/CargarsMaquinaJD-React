import {default as ReactSelect} from "react-select";
import {components} from "react-select";
import {useEffect, useState} from "react";
import {Button, Modal} from "react-bootstrap";



const AddCellPopUp = (props) =>{
    const [cellsList, setcellsList] = useState()
    const [selectedCells, setselectedCells] = useState()

    useEffect(() => {
        const initialCells = props.cellsList.map((cell) => {
            return (
                {label: cell, value: cell}
            )
        })

        const initialSelectedCells = props.selectedCells.map((cell) => {
            return (
                {label: cell, value: cell}
            )
        })

        setcellsList(initialCells)
        setselectedCells(initialSelectedCells)

    }, [])

    const addSelectedCells = () => {
        const selCells = selectedCells.map((cell) => cell.label)

        props.addCells(selCells)
        props.close()
    }

    return(
        <Modal show={props.show} onHide={props.close}>
            <Modal.Header closeButton>
                <Modal.Title>Agregar Células</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ReactSelect
                    options={cellsList}
                    isMulti
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    onChange={(selected) => setselectedCells(selected)}
                    allowSelectAll={true}
                    value={selectedCells}
                    components={
                        <components.Option {...props}>
                            <input
                                type="checkbox"
                                checked={selectedCells}
                                onChange={() => null}
                            />{" "}
                            <label>{props.label}</label>
                        </components.Option>
                    }
                />
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={addSelectedCells}>
                    Aceptar Cambios
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default AddCellPopUp
