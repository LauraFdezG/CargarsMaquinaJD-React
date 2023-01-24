import {FaBars} from "react-icons/fa"
import "./NavBar.css"
import { useState} from "react";
import {Button, ButtonGroup, Dropdown, Offcanvas, Spinner} from "react-bootstrap";
import {Link, useNavigate} from "react-router-dom";
import {AiFillSetting, AiFillCalendar} from "react-icons/ai"
import {MdAnalytics} from "react-icons/md"
import logo from "../resources/johnDeereLogo.png"
import {SiJohndeere} from "react-icons/si"

const windowInfo = [
    {
        title:"Cargas de Maquina",
        path: "/",
        icon: <MdAnalytics className={'side-bar-icon'}/>
    },
    {
        title:'Ajustes de Referencia',
        path: "/reference_settings", // cambiar despues por ref_settings
        icon: <AiFillSetting className={'side-bar-icon'}/>
    },
    {
        title:'Calendario',
        path: "/calendar",
        icon: <AiFillCalendar className={"side-bar-icon"}/>
    }
]

const NavBar = (props) => {
    let navigate = useNavigate()
    const [showSidebar, setshowSidebar] = useState(false)

    // hacer que aparezca el sidebar
    const handleClick = () => {
        setshowSidebar(!showSidebar)
    }

    // hacer que se esconda el sidebar
    const handleClose = () => {setshowSidebar(false)}

    // boton de guardar ajustes de referencia
    const refSaveButton = () => {
        if (props.handleSaveRefTable !== undefined) {
            return (
                <Dropdown as={ButtonGroup} className={'save-button'}>
                    <Button variant="primary" onClick={props.handleSaveRefTable}>Guardar cambios</Button>
                    <Dropdown.Toggle split variant="primary" id="dropdown-split-basic" />
                    <Dropdown.Menu>
                        <Dropdown.Item>Exportar Ajustes</Dropdown.Item>
                        <Dropdown.Item>Importar Ajustes</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            )
        }
    }

    // boton para actualizar tabla de pedidos
    const updateOrdersTableButton = () => {
        if (props.updateOrdersTable === undefined) {return }
        if (props.ordersUpdating === true) {
            return (
                <Button disabled={true}>
                    Actualizando Pedidos...
                    <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                    />
                </Button>
            )
        }
        else {
            return (
                <Button onClick={props.updateOrdersTable}>Actualizar pedidos</Button>
            )
        }
    }

    // boton de guardar simulacion de carga de maquina
    const saveCargaMaquinaSimulation = () => {
        if (props.title === "Cargas de Maquina") {
            const downloadingSpinner = () => {
                return (
                    <>
                        Descargando....
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                        />
                    </>
                )
            }
            return (
                <>
                <Dropdown as={ButtonGroup} className={'save-button'}>
                    <Button variant="primary" onClick={props.handleSaveSimulation} disabled={!!props.isCargaMaquinaButtonLoading}>
                        {props.isCargaMaquinaButtonLoading ? downloadingSpinner() : "Guardar Simulacion"}
                    </Button>
                    <Dropdown.Toggle split variant="primary" id="dropdown-split-basic" />
                    <Dropdown.Menu>
                        <Dropdown.Item disabled={!!props.isCargaMaquinaButtonLoading} onClick={props.handleImportSimulation}>
                            {props.isCargaMaquinaButtonLoading ? downloadingSpinner() : "Importar Simulacion"}
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                </>
            )
        }
    }

    // boton para cambiar el modo de visualizacion del calendario
    const calendarViewModeButton = () => {
        const handleCalendarClicked = (event) => {
            navigate(event.target.value)
        }
        if (props.title !== 'Calendario') {return}
        return(
            <select className={'view-mode-picker'} onChange={handleCalendarClicked} value={props.currentCalendar}>
                <option value="/calendar">General</option>
                <option value="/monthly_calendar">Mensual por Celula</option>
                <option value="/daily_calendar">Diario por Celula</option>
            </select>
        )
    }


    return(
        <>
            <div className={'navbar'}>
                <FaBars className={'bars'} onClick={handleClick}/>
                <h4>{props.title}</h4>
                <div className={"right-side-buttons-container"}>
                    {refSaveButton()}
                    {calendarViewModeButton()}
                    {updateOrdersTableButton()}
                    {saveCargaMaquinaSimulation()}
                </div>
            </div>
            <Offcanvas show={showSidebar} onHide={handleClose}>
                <Offcanvas.Header closeButton closeVariant={'white'}>
                    <Offcanvas.Title>
                        <div className={'navbar-title'}>
                            <SiJohndeere/> Cargas de Maquina JD
                        </div>
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    {windowInfo.map((item, key) => {
                        return(
                            <Link to={item.path} key={key}>
                                <div className={'navbar-option'}>
                                    {item.icon}
                                    <h4 key={key} onClick={handleClose}>{item.title}</h4>
                                </div>
                            </Link>
                        )
                    })}
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}

export default NavBar