import {FaBars} from "react-icons/fa"
import "./NavBar.css"
import { useState} from "react";
import {Button, ButtonGroup, Dropdown, Offcanvas} from "react-bootstrap";
import {Link, useNavigate} from "react-router-dom";
import {AiFillSetting, AiFillCalendar} from "react-icons/ai"
import {MdAnalytics} from "react-icons/md"

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
                {refSaveButton()}
                {calendarViewModeButton()}
            </div>
            <Offcanvas show={showSidebar} onHide={handleClose}>
                <Offcanvas.Header closeButton closeVariant={'white'}>
                    <Offcanvas.Title>Cargas de Maquina JD</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    {windowInfo.map((item, key) => {
                        return(
                            <Link to={item.path} key={key}>
                                <h4 key={key} onClick={handleClose}>{item.title}</h4>
                                {item.icon}
                            </Link>
                        )
                    })}
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}

export default NavBar