import "./DailyCalendarWindow.css"
import {Table} from "react-bootstrap";
import {useEffect, useState} from "react";
import flaskAddress from "../Constants";
import LoadingWindow from "../LoadingWindow";
import PopUp from "./PopUp";
import NavBar from "../NavBar";
import createEventTypesColors, {eventTypesColors} from "./EventTypeColors";
import DropdownMultiselect from "react-multiselect-dropdown-bootstrap";
import {BsFillSquareFill} from "react-icons/bs";

const monthDictionary = {
    0:'Enero',
    1:'Febrero',
    2:'Marzo',
    3:'Abril',
    4:'Mayo',
    5:'Junio',
    6:'Julio',
    7:'Agosto',
    8:'Septiembre',
    9:'Octubre',
    10:'Noviembre',
    11:'Diciembre'
}

const DailyCalendarWindow = (props) => {
    const [calendar, setcalendar] = useState([])
    const [calendarData, setcalendarData] = useState([])
    const [cellsCalendarData, setcellsCalendarData] = useState([])
    const [cellsList, setcellsList] = useState([])
    const [teamsList, setteamsList] = useState([])
    const [show, setshow] = useState(false)
    const [eventsSelected, seteventsSelected] = useState([])
    const [dateSelected, setdateSelected] = useState(null)
    const [cellSelected, setcellSelected] = useState(null)
    const [cellsFilter, setcellsFilter] = useState([])
    const [teamFilter, setTeamsFilter] = useState(["TRATAMIENTOS TERMICOS"])
    // const [departmentFilter, setdepartmentFilter] = useState([])
    const [masterTable, setmasterTable] = useState([])

    // obtener lista de celulas
    const getCellsList = async () => {
        const msg = {
            method:"GET",
            headers: {
                "Content-Type":"application/json"
            }
        }
        fetch(`${flaskAddress}_get_cells_list`, msg)
            .then(response => response.json())
            .then(json => {
                // json = json.slice(0, 5)
                setcellsList(json.sort())
            })
    }

    // obtener tabla de celulas, equipos, etc
    const getmasterTable = async () => {
        const body = {
            method:"GET",
            headers: {
                "Content-Type":"application/json"
            }
        }
        fetch(`${flaskAddress}_get_master_table`, body)
            .then(response => response.json())
            .then(json => {
                setmasterTable(json)
                let teams = []
                for (let dict of json) {
                    if (teams.includes(dict["NombreEquipo"]) === false) {
                        teams.push(dict["NombreEquipo"])
                    }
                }
                setteamsList(teams)
            })
    }

    // Crear metodo para agregar dias, meses y años
    // eslint-disable-next-line no-extend-native
    Date.prototype.addDays = function(days) {
        let dat = new Date(this.valueOf())
        dat.setDate(dat.getDate() + days);
        return dat;
    }
    // eslint-disable-next-line no-extend-native
    Date.prototype.addMonth = function (months) {
        let dat = new Date(this.valueOf())
        dat.setMonth(dat.getMonth() + months);
        return dat;
    }
    // eslint-disable-next-line no-extend-native
    Date.prototype.addYear = function (years) {
        let dat = new Date(this.valueOf())
        dat.setFullYear(dat.getFullYear() + years);
        return dat;
    }

    // obtener array de fechas entre los limites y la lista de celulas
    useEffect(()=> {
        // fechas de inicio y final
        const today = new Date()
        const lastDate = today.addYear(1).addMonth(6)
        let dateArray = []
        let currentDate = new Date(today.getFullYear(), today.getMonth(), 1)
        let stopDate = new Date(lastDate.getFullYear(), lastDate.getMonth() +1, 0)
        while (currentDate <= stopDate) {
            let dateRow = {
                year: currentDate.getFullYear(),
                month: currentDate.getMonth(),
                day: currentDate.getDate(),
                dateObj: currentDate
            }
            dateArray.push(dateRow)
            // agregar 1 dia para la siguiente iteracion
            currentDate = currentDate.addDays(1);
        }
        setcalendar(dateArray)
        getCellsList().then(r => r)
    }, [])

    // obtener calendario general, de celulas y descargar tabla maestra al abrir la ventana
    useEffect(()=> {
        const cal = JSON.parse(localStorage.getItem('calendarData'))
        for (let dict of cal) {
            dict.startDate = new Date(dict.startDate)
            dict.endDate = new Date(dict.endDate)
        }
        setcalendarData(cal)
        const msg = {
            method:"GET",
            headers: {
                "Content-Type":"application/json"
            }
        }
        fetch(`${flaskAddress}_get_cells_calendar`, msg)
            .then(response => response.json())
            .then(json => {
                let cellCal = json
                for (let dict of cellCal) {
                    dict.startDate = new Date(dict.startDate)
                    dict.endDate = new Date(dict.endDate)
                    dict.color = eventTypesColors[dict.name]
                }
                setcellsCalendarData(cellCal)
            })
        getmasterTable().then(r => r)
    }, [])

    // header de años
    const yearsHeader = () => {
        const years = [...new Set(calendar.map(x=>x.year))]
        return (
            years.map((year, index)=>{
                let currentYearCal = calendar.filter(dict=> dict.year === year)
                return (
                    <th key={index} colSpan={currentYearCal.length}>{year}</th>
                )
            })
        )
    }

    // header de meses
    const monthsHeader = () => {
        const years = [...new Set(calendar.map(x=>x.year))]
        return (
            years.map(year=>{
                let currentYearCal = calendar.filter(dict=> dict.year === year)
                let months = [...new Set(currentYearCal.map(x=>x.month))]
                return (
                    months.map((month, index)=>{
                        let currentMonthCal = currentYearCal.filter(dict=>dict.month === month)
                        return (
                            <th key={index} colSpan={currentMonthCal.length}>{monthDictionary[month]}</th>
                        )
                    })
                )
            })
        )
    }

    // header de dias
    const daysHeader = () => {
        const years = [...new Set(calendar.map(x=>x.year))]
        return (
            years.map(year=>{
                let currentYearCal = calendar.filter(dict=> dict.year === year)
                let months = [...new Set(currentYearCal.map(x=>x.month))]
                return (
                    months.map(month=>{
                        let currentMonthCal = currentYearCal.filter(dict=>dict.month === month)
                        return (
                            currentMonthCal.map(((dict, index)=>{
                                return (
                                    <th key={index}>
                                        <text className={'daily-table-days-header'}>{dict.day}</text>
                                    </th>
                                )
                            }))
                        )
                    })
                )
            })
        )
    }

    // funcion para obtener evento general del dia que se esta mostrando
    const getEvent = (year, month, day, cell) => {
        let data = []
        for (let i = 0; i < calendarData.length; i++) {
            let dict = calendarData[i]
            if (dict.startDate.getFullYear() === year && dict.startDate.getMonth() === month && dict.startDate.getDate() === day) {
                data.push(dict)
            }
        }
        if (cell !== null) {
            for (let i = 0; i < cellsCalendarData.length; i++) {
                let dict = cellsCalendarData[i]
                dict.startDate = new Date(dict.startDate)
                if (dict.startDate.getFullYear() === year && dict.startDate.getMonth() === month && dict.startDate.getDate() === day && dict.celula.toString() === cell) {
                    data.push(dict)
                }
            }
        }

        return data
    }

    // aplicar filtros de celulas, equipos y departamentos seleccionados
    const applyFilters = (cell) => {
        if (cellsFilter.includes(cell) === false && cellsFilter.length > 0) return false
        let equipo = masterTable.filter(dict=>dict.Celula === cell)[0]["NombreEquipo"]
        if (teamFilter.includes(equipo) === false && teamFilter.length >0) return false

        return true
    }

    // cerrar el popup
    const handleClose = () => setshow(false)

    // hacer que aparezca el popup
    const handleShow = (event) => {
        let data = event.target.dataset.value
        data = JSON.parse(data)
        setdateSelected(data.date)
        setcellSelected(data.cell)
        if (data.event !== undefined) {
            setshow(true)
            seteventsSelected(data.event)
        }
        else {
            setshow(true)
            seteventsSelected([])
        }
    }

    // guardar los eventos nuevos
    const handleSave = (eventType, description, finalDate) => (event) => {
        let cal = [...cellsCalendarData]
        let data = {}
        if (eventType === "Parada Programada") {
            data = {
                name: eventType,
                startDate: dateSelected,
                endDate: finalDate,
                color: eventTypesColors[eventType],
                celula: String(cellSelected),
                allowDelete: true,
                description: description
            }
        }
        else {
             data = {
                name: eventType,
                startDate: dateSelected,
                endDate: finalDate,
                color: eventTypesColors[eventType],
                celula: String(cellSelected),
                allowDelete: true,
                description: "-"
            }
        }

        cal.push(data)
        setcellsCalendarData(cal)
        handleClose()
        saveChanges(cal)
    }

    // eliminar el evento seleccionado
    const handleDelete = (event) => {
        const eventType = event.target.value
        let cal = [...cellsCalendarData]
        for (let i in cal) {
            const dict = cal[i]
            const name = dict.name
            const startDate = new Date(dict.startDate)
            const clickedDate = new Date(dateSelected)
            const cell = dict.celula
            if (eventType === name && clickedDate.getTime() === startDate.getTime() && cellSelected.toString() === cell.toString()) {
                cal.splice(i, 1)
                break
            }
        }
        setcellsCalendarData(cal)
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
        console.log(calendar)
        fetch(`${flaskAddress}_save_cells_calendar`, msg)
            .then(response => response)
    }

    if (calendarData.length === 0 || masterTable.length === 0) {
        return (
            <div>
                <NavBar title={'Calendario'} currentCalendar={'/daily_calendar'}/>
                <LoadingWindow/>
            </div>
        )
    }

    return (
        <div>
            <NavBar title={'Calendario'} currentCalendar={'/daily_calendar'}/>
            <div className={'daily-cal-filters-container cellList'}>
                <DropdownMultiselect
                    options={cellsList}
                    placeholder={"Selecciona una Célula"}
                    handleOnChange={(selected)=>setcellsFilter(selected)}
                    selected={cellsFilter}
                    placeholderMultipleChecked={'Varios seleccionados...'}
                />
                <DropdownMultiselect
                    options={teamsList}
                    placeholder={"Selecciona una Equipo"}
                    handleOnChange={(selected)=>setTeamsFilter(selected)}
                    selected={teamFilter}
                    placeholderMultipleChecked={'Varios seleccionados...'}
                />
                <div className={'daily-calendar-leyend-container'}>
                    {
                        Object.keys(eventTypesColors).map((eventType)=>{
                            if (eventType === 'Fin de Semana') return null
                            return (
                                <text key={eventType}>
                                    {eventType} <BsFillSquareFill style={{color:eventTypesColors[eventType]}}/>
                                </text>
                            )
                        })
                    }
                </div>
            </div>
            <div className={'daily-cal-container'}>
                <Table bordered hover size={"sm"} className={'daily-cal-head'}>
                    <thead>
                    <tr>
                        <th></th>
                        {yearsHeader()}
                    </tr>
                    <tr>
                        <th></th>
                        {monthsHeader()}
                    </tr>
                    <tr>
                        <th>
                            <text className={'cell-title-col'}>Celula</text>
                        </th>
                        {daysHeader()}
                    </tr>
                    <tr>
                        <th>
                            <text className={'cell-title-col'}>General</text>
                        </th>
                        {calendar.map(((dict, index)=>{
                            let allDayData = getEvent(dict.year, dict.month, dict.day, null)
                            for (let dict of allDayData) {dict.allowDelete = false}
                            let allDayDataNoWeekends = allDayData.filter(dict=> {
                                let dontShowEvents = ["Fin de Semana", "Fin mes fiscal"]
                                return dontShowEvents.includes(dict.name) === false
                            })
                            let dayData = allDayDataNoWeekends[0]
                            let bg_color = ''
                            if (allDayDataNoWeekends.length > 1) {
                                bg_color = 'linear-gradient(to bottom right' // EJ: let bg_color = 'linear-gradient(to left, red 60%, blue 0%)'
                                let percentage = ((1/allDayDataNoWeekends.length)*100).toFixed(0)
                                for (let dict of allDayDataNoWeekends) {
                                    let val = `, ${dict.color} ${percentage}%`
                                    bg_color = bg_color + val
                                }
                                bg_color = bg_color + ')'
                            }
                            if (allDayDataNoWeekends.length === 1) {bg_color = dayData.color}
                            return (
                                <th style={{background: bg_color}} key={index}></th>
                            )
                        }))}
                    </tr>
                    </thead>
                </Table>
                <Table bordered size={"sm"} className={'daily-cal-body'}>
                    <tbody>
                    {cellsList.map((cell, index)=>{
                        // eslint-disable-next-line array-callback-return
                        if (applyFilters(cell) === false) {return }
                        return (
                            <tr key={index}>
                                <td>
                                    <text className={'cell-title-col'}>{cell}</text>
                                </td>
                                {calendar.map(((dict, index)=>{
                                    // obtener eventos calendario general
                                    let allDayData = getEvent(dict.year, dict.month, dict.day, cell)
                                    for (let dict of allDayData) {
                                        if (dict.celula === undefined) {dict.allowDelete = false}
                                        else {dict.allowDelete = true}
                                    }
                                    let allDayDataNoWeekends = allDayData.filter(dict=> {
                                        let dontShowEvents = ["Fin de Semana", "Fin mes fiscal"]
                                        return dontShowEvents.includes(dict.name) === false
                                    })
                                    let dayData = allDayDataNoWeekends[0]
                                    // let bg_color = (dayData === undefined ? '' : dayData.color)

                                    let bg_color = ''
                                    if (allDayDataNoWeekends.length > 1) {
                                        bg_color = 'linear-gradient(to bottom right' // EJ: let bg_color = 'linear-gradient(to left, red 60%, blue 0%)'
                                        let percentage = ((1/allDayDataNoWeekends.length)*100).toFixed(0)
                                        for (let dict of allDayDataNoWeekends) {
                                            let val = `, ${dict.color} ${percentage}%`
                                            bg_color = bg_color + val
                                        }
                                        bg_color = bg_color + ')'
                                    }
                                    if (allDayDataNoWeekends.length === 1) {bg_color = dayData.color}
                                    let data = {date: new Date(dict.year, dict.month, dict.day), cell: cell, event: allDayData}
                                    return (
                                        <td style={{background: bg_color}} key={index} onClick={handleShow} data-value={JSON.stringify(data)}>
                                            <text className={'daily-table-days-header'}></text>
                                        </td>
                                    )
                                }))}
                            </tr>
                        )
                    })}
                    </tbody>
                </Table>
                <PopUp show={show}
                       handleClose={handleClose} handleShow={handleShow}
                       events={eventsSelected}
                       eventTypes={Object.keys(createEventTypesColors)}
                       handleSave={handleSave}
                       handleDelete={handleDelete}
                       key={calendarData.length+cellsCalendarData.length}
                />
            </div>
        </div>
    )
}

export default DailyCalendarWindow