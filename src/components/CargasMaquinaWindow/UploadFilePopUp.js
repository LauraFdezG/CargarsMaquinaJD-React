import {useState} from "react";
import {Button, Col, Modal, Row} from "react-bootstrap";
import flaskAddress from "../Constants";
import {json} from "react-router-dom";
import React from 'react';

const UploadFilePopUp = (props) => {
    const [file, setfile] = useState(null)

    // selecciona el archivo
    const handleFileSelected = (event) => {
        setfile(event.target.files[0])
    }

    // hace el request para subir el archivo al servidor
    const handleUploadFile = (event) => {
        let data = new FormData()
        data.append("file", file)
        const body = {
            method:"POST",
            body: data
        }
        fetch(`${flaskAddress}_import_simulation`, body)
            .then(response => response.json())
            .then(json => {
                props.applySimulationData(json)
            })
        props.close()
    }

    return (
        <Modal show={props.show} onHide={props.close}>
            <Modal.Header closeButton>
                <Modal.Title>Importar Simulacion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h6>Importar Simulacion</h6>
                <input type={"file"} name={"file"} onChange={handleFileSelected} accept= "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"/>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={props.close}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleUploadFile} disabled={(file === undefined ? true : false)}>
                    Importar
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default UploadFilePopUp