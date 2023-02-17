import LoadingWindow from "../LoadingWindow";
import NavBar from "../NavBar";
import flaskAddress from "../Constants";
import {useEffect, useState} from "react";
import {eventTypesColors} from "../CalendarWindow/EventTypeColors";
import {Table} from "react-bootstrap";
import "./ResumenCargaWindow.css"
import AddCellPopUp from "./AddCellPopUp";
import {useTime} from "framer-motion";
import AddFilterPopUp from "./AddFilterPopUp";
import DateFilter from "../CargasMaquinaWindow/DateFilter";



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

const monthDiff = (dateTo, dateFrom) => {
    return dateTo.getMonth() - dateFrom.getMonth() +
        (12 * (dateTo.getFullYear() - dateFrom.getFullYear()))
}

const ResumenCargaWindow = () => {
    const [calendar, setcalendar] = useState([])
    const [calendarData, setcalendarData] = useState([])
    const [cellsCalendarData, setcellsCalendarData] = useState([])
    const [cellLaborDays, setcellLaborDays] = useState({})
    const [cellsList, setcellsList] = useState([])
    const [cellMasterTable, setcellMasterTable] = useState([])
    const [currentCell, setcurrentCell] = useState()
    const [filterList, setfilterList] = useState(['HRS STD', 'HRS NEC PEDIDOS', 'HRS DISPONIBLES', 'Nº OP ACTUALES', 'Nº OP NECESARIOS', 'TOTAL PIEZAS'])
    const [firstCalendarDate, setfirstCalendarDate] = useState(new Date().addDays(-1).addMonth(1))
    const [fiscalCal, setfiscalCal] = useState([])
    const [lastCalendarDate, setlastCalendarDate] = useState(new Date().addDays(-1).addMonth(1).addYear(1).addMonth(0))
    const [masterTable, setmasterTable] = useState([])
    const [maxCalendarDate, setmaxCalendarDate] = useState(new Date().addDays(-1).addMonth(1).addYear(1).addMonth(6))
    const [minCalendarDate, setminCalendarDate] = useState(firstCalendarDate)
    const [nOperarios, setnOperarios] = useState(4.2)
    const [ordersTable, setordersTable] = useState([])
    const [originalMasterTable, setoriginalMasterTable] = useState([])
    const [selectedCells, setselectedCells] = useState(["147", "282"])
    const [selectedFilters, setselectedFilters] = useState([])
    const [showAddCellPopUp, setshowAddCellPopUp] = useState(false)
    const [showAddFilterPopUp, setshowAddFilterPopUp] = useState(false)

    // obtener array de fechas entre los limites y la lista de celulas
    const getCalendar = async () => {
        if (fiscalCal.length === 0) {return}
        // fechas de inicio y final
        const today = firstCalendarDate
        const lastDate = lastCalendarDate
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
    }

    // obetener eventos del calendario general y el de la celulas
    const getCalendarData = async () => {
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
    }

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

    // obtener calendario de mes fiscal al calendario general
    const getFiscalCal = async () => {
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
    }


    // descargar tabla de configuraciones
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
                console.log(json[0])
                for (let dict of json) {
                    dict.editedCell = false
                    dict.originalHrsSTD = dict.HorasSTD
                }
                json = json.filter(dict => dict["Porcentaje de Pedidos"] !== 0) // no mostrar si el porc pedidos = 0
                setmasterTable(json)
                setoriginalMasterTable(json)
            })
    }

    // // obetener nro operarios mensuales distintos al default
    // const getMonthlyNOps = async () => {
    //     const msg = {
    //         method:"GET",
    //         headers: {
    //             "Content-Type":"application/json"
    //         }
    //     }
    //     fetch(`${flaskAddress}_get_monthly_nops`, msg)
    //         .then(response => response.json())
    //         .then(json => {
    //             setmonthlyNOps(json)
    //         })
    // }

    // descargar configuraciones, celulas, tabla maestra, tabla de ordenes
    useEffect(()=> {
        getmasterTable().then(r => r)
        getCellsList().then(r => r)
        getFiscalCal().then(r => r)
    },[])

    // crear calendario para el rango de fechas despues de descargar el fiscal
    useEffect(()=> {
        getCalendar().then(r => r)
    }, [fiscalCal])

    // cambiar filtro de ultima fecha del calendario
    const handleLastDayChanged = (date) => {
        setlastCalendarDate(date)
        getFiscalCal().then(r => r)
        getCalendarData().then(r => r)
        // getMonthlyNOps().then(r => r)
    }

    // cambiar filtro de primera fecha del calendario
    const handleFirstDayChanged = (date) => {
        setfirstCalendarDate(date)
        getFiscalCal().then(r => r)
        getCalendarData().then(r => r)
        // getMonthlyNOps().then(r => r)
    }

    // helps the modal of addcells to open and close
    const handleAddCell = () => {
        setshowAddCellPopUp(!showAddCellPopUp)
    }

    // helps the modal of addfilter to open and close
    const handleAddFilter = () => {
        setshowAddFilterPopUp(!showAddFilterPopUp)
    }

    // brings the changes for the selected cells from the popup
    const addCells = (selCells) => {
        setselectedCells(selCells)
    }

    // brings the changes for the selected filters from the popup
    const addFilters = (selFilters) => {
        setselectedFilters(selFilters)
    }

    // headers de la tabla para los meses
    const productionMonthHeaders = () => {
        const monthsList = [...new Set(calendar.map(dict=>`${monthDictionary[dict.FiscalMonth]}-${dict.FiscalYear-2000}`))]
        return (
            monthsList.map((value, index) => {
                let settings = {
                    background:"rgb(169,169,169)",
                    color: "black",
                }
                return (
                    <th key={index} style={settings}>{value}</th>
                )
            })
        )
    }

    // funcion para comprobar si la fecha dada pertenece al mes fiscal. Los meses van de 0-11
    const isInFiscalMonth = (date: Date, month: number, year: number) => {
        let calendarDate = calendar.filter(dict=>dict.year === date.getFullYear() && dict.month === date.getMonth() && dict.day === date.getDate())
        if (calendarDate.length === 0) {
            return false
        }
        else calendarDate = calendarDate[0]
        return calendarDate.FiscalMonth === month && calendarDate.FiscalYear === year;
    }

    // fill the table
    const addRowFilters = (cell) => {
        return (
            selectedFilters.map((filter) => {
                if (filter === "HRS STD") {
                    return (
                        <tr>
                            <td>{filter}</td>
                        </tr>
                    )
                }
                if (filter === "HRS NEC PEDIDOS") {
                    return (
                        <tr>
                            <td>{filter}</td>
                        </tr>
                    )
                }
                if (filter === "HRS DISPONIBLES") {
                    return (
                        <tr>
                            <td>{filter}</td>
                        </tr>
                    )
                }
                if (filter === "Nº OP ACTUALES") {
                    return (
                        <tr>
                            <td>{filter}</td>
                        </tr>
                    )
                }
                if (filter === "Nº OP NECESARIOS") {
                    return (
                        <tr>
                            <td>{filter}</td>
                        </tr>
                    )
                }
                if (filter === "TOTAL PIEZAS") {
                    return (
                        <tr>
                            <td>{filter}</td>
                        </tr>
                    )
                }
            })
        )
    }



    if (masterTable.length * cellsList.length === 0) {
        return (
            <div>
                <NavBar title={"Resumen de Cargas"}/>
                <LoadingWindow/>
            </div>
        )
    }

    return(
        <div>
            <NavBar title={"Resumen de Cargas"}
            />
            <div className={"resumen-tabla-container"}>
                <div className={"resumen-settings-container"}>
                    <AddCellPopUp
                        show={showAddCellPopUp}
                        close={handleAddCell}
                        cellsList={cellsList}
                        selectedCells={selectedCells}
                        addCells={addCells}
                    />
                    <button className={'resumen-settings-button'} onClick={handleAddCell}>Agregar Célula(s)</button>
                    <AddFilterPopUp
                        show={showAddFilterPopUp}
                        close={handleAddFilter}
                        filterList={filterList}
                        selectedFilters={selectedFilters}
                        addFilters={addFilters}
                    />
                    <button className={'resumen-settings-button'} onClick={handleAddFilter}>Agregar Filtro(s)</button>
                    <DateFilter initDate={minCalendarDate} lastDate={lastCalendarDate} setLastDate={handleLastDayChanged} setFirstDate={handleFirstDayChanged} maxDate={maxCalendarDate}/>
                </div>
                <Table striped bordered hover className={"resumen-tabla"} size={"sm"}>
                    <thead>
                        <tr>
                            <th>Filtros</th>
                            {productionMonthHeaders()}
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedCells.sort().map((cell, key)=>{
                            return (
                                <>
                                    <tr key={key}>
                                        <td style={{textAlign: "center"}} colSpan={monthDiff(lastCalendarDate, firstCalendarDate)+2}>
                                            {cell}
                                        </td>
                                        <td>TOTAL</td>
                                    </tr>
                                    {addRowFilters(cell)}
                                </>
                            )
                        })}
                    <tr>
                        <td>TOTAL</td>
                    </tr>
                    </tbody>
                </Table>
            </div>
        </div>
    )
}


export default ResumenCargaWindow