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
import {BsArrowCounterclockwise} from "react-icons/bs";



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
    const [cellLaborDaysOriginal, setCellLaborDaysOriginal] = useState({})
    const [cellsList, setcellsList] = useState([])
    const [cellSettings, setcellSettings] = useState([])
    const [importedCellLaborDays, setImportedCellLaborDays] = useState([])
    const [filterList, setfilterList] = useState(['HRS STD', 'HRS NEC PEDIDOS', 'HRS DISPONIBLES', 'Nº OP ACTUALES', 'Nº OP NECESARIOS', 'TOTAL PIEZAS'])
    const [firstCalendarDate, setfirstCalendarDate] = useState(new Date().addDays(-1).addMonth(1))
    const [fiscalCal, setfiscalCal] = useState([])
    const [lastCalendarDate, setlastCalendarDate] = useState(new Date().addDays(-1).addMonth(1).addYear(1).addMonth(0))
    const [masterTable, setmasterTable] = useState([])
    const [maxCalendarDate, setmaxCalendarDate] = useState(new Date().addDays(-1).addMonth(1).addYear(1).addMonth(6))
    const [minCalendarDate, setminCalendarDate] = useState(firstCalendarDate)
    const [montlyNOps, setmonthlyNOps] = useState({})
    const [nOperarios, setnOperarios] = useState(4.2)
    const [ordersTable, setordersTable] = useState([])
    const [originalMasterTable, setoriginalMasterTable] = useState([])
    const [selectedCells, setselectedCells] = useState(["147"])
    const [selectedFilters, setselectedFilters] = useState(['TOTAL PIEZAS'])
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

    // obtener tabla con ajustes de la celulas: productividad, absentismo, nro turnos etc
    const getCellSettings = async () => {
        const msg = {
            method:"GET",
            headers: {
                "Content-Type":"application/json"
            }
        }
        fetch(`${flaskAddress}_get_cell_settings`, msg)
            .then(response => response.json())
            .then(json => {
                for (let dict of json) {
                    dict.OriginalPRODUCTIVIDAD = dict.PRODUCTIVIDAD
                    dict.OriginalABSENTISMO = dict.ABSENTISMO
                }
                setcellSettings(json)
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

    // funcion para comprobar si la fecha dada pertenece al mes fiscal. Los meses van de 0-11
    const isInFiscalMonth = (date: Date, month: number, year: number) => {
        let calendarDate = calendar.filter(dict=>dict.year === date.getFullYear() && dict.month === date.getMonth() && dict.day === date.getDate())
        if (calendarDate.length === 0) {
            return false
        }
        else calendarDate = calendarDate[0]
        return calendarDate.FiscalMonth === month && calendarDate.FiscalYear === year;
    }

    // descargar tabla con todas las ordenes
    const getOrdersTable = async () => {
        const msg = {
            method:"GET",
            headers: {
                "Content-Type":"application/json"
            }
        }
        fetch(`${flaskAddress}_get_orders_table`, msg)
            .then(response => response.json())
            .then(json => {
                let orders = json.ordersTable
                let time = json.createdTime
                for (let dict of orders) {
                    let date = new Date(dict["Fiscal Month"])
                    dict.FiscalMonth = `${monthDictionary[date.getMonth()]}-${date.getFullYear()-2000}`
                    dict.editedCell = false
                    dict.originalQty = dict.Qty
                }
                setordersTable(orders)
                //setlastUpdatedTime(time)
            })
    }

    // obtener dias laborales de la celula por cada mes del año
    const getCellLaborDaysPerMonth = (cell) => {
        const years = [...new Set(calendar.map(x=>x.FiscalYear))]
        let laborDays = {}
        let originalLaborDays = {}
        // eslint-disable-next-line array-callback-return
        years.map(year=>{
            let currentYearCal = calendar.filter(dict=> dict.FiscalYear === year)
            let months = [...new Set(currentYearCal.map(x=>x.FiscalMonth))]
            // eslint-disable-next-line array-callback-return
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
                if (cell !== null) {
                    cellMonthData = cellsCalendarData.filter(dict => isInFiscalMonth(dict.startDate, month, year) && dict.celula.toString() === cell.toString() && dict.name !== "Fin mes fiscal")
                    for (let dict of cellMonthData) {
                        let date = `${dict.startDate.getDate()}-${dict.startDate.getMonth()}-${dict.startDate.getFullYear()}`
                        if (addedDates.includes(date) === false) {
                            filteredMonthData.push(dict)
                            addedDates.push(date)
                        }
                    }
                }
                let fMonth = `${monthDictionary[month]}-${year-2000}`
                if (cellLaborDays[fMonth] === undefined) {
                    laborDays[fMonth] = currentMonthCal.length - filteredMonthData.length
                }
                else {
                    laborDays[fMonth] = cellLaborDays[fMonth]
                }
                originalLaborDays[fMonth] = currentMonthCal.length - filteredMonthData.length
            })
        })
        return laborDays
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

    // obetener nro operarios mensuales distintos al default
    const getMonthlyNOps = async () => {
        const msg = {
            method:"GET",
            headers: {
                "Content-Type":"application/json"
            }
        }
        fetch(`${flaskAddress}_get_monthly_nops`, msg)
            .then(response => response.json())
            .then(json => {
                setmonthlyNOps(json)
            })
    }

    // crear diccionario de Nro de Operarios por mes
    const setNOpDict = (laborDays) => {
        let montlynops = {...montlyNOps}
        let nOps = {}
        for (let dict of cellSettings) {
            let cell = {}
            for (let month in laborDays) {
                let customNOp = undefined
                try {customNOp = montlynops[dict.CELULA][month]}
                catch (error) {}
                cell[month] = customNOp === undefined ? dict.N_OPERARIOS : customNOp
                cell["originalValue"] = customNOp === undefined ? dict.N_OPERARIOS : customNOp
            }
            nOps[dict.CELULA] = cell
        }
        return nOps
    }

    // descargar configuraciones, celulas, tabla maestra, tabla de ordenes
    useEffect(()=> {
        getmasterTable().then(r => r)
        getCellsList().then(r => r)
        getOrdersTable().then(r => r)
        getMonthlyNOps().then(r => r)
        getFiscalCal().then(r => r)
        getCellSettings().then(r => r)
        getCalendarData().then(r => r)
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
        getMonthlyNOps().then(r => r)
    }

    // cambiar filtro de primera fecha del calendario
    const handleFirstDayChanged = (date) => {
        setfirstCalendarDate(date)
        getFiscalCal().then(r => r)
        getCalendarData().then(r => r)
        getMonthlyNOps().then(r => r)
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

    // fill the table
    const fillRowTable = (filter, cell, cellTable,settings, cellLaborDays, nOps) => {
        const monthsList = [...new Set(calendar.map(dict=>`${monthDictionary[dict.FiscalMonth]}-${dict.FiscalYear-2000}`))]
        return (
            monthsList.map((month, index) => {
                if (filter === "HRS STD") {
                    let references = cellTable.map(dict => dict.ReferenciaSAP)
                    let totalHrsSTD = 0
                    for (let dict of ordersTable){
                        if (dict.FiscalMonth === month && references.includes(dict["Reference"])) {
                            let hrsSTD = cellTable.filter(dict2 => dict2.ReferenciaSAP === dict["Reference"])[0]["HorasSTD"]
                            totalHrsSTD += dict.Qty * hrsSTD/100
                        }
                    }
                    return (
                        <td key={index}>{totalHrsSTD.toFixed(2)}</td>
                    )
                }
                if (filter === "HRS NEC PEDIDOS") {
                    // obtener piezas producidas en el mes
                    let references = cellTable.map(dict => dict.ReferenciaSAP)
                    let totalHrsSTDNec = 0
                    for (let dict of ordersTable) {
                        if (dict.FiscalMonth === month && references.includes(dict["Reference"])) {
                            let hrsSTD = cellTable.filter(dict2 => dict2.ReferenciaSAP === dict["Reference"])[0]["HorasSTD"]
                            totalHrsSTDNec += dict.Qty * hrsSTD/100
                        }
                    }
                    totalHrsSTDNec = totalHrsSTDNec/settings.PRODUCTIVIDAD
                    return (
                        <td key={index}>{totalHrsSTDNec.toFixed(2)}</td>
                    )
                }
                if (filter === "HRS DISPONIBLES") {
                    // obtener horas disponibles al mes
                    let laborDays = cellLaborDays[month]

                    let hrsDisponibles = (nOps[cell][month]*laborDays*8)/(1+settings.ABSENTISMO)

                    return (
                        <td key={index}>{hrsDisponibles.toFixed(2)}</td>
                    )
                }
                if (filter === "Nº OP ACTUALES") {
                    return (
                        <td key={index}>
                            {nOps[cell][month]}
                        </td>
                    )
                }
                if (filter === "Nº OP NECESARIOS") {
                    // obtener numero operarios necesarios
                    let laborDays = cellLaborDays[month]
                    let references = cellTable.map(dict => dict.ReferenciaSAP)
                    let totalHrsSTD = 0
                    for (let dict of ordersTable) {
                        if (dict.FiscalMonth === month && references.includes(dict["Reference"])) {
                            let hrsSTD = cellTable.filter(dict2 => dict2.ReferenciaSAP === dict["Reference"])[0]["HorasSTD"]
                            totalHrsSTD += dict.Qty * hrsSTD/100
                        }
                    }
                    totalHrsSTD = totalHrsSTD/settings.PRODUCTIVIDAD
                    let nroOpNecesarios = (totalHrsSTD)/(8*laborDays*(1-settings.ABSENTISMO))
                    // let style = {background: nroOpNecesarios > nOperarios[cell][month] ? "rgba(255,0,0,0.67)" : "rgba(48,255,144,0.67)"}
                    return (
                        <td key={index}>{nroOpNecesarios.toFixed(2)}</td>
                    )
                }
                if (filter === "TOTAL PIEZAS") {
                    let totalMonthQty = 0
                    for (let dict of cellTable) {
                        let ref = dict.ReferenciaSAP
                        let productionPerc = masterTable.filter(dict=>dict.Celula.toString() === cell.toString() && dict.ReferenciaSAP === ref)[0]
                        if (productionPerc === undefined) {productionPerc = 0}
                        else {productionPerc = productionPerc["Porcentaje de Pedidos"]}
                        let monthQty = 0
                        let editedCell = false
                        for (let dict of ordersTable) {
                            if (dict.FiscalMonth === month && dict["Reference"] === ref) {
                                monthQty += dict.Qty
                                editedCell = dict.editedCell
                            }
                        }
                        if (editedCell) {productionPerc = 1}
                        totalMonthQty = totalMonthQty + monthQty*productionPerc
                    }
                    return (
                        <td key={index}>{totalMonthQty.toFixed(0)}</td>
                    )
                }
            })
        )

    }

    const totalColumns = (filter, cell, cellTable, settings, cellLaborDays, nOps) => {
        const monthsList = [...new Set(calendar.map(dict=>`${monthDictionary[dict.FiscalMonth]}-${dict.FiscalYear-2000}`))]
        if (filter === "HRS STD") {
            let totalHrsSTD = 0
            monthsList.map((month, index) => {
                let references = cellTable.map(dict => dict.ReferenciaSAP)
                for (let dict of ordersTable){
                    if (dict.FiscalMonth === month && references.includes(dict["Reference"])) {
                        let hrsSTD = cellTable.filter(dict2 => dict2.ReferenciaSAP === dict["Reference"])[0]["HorasSTD"]
                        totalHrsSTD += dict.Qty * hrsSTD/100
                    }
                }
            })
            return (
                <td key="totalhrsstd">{totalHrsSTD.toFixed(2)}</td>
            )
        }
        if (filter === "HRS NEC PEDIDOS") {
            let totalHrsSTDNecCol = 0
            monthsList.map((month, index) => {
                let references = cellTable.map(dict => dict.ReferenciaSAP)
                let totalHrsSTDNec = 0
                for (let dict of ordersTable) {
                    if (dict.FiscalMonth === month && references.includes(dict["Reference"])) {
                        let hrsSTD = cellTable.filter(dict2 => dict2.ReferenciaSAP === dict["Reference"])[0]["HorasSTD"]
                        totalHrsSTDNec += dict.Qty * hrsSTD/100
                    }
                }
                totalHrsSTDNec = totalHrsSTDNec/settings.PRODUCTIVIDAD
                totalHrsSTDNecCol += totalHrsSTDNec
            })
            return (
                <td key="totalhrsstdnec">{totalHrsSTDNecCol.toFixed(2)}</td>
            )
        }
        if (filter === "HRS DISPONIBLES") {
            let totalHrsDis = 0
            monthsList.map((month, index) => {
                let laborDays = cellLaborDays[month]

                let hrsDisponibles = (nOps[cell][month]*laborDays*8)/(1+settings.ABSENTISMO)
                totalHrsDis += hrsDisponibles
            })
            return (
                <td key="totalhrsdis">{totalHrsDis.toFixed(2)}</td>
            )
        }
        if (filter === "Nº OP ACTUALES") {
            let totalNOPAct= 0
            monthsList.map((month, index) => {
                totalNOPAct += nOps[cell][month]
            })
            return (
                <td key="totalNOPAct">{totalNOPAct.toFixed(2)}</td>
            )
        }
        if (filter === "Nº OP NECESARIOS") {
            let totalNOpNec = 0
            monthsList.map((month, index) => {
                let laborDays = cellLaborDays[month]
                let references = cellTable.map(dict => dict.ReferenciaSAP)
                let totalHrsSTD = 0
                for (let dict of ordersTable) {
                    if (dict.FiscalMonth === month && references.includes(dict["Reference"])) {
                        let hrsSTD = cellTable.filter(dict2 => dict2.ReferenciaSAP === dict["Reference"])[0]["HorasSTD"]
                        totalHrsSTD += dict.Qty * hrsSTD/100
                    }
                }
                totalHrsSTD = totalHrsSTD/settings.PRODUCTIVIDAD
                let nroOpNecesarios = (totalHrsSTD)/(8*laborDays*(1-settings.ABSENTISMO))
                totalNOpNec += (nroOpNecesarios > 1000000 || isNaN(nroOpNecesarios)) ? 0 : nroOpNecesarios
            })
            return (
                <td key="totalNOpNec">{totalNOpNec.toFixed(2)}</td>
            )
        }
        if (filter === "TOTAL PIEZAS") {
            const monthsList = [...new Set(calendar.map(dict=>`${monthDictionary[dict.FiscalMonth]}-${dict.FiscalYear-2000}`))]
            let totalMonthQty = 0
            monthsList.map((month, index) => {
                for (let dict of cellTable) {
                    let ref = dict.ReferenciaSAP
                    let productionPerc = masterTable.filter(dict=>dict.Celula.toString() === cell.toString() && dict.ReferenciaSAP === ref)[0]
                    if (productionPerc === undefined) {productionPerc = 0}
                    else {productionPerc = productionPerc["Porcentaje de Pedidos"]}
                    let monthQty = 0
                    let editedCell = false
                    for (let dict of ordersTable) {
                        if (dict.FiscalMonth === month && dict["Reference"] === ref) {
                            monthQty += dict.Qty
                            editedCell = dict.editedCell
                        }
                    }
                    if (editedCell) {productionPerc = 1}
                    totalMonthQty = totalMonthQty + monthQty*productionPerc
                }
            })
            return (
                <td key="totalpieces">{totalMonthQty.toFixed(0)}</td>
            )
        }
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
                <h5>Ajustes de tabla</h5>
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
                        <tr style={{textAlign: "center", borderColor: "white"}}>
                            <th></th>
                            <th colSpan={monthDiff(lastCalendarDate, firstCalendarDate)+1}>
                                <h2>RESUMEN DE CARGAS</h2>
                            </th>
                            <th></th>
                        </tr>
                        <tr>
                            <th>Filtros</th>
                            {productionMonthHeaders()}
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>

                        {selectedCells.sort().map((cell, key)=>{
                            let table = [...masterTable]
                            let filteredTable = table.filter(dict=>dict.Celula.toString() === cell.toString())
                            const cellMasterTable = [...filteredTable]
                            let settings = [...cellSettings]
                            settings = settings.filter(dict => dict.CELULA.toString() === cell.toString())[0]

                            let laborDays = getCellLaborDaysPerMonth(cell)
                            let nOps = setNOpDict(laborDays)

                            return (
                                <>
                                    <tr key={key}>
                                        <td style={{textAlign: "center", fontSize: "larger", background: "lightgray"}} colSpan={monthDiff(lastCalendarDate, firstCalendarDate)+2}>
                                            {cell}
                                        </td>
                                        <td style={{textAlign: "center", fontSize: "larger", background: "lightgray"}}>TOTAL</td>
                                    </tr>
                                    {selectedFilters.sort().map((filter) => {
                                        return(
                                            <tr>
                                                <td>{filter}</td>
                                                {fillRowTable(filter, cell, cellMasterTable, settings, laborDays, nOps)}
                                                {totalColumns(filter, cell, cellMasterTable, settings, laborDays, nOps)}
                                            </tr>
                                        )

                                    })}
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