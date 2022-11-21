import "./PopUp.css"
import {Button, Col, Modal, Row} from "react-bootstrap";
import {useState} from "react";

const PopUp = (props) => {
    const [selectedEventType, setselectedEventType] = useState(props.eventTypes[0])
    const [addExtraEvent, setaddExtraEvent] = useState(false)

    const createEvent = () => {
        if (props.events.length === 0 || addExtraEvent) {
            return (
                <Modal show={props.show} onHide={props.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Agregar evento</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row>
                            <Col>
                                Tipo de Evento:
                            </Col>
                            <Col>
                                <select className={'date-options-picker'}
                                        value={selectedEventType}
                                        onChange={(event) => {setselectedEventType(event.target.value)}}
                                        defaultValue={selectedEventType}>
                                    {props.eventTypes.map((type, index)=>{
                                        return(
                                            <option key={index}>{type}</option>
                                        )
                                    })}
                                </select>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={props.handleClose}>
                            Cancelar
                        </Button>
                        <Button variant="primary" onClick={props.handleSave(selectedEventType)}>
                            Guardar
                        </Button>
                    </Modal.Footer>
                </Modal>
            )
        }
    }

    const viewEvent = () => {
        if (props.events.length > 0 && addExtraEvent === false) {
            return (
                <Modal show={props.show} onHide={props.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Informacion del evento</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {props.events.map((event) => {
                            const forbiddenDeletes = ['Fin de Semana', 'Fin mes fiscal']
                            return (
                                <Row>
                                    <Col>
                                        Tipo de Evento:
                                    </Col>
                                    <Col>
                                        {event.name}
                                    </Col>
                                    <Col>
                                        {forbiddenDeletes.includes(event.name) ? null : <Button className={'delete-event-button'} variant={'danger'} value={event.name} onClick={props.handleDelete}>Eliminar</Button>}
                                    </Col>
                                </Row>
                            )
                        })}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={props.handleClose}>
                            Cancelar
                        </Button>
                        <Button variant="primary" onClick={() => {setaddExtraEvent(true)}}>
                            Agregar nuevo evento
                        </Button>
                    </Modal.Footer>
                </Modal>
            )
        }
    }

    return (
        <>
            {createEvent()}
            {viewEvent()}
        </>
    )
}

export default PopUp