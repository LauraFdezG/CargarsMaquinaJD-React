import NavBar from "../NavBar";
import "./CalendarWindow.css"
import {useEffect, useMemo, useState} from "react";
import Calendar from 'rc-year-calendar';
import 'rc-year-calendar/locales/rc-year-calendar.es';
import LoadingWindow from "../LoadingWindow";
import PopUp from "./PopUp";
import flaskAddress from "../Constants";
import createEventTypesColors, {eventTypesColors} from "./EventTypeColors";
import {Col, Container, Row} from "react-bootstrap";
import {BsFillSquareFill} from "react-icons/bs"
import ErrorWindow from "../ErrorWindow/ErrorWindow";
import React from 'react';

const CalendarWindow = () => {
    const [calendarViewMode, setcalendarViewMode] = useState('general')
    const [calendarData, setcalendarData] = useState([])
    const [Show, setShow] = useState(false)
    const [eventsSelected, seteventsSelected] = useState([])
    const [dateSelected, setdateSelected] = useState(null)

    // obtener calendario general al abrir la ventana
    useEffect(()=> {
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
                localStorage.setItem('calendarData', JSON.stringify(calendar))
            })
    }, [])

    // cerrar el popup
    const handleClose = () => setShow(false)

    // hacer que aparezca el popup
    const handleShow = (event) => {
        setdateSelected(event.date)
        console.log(calendarData)
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
    const handleSave = (eventType, description, finalDate) => (event) => {
        let cal = [...calendarData]



        let data = {}
        if (eventType === "Parada Programada") {
            data = {
                name: eventType,
                startDate: dateSelected,
                endDate: finalDate,
                color: eventTypesColors[eventType],
                description: description
            }
        }
        else {
            data = {
                name: eventType,
                startDate: dateSelected,
                endDate: finalDate,
                color: eventTypesColors[eventType],
                description: "-"
            }
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
        localStorage.setItem('calendarData', JSON.stringify(calendar))
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

    if (sessionStorage.getItem("user") === "Desautorizado") {
        return (
            <ErrorWindow/>
        )
    }

    // mostrar pantalla de carga mientras se carga el calendario
    if (calendarData.length === 0) {
        return (
            <>
                <NavBar title={'Calendario'} currentCalendar={'/calendar'}/>
                <LoadingWindow/>
            </>
        )
    }

    return (
        <div>
            <NavBar title={'Calendario'} currentCalendar={'General'}/>
            <div className={'general-calendar-container'}>
                <Calendar
                    weekStart={1}
                    language={'es'}
                    dataSource={calendarData}
                    Style={'borders'}
                    displayWeekNumber={true}
                    onDayClick={handleShow}
                    // disabledWeekDays={[6, 0]}
                    displayDisabledDataSource={true}
                />
            </div>
            <PopUp show={Show}
                   handleClose={handleClose}
                   handleShow={handleShow}
                   events={eventsSelected}
                   eventTypes={Object.keys(createEventTypesColors)}
                   handleSave={handleSave}
                   handleDelete={handleDelete}
                   key={calendarData.length}
            />
            <div className={'calendar-leyend-container'}>
                {
                    Object.keys(eventTypesColors).map((eventType)=>{
                        if (eventType === 'Fin de Semana') return null
                        return (
                            <text>{eventType} <BsFillSquareFill style={{color:eventTypesColors[eventType]}}/> </text>
                        )
                    })
                }
            </div>
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