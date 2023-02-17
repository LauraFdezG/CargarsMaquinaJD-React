import {default as ReactSelect} from "react-select";
import {components} from "react-select";
import {useEffect, useState} from "react";
import {Button, Modal} from "react-bootstrap";

const AddFilterPopUp = (props) =>{
    const [filtersList, setfiltersList] = useState()
    const [selectedFilters, setselectedFilters] = useState()

    useEffect(() => {
        const initialFilters = props.filterList.map((filter) => {
            return (
                {label: filter, value: filter}
            )
        })

        const initialSelectedFilters = props.selectedFilters.map((filter) => {
            return (
                {label: filter, value: filter}
            )
        })

        setfiltersList(initialFilters)
        setselectedFilters(initialSelectedFilters)

    }, [])

    const addSelectedFilters = () => {
        const selFilters = selectedFilters.map((filter) => filter.label)

        props.addFilters(selFilters)
        props.close()
    }


    return (
        <Modal show={props.show} onHide={props.close}>
            <Modal.Header closeButton>
                <Modal.Title>Agregar Filtro</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <ReactSelect
                    options={filtersList}
                    isMulti
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    onChange={(selected) => setselectedFilters(selected)}
                    allowSelectAll={true}
                    value={selectedFilters}
                    components={
                        <components.Option {...props}>
                            <input
                                type="checkbox"
                                checked={selectedFilters}
                                onChange={() => null}
                            />{" "}
                            <label>{props.label}</label>
                        </components.Option>
                    }
                />
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={addSelectedFilters}>
                    Aceptar Cambios
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default AddFilterPopUp