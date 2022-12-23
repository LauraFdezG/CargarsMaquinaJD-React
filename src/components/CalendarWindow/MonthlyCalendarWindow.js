import NavBar from "../NavBar";
import flaskAddress from "../Constants";
import {useEffect, useState} from "react";
import {eventTypesColors} from "./EventTypeColors";
import LoadingWindow from "../LoadingWindow";
import DropdownMultiselect from "react-multiselect-dropdown-bootstrap";
import {Table} from "react-bootstrap";
import "./DailyCalendarWindow.css"

const monthDictionary = {
    0:'Ene',
    1:'Feb',
    2:'Mar',
    3:'Abr',
    4:'May',
    5:'Jun',
    6:'Jul',
    7:'Ago',
    8:'Sep',
    9:'Oct',
    10:'Nov',
    11:'Dic'
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

const MonthlyCalendarWindow = () => {
    const [cellsList, setcellsList] = useState([])
    const [masterTable, setmasterTable] = useState([])
    const [teamsList, setteamsList] = useState([])
    const [calendar, setcalendar] = useState([])
    const [calendarData, setcalendarData] = useState([])
    const [cellsCalendarData, setcellsCalendarData] = useState([])
    const [cellsFilter, setcellsFilter] = useState([])
    const [teamFilter, setTeamsFilter] = useState([])
    const [fiscalCal, setfiscalCal] = useState([])

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

    // obtener calendario de mes fiscal al calendario general
    useEffect(()=>{
        const msg = {
            method:"GET",
            headers: {
                "Content-Type":"application/json"
            }
        }
        fetch(`${flaskAddress}_get_fiscal_calendar`, msg)
            .then(response => response.json())
            .then(json => {
                let cal = json
                for (let dict of cal) {
                    dict.Date = new Date(dict.Date)
                    dict["1st Day Of Fiscal Month"] = new Date(dict["1st Day Of Fiscal Month"])
                }
                setfiscalCal(cal)
            })
    }, [])

    // obtener array de fechas entre los limites y la lista de celulas
    useEffect(()=> {
        if (fiscalCal.length === 0) {return}
        // fechas de inicio y final
        const today = new Date().addDays(-1)
        const lastDate = today.addYear(1).addMonth(6)
        let dateArray = []
        let currentDate = new Date(today.getFullYear(), today.getMonth(), 1)
        currentDate = fiscalCal.filter(dict=>dict.Date.getDate() === today.getDate() && dict.Date.getMonth() === today.getMonth() && dict.Date.getFullYear() === today.getFullYear())[0]
        currentDate = currentDate["1st Day Of Fiscal Month"]
        let stopDate = new Date(lastDate.getFullYear(), lastDate.getMonth() +1 , 0) // incluye el ultimo dia del mes
        stopDate = fiscalCal.filter(dict=> dict.Date.getDate() === stopDate.getDate() && dict.Date.getMonth() === stopDate.getMonth() && dict.Date.getFullYear() === stopDate.getFullYear())[0]
        stopDate = stopDate["1st Day Of Fiscal Month"].addDays(-1)
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
        for (let dict of dateArray) {
            let fiscalMonth = fiscalCal.filter(value=>value.Date.getDate() === dict.day && value.Date.getMonth() === dict.month && value.Date.getFullYear() === dict.year)[0]
            dict.FiscalMonth = new Date(fiscalMonth.FiscalMonth).getMonth()
            dict.FiscalYear = new Date(fiscalMonth["Fiscal Year"]).getFullYear()
        }
        setcalendar(dateArray)
        // console.log(dateArray)
        // setcalendar(dateArray)
        getCellsList().then(r => r)
    }, [fiscalCal])

    // funcion para comprobar si la fecha dada pertenece al mes fiscal. Los meses van de 0-11
    const isInFiscalMonth = (date: Date, month: number, year: number) => {
        let calendarDate = calendar.filter(dict=>dict.year === date.getFullYear() && dict.month === date.getMonth() && dict.day === date.getDate())
        if (calendarDate.length === 0) {
            return false
        }
        else calendarDate = calendarDate[0]
        return calendarDate.FiscalMonth === month && calendarDate.FiscalYear === year;
    }

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
                console.log(cellCal)
                setcellsCalendarData(cellCal)
            })
        getmasterTable().then(r => r)
    }, [])

    // header de años
    const yearsHeader = () => {
        const years = [...new Set(calendar.map(x=>x.FiscalYear))]
        return (
            years.map((year, index)=>{
                let currentYearCal = calendar.filter(dict=> dict.FiscalYear === year)
                let monthsInYear = [...new Set(currentYearCal.map(x=>x.FiscalMonth))]
                return (
                    <th key={index} colSpan={monthsInYear.length}>{year}</th>
                )
            })
        )
    }

    // header de meses
    const monthsHeader = () => {
        const years = [...new Set(calendar.map(x=>x.FiscalYear))]
        return (
            years.map(year=>{
                let currentYearCal = calendar.filter(dict=> dict.FiscalYear === year)
                let months = [...new Set(currentYearCal.map(x=>x.FiscalMonth))]
                return (
                    months.map((month, index)=>{
                        return (
                            <th key={index}>
                                <text className={"cell-title-col"} style={{justifyContent: "flex-start"}}>
                                    {monthDictionary[month]}
                                </text>
                            </th>
                        )
                    })
                )
            })
        )
    }

    // obetener dias laborales por cada mes del año
    const getLaborDaysPerMonth = (cell) => {
        const years = [...new Set(calendar.map(x=>x.FiscalYear))]
        return (
            years.map(year=>{
                let currentYearCal = calendar.filter(dict=> dict.FiscalYear === year)
                let months = [...new Set(currentYearCal.map(x=>x.FiscalMonth))]
                return (
                    months.map((month, index)=>{
                        let currentMonthCal = currentYearCal.filter(dict=>dict.FiscalMonth === month)
                        let monthData = calendarData.filter(dict => isInFiscalMonth(dict.startDate, month, year) && dict.name !== "Fin mes fiscal")
                        // filtrar fechas duplicadas
                        let addedDates = []
                        let filteredMonthData = []
                        for (let dict of monthData) {
                            let date = `${dict.startDate.getDate()}-${dict.startDate.getMonth()}-${dict.startDate.getFullYear()}`
                            if (addedDates.includes(date) === false) {
                                filteredMonthData.push(dict)
                                addedDates.push(date)
                            }
                        }
                        let cellMonthData = []
                        let bg_color = "white"
                        if (cell !== null) {
                            cellMonthData = cellsCalendarData.filter(dict => isInFiscalMonth(dict.startDate, month, year) && dict.celula.toString() === cell.toString() && dict.name !== "Fin mes fiscal")
                            for (let dict of cellMonthData) {
                                let date = `${dict.startDate.getDate()}-${dict.startDate.getMonth()}-${dict.startDate.getFullYear()}`
                                if (addedDates.includes(date) === false) {
                                    filteredMonthData.push(dict)
                                    addedDates.push(date)
                                }
                            }
                            if (cellMonthData.length > 0) {
                                bg_color = "red"
                            }
                            return (
                                <td key={index} style={{background:bg_color}} data-value={JSON.stringify(cellMonthData)} onClick={handleMonthClicked}>
                                    <div className={'cell-title-col'} style={{justifyContent: "flex-start"}} onClick={handleMonthClicked} id={JSON.stringify(cellMonthData)}>
                                        {currentMonthCal.length -filteredMonthData.length}
                                    </div>
                                </td>
                            )
                        }
                        return (
                            <th key={index}>
                                <text className={'cell-title-col'} style={{justifyContent: "flex-start"}}>
                                    {currentMonthCal.length - filteredMonthData.length}
                                </text>
                            </th>
                        )
                    })
                )
            })
        )
    }

    // mostrar los eventos especificos al hacer click en un mes de una celula
    const handleMonthClicked = (event) => {
        let data = event.target.dataset.value
        if (data === undefined) {
            data = event.target.id
        }
        data = JSON.parse(data)
        let message = ""
        for (let dict of data) {
            let date = new Date(dict.startDate)
            let month = date.getMonth()+1
            if (month < 10) {month = `0${month}`}
            message = message + `Fecha: ${date.getDate()}-${month}-${date.getFullYear()}    Tipo de Evento: ${dict.name}\n`
        }
        if (data.length === 0) {return}
        alert(message)
        event.stopPropagation()
    }

    // aplicar filtros de celulas, equipos y departamentos seleccionados
    const applyFilters = (cell) => {
        if (cellsFilter.includes(cell) === false && cellsFilter.length > 0) return false
        let equipo = masterTable.filter(dict=>dict.Celula === cell)[0]["NombreEquipo"]
        if (teamFilter.includes(equipo) === false && teamFilter.length >0) return false

        return true
    }

    // pantalla de carga mientras se obtienen los datos
    if (calendarData.length === 0 || masterTable.length === 0 ||cellsList.length === 0 || fiscalCal.length === 0) {
        return (
            <div>
                <NavBar title={'Calendario'} currentCalendar={'/monthly_calendar'}/>
                <LoadingWindow/>
            </div>
        )
    }

    return (
        <div>
            <NavBar title={'Calendario'} currentCalendar={'/monthly_calendar'}/>
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
            </div>
            <div className={'daily-cal-container'}>
                <Table bordered size={"sm"} className={'daily-cal-head'}>
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
                            <text className={'cell-title-col'} style={{justifyContent: "flex-start"}}>General</text>
                        </th>
                        {getLaborDaysPerMonth(null)}
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
                                <th>
                                    <text className={'cell-title-col'} style={{justifyContent: "flex-start"}}>{cell}</text>
                                </th>
                                {getLaborDaysPerMonth(cell)}
                            </tr>
                        )
                    })}
                    </tbody>
                </Table>
            </div>
        </div>
    )
}

export default MonthlyCalendarWindow