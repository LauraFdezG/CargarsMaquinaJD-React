import {Button, Modal} from "react-bootstrap";
import { default as ReactSelect } from "react-select";
import {useEffect, useState} from "react";
import {components} from "react-select";
import React from 'react';

//ULTIMA VERSION
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

    let refsInOriginalMasterTable = props.originalmasterTable.filter(dict => dict.Celula === props.cell)
    refsInOriginalMasterTable = Array.from(new Set(refsInOriginalMasterTable.map((dict) => dict.ReferenciaSAP)))
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


    },[])

    useEffect(()=>{
        let selectedRefs = Array.from(new Set(props.cellMasterTable.map((dict) => dict.ReferenciaSAP)))
        const initialRefs = selectedRefs.map((ref) => {
            return (
                {label: ref, value: ref}
            )
        })

        setrefsSelected(initialRefs)
    }, [props.cellMasterTable])


    const addSelectedReferences = () => {
        let master = [...props.originalmasterTable]
        let m = [...master]
        let entireMT = [...props.entireMasterTable]
        let refs = []
        for (let dict of refsSelected) {
            refs.push(dict.value)
        }
        m = [...new Map(m.map(item =>
            [item["ReferenciaSAP"], item])).values()];
        m = m.filter(dict => refs.includes(dict.ReferenciaSAP))

        for (let r of refs) {
            let newRef = {}

            for (let dict of entireMT) {

                if (dict.ReferenciaSAP.toString() === r.toString() && dict.Celula.toString() === props.cell.toString()) {

                    newRef = {
                        Celula: props.cell,
                        CodMinif: dict.CodMinif,
                        HorasSTD: dict.HorasSTD,
                        Minifabrica: dict.Minifabrica,
                        NombreEquipo: dict.NombreEquipo,
                        "Porcentaje de Pedidos": 1,
                        ReferenciaSAP: dict.ReferenciaSAP,
                        "Tipo de Operacion": dict["Tipo de Operacion"],
                        editedCell: dict.editedCell,
                        originalHrsSTD: dict.originalHrsSTD
                    }
                    console.log(newRef)
                }
            }
            if (Object.keys(newRef).length === 0) {
                for (let dict of m) {
                    newRef = {
                        Celula: props.cell,
                        CodMinif: dict.CodMinif,
                        HorasSTD: 0,
                        Minifabrica: dict.Minifabrica,
                        NombreEquipo: dict.NombreEquipo,
                        "Porcentaje de Pedidos": 1,
                        ReferenciaSAP: r,
                        "Tipo de Operacion": dict["Tipo de Operacion"],
                        editedCell: dict.editedCell,
                        originalHrsSTD: 0
                    }
                    if (refsInOriginalMasterTable.includes(dict.ReferenciaSAP)) {
                        continue
                    }
                }
            }
            let exists = false

            for (let dict of master) {
                if (dict.Celula === props.cell && dict.ReferenciaSAP === r) {
                    exists = true
                }
            }

            if (exists === false) {
                console.log(newRef)
                master.push(newRef)
            }
        }

        let selectedRefsList = refsSelected.map((dict) => dict.value)
        let refsToDelete = refsInOriginalMasterTable.filter(ref => selectedRefsList.includes(ref) === false)
        //console.log(refsToDelete)
        for (let ref of refsToDelete) {
            for (let dict2 of master) {
                if (dict2.Celula.toString() === props.cell && dict2.ReferenciaSAP === ref) {
                    dict2.Celula = ""
                }
            }
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