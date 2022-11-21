import {FaBars} from "react-icons/fa"
import "./NavBar.css"
import {useState} from "react";
import {Button, ButtonGroup, Dropdown, Offcanvas} from "react-bootstrap";
import {Link} from "react-router-dom";
import {AiFillSetting, AiFillCalendar} from "react-icons/ai"

const windowInfo = [
    {
        title:'Ajustes de Referencia',
        path: "/", // cambiar despues por ref_settings
        icon: <AiFillSetting className={'side-bar-icon'}/>
    },
    {
        title:'Calendario',
        path: "/calendar",
        icon: <AiFillCalendar className={"side-bar-icon"}/>
    }
]

const NavBar = (props) => {
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
        if (props.handleCalendarViewMode === undefined) {return}
        return(
            <select className={'view-mode-picker'}>
                <option value="General">General</option>
                <option value="Mensual">Mensual por Celula</option>
                <option value="Diario">Diario por Celula</option>
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
                    <Offcanvas.Title>Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    {windowInfo.map((item, key) => {
                        return(
                            <Link to={item.path}>
                                <h9 key={key} onClick={handleClose}>{item.title}</h9>
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