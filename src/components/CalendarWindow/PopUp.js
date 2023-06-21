import "./PopUp.css"
import {Button, Col, Modal, Row} from "react-bootstrap";
import {useState} from "react";
import DatePicker from "react-widgets/DatePicker";

const PopUp = (props) => {
    const [selectedEventType, setselectedEventType] = useState(props.eventTypes[0])
    const [addExtraEvent, setaddExtraEvent] = useState(false)
    const [description, setdescription] = useState()
    const [finalDate, setfinalDate] = useState()

    const createEvent = () => {
        if (props.events.length === 0 || addExtraEvent ) {
            if (sessionStorage.getItem("user") === "Administrador" || sessionStorage.getItem("user") === "Manager") {
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
                                            onChange={(event) => {setselectedEventType(event.target.value)}}>
                                        {props.eventTypes.map((type, index)=>{
                                            return(
                                                <option key={type}>{type}</option>
                                            )
                                        })}
                                    </select>
                                </Col>
                            </Row>
                            <Row style={{color:"white"}}>-</Row>
                            <Row>
                                {(selectedEventType === "Parada Programada") ?
                                    <Row>
                                        <Col>Descripción:</Col>
                                        <Col>
                                            <input key={"descripcion"} placeholder={"Añade una descripcion"}
                                                   onChange={(event) => {setdescription(event.target.value)}}>
                                            </input>
                                        </Col>
                                    </Row>: null}
                            </Row>
                            <Row style={{color:"white"}}>-</Row>
                            <Row>
                                <Col>Fecha de fin</Col>
                                <Col>
                                    <DatePicker
                                        // selected={props.events.date}
                                        defaultValue={props.events.date}
                                        // onSelect={handleDateSelect} //when day is clicked
                                        onChange={(event) => {setfinalDate(event)}}
                                    />
                                </Col>
                            </Row>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={props.handleClose}>
                                Cancelar
                            </Button>
                            <Button variant="primary" onClick={props.handleSave(selectedEventType, description, finalDate)}>
                                Guardar
                            </Button>
                        </Modal.Footer>
                    </Modal>
                )
            }

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
                        {props.events.map((event, index) => {
                            let forbiddenDeletes = ['Fin de Semana', 'Fin mes fiscal']
                            if (sessionStorage.getItem("user") !== "Administrador") {
                                forbiddenDeletes = ['Fin de Semana', 'Fin mes fiscal', 'Parada Programada', 'DAP', 'RJI', 'Festivo Local', 'Festivo', 'Inhabil', 'Fiesta Comunidad']
                            }
                            return (
                                <>
                                    <Row key={index}>
                                        <Col>
                                            Tipo de Evento:
                                        </Col>
                                        <Col>
                                            {event.name}
                                        </Col>
                                        <Col>
                                            {(forbiddenDeletes.includes(event.name) || event.allowDelete === false) ? null : <Button className={'delete-event-button'} variant={'danger'} value={event.name} onClick={props.handleDelete}>Eliminar</Button>}
                                        </Col>
                                    </Row>
                                    {(event.name === "Parada Programada") ? <Row><Col style={{color:"white"}}>-</Col><Col>Descripcion</Col><Col>{event.description}</Col></Row> : null}
                                    <Row key={index}>
                                        <Col>Fecha de fin</Col>
                                        <Col>{new Date(event.endDate).toLocaleDateString()}</Col>
                                    </Row>
                                </>
                            )
                        })}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={props.handleClose}>
                            Cancelar
                        </Button>
                        {(sessionStorage.getItem("user") === "Administrador" || sessionStorage.getItem("user") === "Manager") ? <Button variant="primary" onClick={() => {setaddExtraEvent(true)}}>Agregar nuevo evento</Button> : null}

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