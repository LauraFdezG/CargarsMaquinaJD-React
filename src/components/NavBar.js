import {FaBars} from "react-icons/fa"
import "./NavBar.css"
import { useState} from "react";
import {Button, ButtonGroup, Dropdown, Offcanvas, Spinner} from "react-bootstrap";
import {Link, useNavigate} from "react-router-dom";
import {AiFillSetting, AiFillCalendar} from "react-icons/ai"
import {MdAnalytics} from "react-icons/md"
import logo from "../resources/johnDeereLogo.png"
import {SiJohndeere} from "react-icons/si"
import {VscSettings} from "react-icons/vsc"
import {RiInboxUnarchiveFill} from "react-icons/ri"
import { MdOutlineAutoGraph, MdPersonOutline } from "react-icons/md";

const windowInfo = [
    {
        title:"Cargas de Maquina",
        path: "/cargas_maquina",
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
    },
    {
        title: 'Ajustes de Celula',
        path: "/cell_settings",
        icon: <VscSettings className={'sidebar-icon'}/>
    },
    {
        title: 'Resumen de Carga',
        path: "/resumen_carga",
        icon: <MdOutlineAutoGraph className={'sidebar-icon'}/>
    },
    {
        title: 'Roles',
        path: "/roles",
        icon: <MdPersonOutline className={'sidebar-icon'}/>
    },
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
                        <Dropdown.Item onClick={props.exportSettings}>Exportar Ajustes</Dropdown.Item>
                        <Dropdown.Item onClick={props.importSettings}>Importar Ajustes</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            )
        }
    }

    const settingsButtons = () => {
        if (props.settingsButtons === undefined) {return}
        return (
            props.settingsButtons
        )
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
                <>
                    <div className={"last-updated-text"}>Ultima actualizacion: {props.lastUpdate}</div>
                    <Button onClick={props.updateOrdersTable}>Actualizar pedidos</Button>
                </>
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
        if (props.title === "Resumen de Cargas") {
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
                <div style={{paddingRight: 20}}>
                    <Button variant="primary" onClick={props.handleSaveSimulation} disabled={!!props.isCargaMaquinaButtonLoading}>
                        {props.isCargaMaquinaButtonLoading ? downloadingSpinner() : "Guardar Resumen"}
                    </Button>
                </div>

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
                <option value="/resumen_paradas">Resumen Paradas</option>
            </select>
        )
    }

    // boton para cambiar el modo de visualizacion del calendario
    const configurationClicked = () => {
        const handleConfigurationClicked = (event) => {
            navigate(event.target.value)
        }
        if (props.title !== 'Ajustes de Referencia') {return}
        return(
            <select className={'view-mode-picker'} onChange={handleConfigurationClicked} value={props.currentConfiguration}>
                <option value="/reference_settings">General</option>
                <option value="/hrs_std">Horas STD</option>
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
                    {configurationClicked()}
                    {updateOrdersTableButton()}
                    {saveCargaMaquinaSimulation()}
                    {settingsButtons()}
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