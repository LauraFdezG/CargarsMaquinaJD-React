import {Button, Modal} from "react-bootstrap";
import { default as ReactSelect } from "react-select";
import {useEffect, useState} from "react";
import {components} from "react-select";


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

const AddReferencePopUp = (props) => {
    const [refsSelected, setrefsSelected] = useState([])
    const [references, setreferences] = useState([])

    useEffect(()=>{
        let values = []
        let refs: Array = props.masterTable.map(dict => dict.ReferenciaSAP)
        refs = refs.sort()
        refs = new Set(refs)
        for (let r of refs) {
            values.push({value: r, label: r})
        }
        setreferences(values)
    }, [])

    const addSelectedReferences = () => {
        let master = [...props.originalmasterTable]
        let m = [...master]
        let refs = []
        for (let dict of refsSelected) {
            refs.push(dict.value)
        }
        m = [...new Map(m.map(item =>
            [item["ReferenciaSAP"], item])).values()];
        m = m.filter(dict => refs.includes(dict.ReferenciaSAP))
        for (let dict of m) {
            let newRef = {
                Celula: props.cell,
                CodMinif: dict.CodMinif,
                HorasSTD: 0,
                Minifabrica: dict.Minifabrica,
                NombreEquipo: dict.NombreEquipo,
                "Porcentaje de Pedidos": 1,
                ReferenciaSAP: dict.ReferenciaSAP,
                "Tipo de Operacion": dict["Tipo de Operacion"],
                editedCell: dict.editedCell,
                originalHrsSTD: dict.originalHrsSTD
            }
            master.push(newRef)
        }
        props.setmasterTable(master)
        props.close()
    }

    return (
        <Modal show={props.show} onHide={props.close}>
            <Modal.Header closeButton>
                <Modal.Title>Agregar Referencias</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h6>Agregar Referencias</h6>
                <ReactSelect
                    options={references}
                    isMulti
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    onChange={(selected) => setrefsSelected(selected)}
                    allowSelectAll={true}
                    value={refsSelected}
                    components={{
                        Option
                    }}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={addSelectedReferences}>
                    Aceptar Cambios
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default AddReferencePopUp