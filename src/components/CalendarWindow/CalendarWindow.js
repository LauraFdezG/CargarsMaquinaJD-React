import NavBar from "../NavBar";
import "./CalendarWindow.css"
import {useEffect, useState} from "react";
import Calendar from 'rc-year-calendar';
import 'rc-year-calendar/locales/rc-year-calendar.es';
import LoadingWindow from "../LoadingWindow";
import PopUp from "./PopUp";
import {type} from "@testing-library/user-event/dist/type";
import {json} from "react-router-dom";
import flaskAddress from "../Constants";

const CalendarWindow = () => {
    const [calendarViewMode, setcalendarViewMode] = useState('General')
    const [calendarData, setcalendarData] = useState([])
    const [Show, setShow] = useState(false)
    const [eventsSelected, seteventsSelected] = useState([])
    const [dateSelected, setdateSelected] = useState(null)

    // funcion que descarga el calendario general
    const getGeneralCalendar = async () => {
        const msg = {
            method:"GET",
            headers: {
                "Content-Type":"application/json"
            }
        }
        fetch(`${flaskAddress}_get_general_calendar`, msg)
            .then(response => response.json())
            .then(json => {
                let calendar = json
                for (let dict of calendar) {
                    dict.startDate = new Date(dict.startDate)
                    dict.endDate = new Date(dict.endDate)
                    dict.color = eventTypesColors[dict.name]
                }
                setcalendarData(calendar)
            })
    }

    // año natural actual
    const currentYear = new Date().getFullYear();

    // guia de colores para los tipos de eventos
    const eventTypesColors = {
        'Fin mes fiscal': '#FCCA03FF',
        'Fin de Semana':'#ffffff',
        'Festivo':'#ff0000',
        'Inhabil':'#0048ff',
        'Fiesta Comunidad':'#ff5900',
        'Fiesta Local':'#00ff00',
        'Parada Programada':'#808080'
    }

    const createEventTypesColors = {
        'Festivo':'#ff0000',
        'Inhabil':'#0048ff',
        'Fiesta Comunidad':'#ff5900',
        'Fiesta Local':'#00ff00',
        'Parada Programada':'#808080'
    }

     // cambiar modo de visualizacion de calendario
    const handleCalendarViewModeSelected = () => {
    }

    // obtener calendario general al abrir la ventana
    useEffect(()=> {
        getGeneralCalendar().then(r=>r)
    }, [])

    // cerrar el popup
    const handleClose = () => setShow(false)

    // hacer que aparezca el popup
    const handleShow = (event) => {
        setdateSelected(event.date)
        if (event.events.length > 0) {
            setShow(true)
            seteventsSelected(event.events)
        }
        else {
            setShow(true)
            seteventsSelected([])
        }
    }

    // guardar los eventos nuevos
    const handleSave = (eventType) => (event) => {
        let cal = [...calendarData]
        const data = {
            name: eventType,
            startDate: dateSelected,
            endDate: dateSelected,
            color: eventTypesColors[eventType]
        }
        cal.push(data)
        setcalendarData(cal)
        handleClose()
        saveChanges(cal)
    }

    // eliminar el evento seleccionado
    const handleDelete = (event) => {
        const eventType = event.target.value
        let cal = [...calendarData]
        for (let i in cal) {
            const dict = cal[i]
            const name = dict.name
            const startDate = dict.startDate
            const endDate = dict.endDate
            if (eventType === name && dateSelected.getTime() === startDate.getTime()) {
                cal.splice(i, 1)
                break
            }
        }
        setcalendarData(cal)
        handleClose()
        saveChanges(cal)
    }

    // guardar los cambios cada que se crea/borra un evento
    const saveChanges = (calendar) => {
        const msg = {
            method:"POST",
            headers: {
                "Content-Type":"application/json"
            },
            body: JSON.stringify(calendar)
        }
        fetch(`${flaskAddress}_save_general_calendar`, msg)
            .then(response => response)
    }

    // mostrar pantalla de carga mientras se carga el calendario
    if (calendarData.length === 0) {
        return (
            <>
                <NavBar title={'Calendario'} handleCalendarViewMode={handleCalendarViewModeSelected}/>
                <LoadingWindow/>
            </>
        )
    }

    return (
        <div>
            <NavBar title={'Calendario'} handleCalendarViewMode={handleCalendarViewModeSelected}/>
            <div className={'general-calendar-container'}>
                <Calendar
                    weekStart={1}
                    language={'es'}
                    dataSource={calendarData}
                    style={'borders'}
                    displayWeekNumber={true}
                    onDayClick={handleShow}
                    // disabledWeekDays={[6, 0]}
                    displayDisabledDataSource={true}
                />
            </div>
            <PopUp show={Show}
                   handleClose={handleClose} handleShow={handleShow}
                   events={eventsSelected}
                   eventTypes={Object.keys(createEventTypesColors)}
                   handleSave={handleSave}
                   handleDelete={handleDelete}
                   key={calendarData.length}
            />
        </div>
    )
}

export default CalendarWindow

// formato de ejemplo para las fechas
// const dataSource = [
//     {
//         id:0,
//         name: 'JD',
//         startDate: new Date(currentYear, 0, 10),
//         endDate: new Date(currentYear, 0, 11),
//         color: '#c7c7c7'
//     }
// ]