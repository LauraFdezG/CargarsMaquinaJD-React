import "./CargasMaquinaWindow.css"
import NavBar from "../NavBar";
import {Table} from "react-bootstrap";
import {useEffect, useState} from "react";
import flaskAddress from "../Constants";
import LoadingWindow from "../LoadingWindow";
import {DropdownList} from "react-widgets/cjs";
import {eventTypesColors} from "../CalendarWindow/EventTypeColors";
import {BsArrowCounterclockwise} from "react-icons/bs"
import { saveAs } from 'file-saver';
import UploadFilePopUp from "./UploadFilePopUp";
import {json, useNavigate} from "react-router-dom";
import AddReferencePopUp from "./AddReferencePopUp";
import DateFilter from "./DateFilter";
import ErrorWindow from "../ErrorWindow/ErrorWindow"
import {m} from "framer-motion";
import React from 'react';

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


const CargasMaquinaWindow = () => {
    let navigate = useNavigate()
    const [calendar, setcalendar] = useState([])
    const [selectedCell, setselectedCell] = useState("147")
    const [cellsList, setcellsList] = useState([])
    const [masterTable, setmasterTable] = useState([])
    const [cellMasterTable, setcellMasterTable] = useState([])
    const [fiscalCal, setfiscalCal] = useState([])
    const [ordersTable, setordersTable] = useState([])
    const [calendarData, setcalendarData] = useState([])
    const [cellsCalendarData, setcellsCalendarData] = useState([])
    const [cellLaborDays, setcellLaborDays] = useState({})
    const [cellLaborDaysChanged, setcellLaborDaysChanged] = useState({})
    const [cellLaborDaysOriginal, setCellLaborDaysOriginal] = useState({})
    const [productividadCell, setproductividadCell] = useState(1.05)
    const [absentismoCell, setabsentismoCell] = useState(0.08)
    const [nOperarios, setnOperarios] = useState(4.2)
    const [nOperariosTit, setnOperariosTit] = useState(4.2)
    const [cellSettings, setcellSettings] = useState([])
    const [isButtonLoading, setisButtonLoading] = useState(false)
    const [showPopUp, setshowPopUp] = useState(false)
    const [montlyNOps, setmonthlyNOps] = useState({})
    const [showAddRefPopUp, setshowAddRefPopUp] = useState(false)
    const [originalMasterTable, setoriginalMasterTable] = useState([])
    const [lastCalendarDate, setlastCalendarDate] = useState(new Date().addDays(-1).addMonth(1).addYear(1).addMonth(0))
    const [maxCalendarDate, setmaxCalendarDate] = useState(new Date().addDays(-1).addMonth(1).addYear(1).addMonth(6))
    const [firstCalendarDate, setfirstCalendarDate] = useState(new Date().addDays(-1).addMonth(1))
    const [minCalendarDate, setminCalendarDate] = useState(firstCalendarDate)
    const [ordersUpdating, setordersUpdating] = useState(false)
    const [lastUpdatedTime, setlastUpdatedTime] = useState("")
    const [importedCellLaborDays, setImportedCellLaborDays] = useState([])
    const [HRSSTDExcel, setHRSSTDExcel] = useState([])
    const [entireMasterTable, setentireMasterTable] = useState([])


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
                for (let dict of json) {
                    dict.editedCell = false
                    dict.originalHrsSTD = dict.HorasSTD
                    dict.ExternalHRSSTD = false
                }
                let json1 = json.filter(dict => dict["Porcentaje de Pedidos"] !== 0) // no mostrar si el porc pedidos = 0
                setmasterTable(json1)
                setoriginalMasterTable(json1)
                setentireMasterTable(json)
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
                setlastUpdatedTime(time)
            })
    }

    // obetener dias laborales por cada mes del año, se descuentas las paradas programadas
    const getLaborDaysPerMonth = async () => {
        const years = [...new Set(calendar.map(x=>x.FiscalYear))]
        let laborDays = {}
        let originalLaborDays = {}
        let changedLD = {}
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
                if (selectedCell !== null) {
                    // console.log(cell)
                    for (let dict of cellsCalendarData) {

                        if (dict.celula.toString() === selectedCell.toString() && dict.name !== "Fin mes fiscal") {
                            let date1 = new Date(dict.startDate)
                            let date2 = new Date(dict.endDate)
                            let Difference_In_Time = date2.getTime() - date1.getTime()
                            let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24)

                            if (Difference_In_Days.toFixed(0).toString() === "0") {
                                let date = `${dict.startDate.getDate()}-${dict.startDate.getMonth()}-${dict.startDate.getFullYear()}`
                                for (let c of currentMonthCal) {
                                    if (addedDates.includes(date) === false && c.month.toString() === dict.startDate.getMonth().toFixed(0).toString() && c.year.toString() === dict.startDate.getFullYear().toFixed(0).toString() && dict.startDate.getDate().toString() === c.day.toString()) {
                                        filteredMonthData.push(dict)
                                        addedDates.push(date)
                                        cellMonthData.push(dict)
                                    }
                                }
                            } else {
                                Difference_In_Days = (Difference_In_Time / (1000 * 3600 * 24)) + 1
                                for (let i = 0; i < Difference_In_Days.toFixed(0); i++) {
                                    let startDate = new Date(dict.startDate).addDays(i)
                                    let date = `${startDate.getDate()}-${startDate.getMonth()}-${startDate.getFullYear()}`
                                    for (let c of currentMonthCal) {
                                        if (addedDates.includes(date) === false && c.day.toString() === startDate.getDate().toFixed(0).toString() && c.month.toString() === startDate.getMonth().toFixed(0).toString() && c.year.toString() === dict.startDate.getFullYear().toFixed(0).toString()) {
                                            filteredMonthData.push(dict)
                                            addedDates.push(date)
                                            let newDict = {...dict}
                                            newDict.startDate = startDate
                                            cellMonthData.push(newDict)
                                        }
                                    }
                                }
                            }
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

                if (currentMonthCal.length !== originalLaborDays[fMonth]) {
                    changedLD[fMonth] = 1
                }
                else {
                    changedLD[fMonth] = 0
                }
            })
        })
        setcellLaborDays(originalLaborDays)
        setCellLaborDaysOriginal(originalLaborDays)
        setcellLaborDaysChanged(changedLD)
        // console.log(cellLaborDaysChanged)
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
    const setNOpDict = () => {
        let montlynops = {...montlyNOps}
        let nOps = {}
        for (let dict of cellSettings) {
            let cell = {}
            for (let month in cellLaborDays) {
                let customNOp = undefined
                try {customNOp = montlynops[dict.CELULA][month]}
                catch (error) {}
                cell[month] = customNOp === undefined ? dict.N_TURNOS_ACT : customNOp
                cell["originalValue"] = customNOp === undefined ? dict.N_TURNOS_ACT : customNOp
            }
            nOps[dict.CELULA] = cell
        }

        setnOperarios(nOps)

        let nops_tit = {}
        for (let dict of cellSettings) {
            let cell_tit = {}
            for (let month in cellLaborDays) {
                cell_tit[month] = dict.JORNADA_NORMAL + dict.JORNADA_ESPECIAL
                cell_tit["originalValue"] = dict.JORNADA_NORMAL + dict.JORNADA_ESPECIAL
            }
            nops_tit[dict.CELULA] = cell_tit
        }

        // console.log(nops_tit)
        setnOperariosTit(nops_tit)
    }

    // obtener tabla con hrsstd
    const getHrsTable = async () => {
        const msg = {
            method:"GET",
            headers: {
                "Content-Type":"application/json"
            }
        }
        fetch(`${flaskAddress}_get_hrs_table`, msg)
            .then(response => response.json())
            .then(json => {
                json.map((dict, index) => {
                    dict.id = index
                    return (dict)
                })
                setHRSSTDExcel(json)
            })
    }

    // descargar configuraciones, celulas, tabla maestra, tabla de ordenes
    useEffect(()=> {
        getFiscalCal().then(r => r)
        getCellsList().then(r => r)
        getmasterTable().then(r => r)
        getOrdersTable().then(r => r)
        getMonthlyNOps().then(r => r)
        getCalendarData().then(r => r)
        getCellSettings().then(r => r)
        getHrsTable().then(r => r)
    }, [])

    // crear calendario para el rango de fechas despues de descargar el fiscal
    useEffect(()=> {
        getCalendar().then(r => r)
    }, [fiscalCal])

    // filtrar la tabla maestra y la de configuracion de la celula para la celula que se esta visualizando
    useEffect(()=> {
        if (masterTable.length * cellSettings.length === 0) {return}
        let table = [...masterTable]
        let filteredTable = table.filter(dict=>dict.Celula.toString() === selectedCell.toString())

        let copyFilteredTable = [...filteredTable]

        if (HRSSTDExcel.length > 0) {
            for (let dictSTD of HRSSTDExcel) {
                for (let dictFilt of copyFilteredTable) {
                    if (String(dictSTD.reference) === String(dictFilt.ReferenciaSAP) &&  String(dictSTD.cell) === String(dictFilt.Celula).slice(0,3) && dictSTD.hrs !== dictFilt.originalHrsSTD && dictFilt.ExternalHRSSTD === false && dictSTD.hrs !== "No definir") {
                        dictFilt.ExternalHRSSTD = true
                        dictFilt.HorasSTD = dictSTD.hrs
                        dictFilt.originalHrsSTD = dictSTD.hrs
                        // let ref = [...changedHRS]
                        // ref.push(dictSTD.reference)
                        // setchangedHRS(ref)
                    }
                }
            }
        }

        setcellMasterTable(copyFilteredTable)
        // console.log(cellMasterTable)
        let settings = [...cellSettings]
        settings = settings.filter(dict => dict.CELULA.toString() === selectedCell.toString())[0]
        setNOpDict()
        setproductividadCell(settings.PRODUCTIVIDAD)
        setabsentismoCell(settings.ABSENTISMO)
    }, [masterTable, selectedCell, cellSettings])

    // crear diccionario de dias laborales por mes para la celula
    useEffect(()=> {
        if (cellsCalendarData.length + calendarData.length === 0) {return}
        getLaborDaysPerMonth().then(r => {
            if (importedCellLaborDays.length === 0) return
            let celCal = {...cellLaborDays}
            for (let month in importedCellLaborDays) {
                celCal[month] = importedCellLaborDays[month]
            }
            // console.log(celCal)
            setcellLaborDays(celCal)
            setImportedCellLaborDays([])
        })
    }, [selectedCell, calendarData, cellsCalendarData])

    //handler para cuando se edita una celula de cantidad
    const handleQtyChanged = (event) => {
        let orders = [...ordersTable]
        let cellInfo = JSON.parse(event.target.id)
        let qty = parseInt(event.target.value)
        if (isNaN(qty)) {qty = 0}
        let orderExists = false
        for (let dict of ordersTable) {
            if (dict.FiscalMonth === cellInfo.fiscalMonth && dict["Reference"] === cellInfo.reference) {
                dict.Qty = qty
                dict.editedCell = true
                if (dict.Qty === dict.originalQty) {dict.editedCell = false}
                orderExists = true
                break
            }
        }
        if (!orderExists) {
            for (let dict of ordersTable) {
                if (dict["Reference"] === cellInfo.reference) {
                    let newDict = {...dict}
                    newDict.Qty = qty
                    newDict.editedCell = true
                    newDict.FiscalMonth = cellInfo.fiscalMonth
                    newDict["Text Fiscal Month"] = cellInfo.fiscalMonth
                    newDict["Fiscal Month"] = "NaN"
                    newDict.originalQty = 0
                    if (newDict.Qty === newDict.originalQty) {
                        newDict.editedCell = false
                    }
                    orders.push(newDict)
                    break
                }
            }
        }
        setordersTable(orders)
    }

    // restaurar valor de la cantidad original
    const restoreQtyValue = (event) => {
        let orders = [...ordersTable]
        let cellInfo = JSON.parse(event.target.id)
        for (let dict of ordersTable) {
            if (dict.FiscalMonth === cellInfo.fiscalMonth && dict["Reference"] === cellInfo.reference) {
                dict.Qty = dict.originalQty
                dict.editedCell = false
                break
            }
        }
        setordersTable(orders)
    }

    // handler para cambiar valor de las horas STD
    const handleHorasSTDChanged = (event) => {
        let mTable = [...masterTable]
        let cellInfo = JSON.parse(event.target.id)
        let qty = event.target.value.toString()
        // console.log(qty[-1])
        if (qty[qty.length-1] !== ".") {qty = parseFloat(qty)}
        if (isNaN(qty)) {qty = 0}

        for (let dict of mTable) {
            if (dict.Celula.toString() === cellInfo.Celula.toString() && dict.ReferenciaSAP === cellInfo.ReferenciaSAP) {
                dict.HorasSTD = qty
                dict.editedCell = true
                if (dict.HorasSTD === dict.originalHrsSTD) {dict.editedCell = false}
                break
            }
        }
        setmasterTable(mTable)
    }

    // handler para cuando se cambia el numero de operarios en un mes especifico
    const handleNOperariosChanged = (newValue, changedMonth) => {
        let nOps = {...nOperarios}
        let montlynops = {...montlyNOps}
        nOps[selectedCell][changedMonth] = newValue
        if (montlynops[selectedCell] === undefined) {montlynops[selectedCell] = {changedMonth: newValue}}
        else {
            montlynops[selectedCell][changedMonth] = newValue}
        setnOperarios(nOps)
        setmonthlyNOps(montlynops)
    }

    // handler para productividad cambiada
    const handleProductividadChanged = (event) => {
        const newValue = parseFloat(event.target.value)
        let settings = [...cellSettings]
        for (let dict of settings) {
            if (dict.CELULA.toString() === selectedCell.toString()) {
                dict.PRODUCTIVIDAD = newValue
                setproductividadCell(newValue)
                break
            }
        }
    }

    // handler para productividad cambiada
    const handleAbsentismoChanged = (event) => {
        const newValue = parseFloat(event.target.value)
        let settings = [...cellSettings]
        for (let dict of settings) {
            if (dict.CELULA.toString() === selectedCell.toString()) {
                dict.ABSENTISMO = newValue
                setabsentismoCell(newValue)
                break
            }
        }
    }

    // restaurar valor de horas STD
    const restoreHorasSTD = (event) => {
        let mTable = [...masterTable]
        let cellInfo = JSON.parse(event.target.id)
        for (let dict of mTable) {
            if (dict.Celula.toString() === cellInfo.Celula.toString() && dict.ReferenciaSAP === cellInfo.ReferenciaSAP) {
                dict.HorasSTD = dict.originalHrsSTD
                dict.editedCell = false
                break
            }
        }
        setmasterTable(mTable)
    }

    // encabezados para la tabla de produccion
    const productionMonthHeaders = () => {
        const monthsList = [...new Set(calendar.map(dict=>`${monthDictionary[dict.FiscalMonth]}-${dict.FiscalYear-2000}`))]
        const headers = ["Referencia", "HRS STD"].concat(monthsList).concat(["TOTAL PZS", "PIEZAS/DIAS", "TOTAL HRS STD", "MAX TURN", "AVG TURNO"])
        return (
            headers.map((value, index) => {
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

    // piezas producidas por mes fiscal
    const partsProduced = (ref: string) => {
        const monthsList = [...new Set(calendar.map(dict=>`${monthDictionary[dict.FiscalMonth]}-${dict.FiscalYear-2000}`))]
        let productionPerc = masterTable.filter(dict=>dict.Celula.toString() === selectedCell.toString() && dict.ReferenciaSAP === ref)[0]
        if (productionPerc === undefined) {productionPerc = 0}
        else {productionPerc = productionPerc["Porcentaje de Pedidos"]}
        return (
            monthsList.map((month, index) => {
                let monthQty = 0
                let editedCell = false
                for (let dict of ordersTable) {
                    if (dict.FiscalMonth === month && dict["Reference"] === ref) {
                        monthQty += dict.Qty
                        editedCell = dict.editedCell
                    }
                }
                if (editedCell) {productionPerc = 1}
                let style = {background: editedCell ? "rgba(255,165,0,0.82)" : "none"}
                let inputInfo = {fiscalMonth:month, reference: ref}
                return (
                    <td key={index} style={style}>
                        <input value={(monthQty*productionPerc).toFixed(0)} onChange={handleQtyChanged} className={"parts-produced-entry"} id={JSON.stringify(inputInfo)}/>
                        {editedCell ?
                        <button id={JSON.stringify(inputInfo)} onClick={restoreQtyValue} className={"restore-qty-value"}>
                            <BsArrowCounterclockwise id={JSON.stringify(inputInfo)}/>
                        </button> : null}
                    </td>
                )
            })
        )
    }

    // piezas producidas por mes visualizacion
    const partsProducedV = (ref: string) => {
        const monthsList = [...new Set(calendar.map(dict=>`${monthDictionary[dict.FiscalMonth]}-${dict.FiscalYear-2000}`))]
        let productionPerc = masterTable.filter(dict=>dict.Celula.toString() === selectedCell.toString() && dict.ReferenciaSAP === ref)[0]
        if (productionPerc === undefined) {productionPerc = 0}
        else {productionPerc = productionPerc["Porcentaje de Pedidos"]}
        return (
            monthsList.map((month, index) => {
                let monthQty = 0
                let editedCell = false
                for (let dict of ordersTable) {
                    if (dict.FiscalMonth === month && dict["Reference"] === ref) {
                        monthQty += dict.Qty
                        editedCell = dict.editedCell
                    }
                }
                if (editedCell) {productionPerc = 1}
                let style = {background: editedCell ? "rgba(255,165,0,0.82)" : "none"}
                let inputInfo = {fiscalMonth:month, reference: ref}
                return (
                    <td key={index} style={style}>
                        {(monthQty*productionPerc).toFixed(0)}
                    </td>
                )
            })
        )
    }

    // piezas totaltes producidas, piezas por dia, Total hrs STD, max turno, y avg turno por ref
    const totalPartsProduced = (ref: string, hrsSTD: number) => {
        const monthsList = [...new Set(calendar.map(dict=>`${monthDictionary[dict.FiscalMonth]}-${dict.FiscalYear-2000}`))]
        let productionPerc = masterTable.filter(dict=>dict.Celula.toString() === selectedCell.toString() && dict.ReferenciaSAP === ref)[0]
        if (productionPerc === undefined) {productionPerc = 0}
        else {productionPerc = productionPerc["Porcentaje de Pedidos"]}
        let totalQty = 0
        let totalLaborDays = 0
        // eslint-disable-next-line array-callback-return
        monthsList.map((month, index) => {
            // obtener piezas producidas en el mes
            for (let dict of ordersTable) {
                if (dict.FiscalMonth === month && dict["Reference"] === ref) {
                    totalQty += dict.Qty
                }
            }
            totalLaborDays = totalLaborDays + cellLaborDays[month]
        })
        totalQty = totalQty*productionPerc
        let combinedCellsNumber = cellsList.filter((cell) => cell.slice(0,3) === String(selectedCell).slice(0,3))
        combinedCellsNumber = combinedCellsNumber.length
        let maxTurno = (8*1.42/hrsSTD*100)/combinedCellsNumber
        let avgTurno = (maxTurno*productividadCell)
        return (
            <>
                <td>{totalQty.toFixed(0)}</td>
                <td>{(totalQty/totalLaborDays).toFixed(2)}</td>
                <td>{((totalQty*hrsSTD)/100).toFixed(2)}</td>
                <td>{maxTurno.toFixed(0)}</td>
                <td>{avgTurno.toFixed(0)}</td>
            </>
            )
    }

    // boton de absentismo y de productividad
    const cellSettingsInputs = () => {
        let settings = [...cellSettings]
        settings = settings.filter(dict => dict.CELULA.toString() === selectedCell.toString())[0]
        let prodColor = "#000000"
        let absColor = "#000000"
        if (settings.OriginalPRODUCTIVIDAD !== productividadCell) {
            prodColor = "#ffad00"
        }
        if (settings.OriginalABSENTISMO !== absentismoCell) {
            absColor = "#ffad00"
        }
        return (
            <>
                <h6>Productividad:</h6>
                <input className={'cargas-maquina-settings-n-input'} value={productividadCell} type={"number"} step={0.01} onChange={handleProductividadChanged} style={{borderColor:prodColor}}/>
                <h6>Absentismo:</h6>
                <input className={'cargas-maquina-settings-n-input'} value={absentismoCell} type={"number"} step={0.01} onChange={handleAbsentismoChanged} style={{borderColor:absColor}}/>
            </>
        )
    }

    // restaurar ajustes de celula a su valor original, restaura las referencias, las hrsstd, pedidos, operarios y dias laborables
    const restoreCellSettings = () => {
        let settings = [...cellSettings]
        for (let dict of settings) {
            if (dict.CELULA.toString() === selectedCell.toString()) {
                dict.PRODUCTIVIDAD = dict.OriginalPRODUCTIVIDAD
                dict.ABSENTISMO = dict.OriginalABSENTISMO
                // opType = dict.o
                break
            }
        }
        setcellSettings(settings)

        let orders = [...ordersTable]
        for (let dict of ordersTable) {
            dict.Qty = dict.originalQty
            dict.editedCell = false
        }
        setordersTable(orders)

        const body = {
            method:"GET",
            headers: {
                "Content-Type":"application/json"
            }
        }
        fetch(`${flaskAddress}_get_master_table`, body)
            .then(response => response.json())
            .then(json => {
                for (let dict of json) {
                    dict.editedCell = false
                    dict.originalHrsSTD = dict.HorasSTD
                    dict.ExternalHRSSTD = false
                }
                let json1 = json.filter(dict => dict["Porcentaje de Pedidos"] !== 0) // no mostrar si el porc pedidos = 0
                setmasterTable(json1)
                setoriginalMasterTable(json1)
            })

        let cal = {...cellLaborDaysOriginal}
        setcellLaborDays(cal)

        let nOps = {...nOperarios}

        for (let dict of settings) {
            if (dict.CELULA.toString() === selectedCell.toString()) {
                Object.entries(nOps[selectedCell]).forEach(([key, value]) => {
                    nOps[selectedCell][key] = dict.N_TURNOS_ACT
                })
            }
        }

        setnOperarios(nOps)
        setmonthlyNOps({})
    }

    // handler para descargar la simulacion realizada
    const handleSaveSimulation = () => {
        setisButtonLoading(true)
        const contentsDict = {
            ordersTable: ordersTable,
            nOperarios: [nOperarios],
            masterTable: masterTable,
            cellSettings: cellSettings,
            selectedCell: [{selectedCell: selectedCell}],
            cellLaborDays: [cellLaborDays]
        }
        const body = {
            method:"POST",
            headers: {
                "Content-Type":"application/json",
            },
            body: JSON.stringify(contentsDict)
        }
        fetch(`${flaskAddress}_export_simulation`, body)
            .then(res => res.blob())
            .then(blob => {
                let FileSaver = require('file-saver');
                FileSaver.saveAs(blob, `simulation-${selectedCell}.xlsx`);
            })
            .then(r => setisButtonLoading(false))
    }

    // abrir el popup
    const handleImportSimulation = () => {
        setshowPopUp(true)
    }

    // cerrar el popup
    const closePopUp = () => {
        setshowPopUp(false)
    }

    // aplicar tablas importadas a la carga de maquina
    const applySimulationData = (response) => {
        // parse la tabla de nOperarios
        response.nOperarios = response.nOperarios[0]
        for (let cell in response.nOperarios) {
            response.nOperarios[cell] = response.nOperarios[cell].replace(/'/g, '"')
            response.nOperarios[cell] = JSON.parse(response.nOperarios[cell])
        }
        // ordenar el calendario importado con el orden apropiado
        const monthsList = [...new Set(calendar.map(dict=>`${monthDictionary[dict.FiscalMonth]}-${dict.FiscalYear-2000}`))]
        let newCellCal = {}
        for (let month of monthsList) {
            if (response.cellLaborDays[0][month] === undefined) {
                continue
            }
            newCellCal[month] = response.cellLaborDays[0][month]
        }
        setImportedCellLaborDays(newCellCal)
        // aplicar tablas descargadas
        setmasterTable(response.masterTable)
        setordersTable(response.ordersTable)
        setnOperarios(response.nOperarios)
        setmonthlyNOps(response.nOperarios)
        setcellSettings(response.cellSettings)
        setselectedCell(response.selectedCell[0].selectedCell)
        alert("Simulacion Importada correctamente")
    }

    //mostrar o ocultar el popup
    const handleAddRef = () => {
        setshowAddRefPopUp(!showAddRefPopUp)
    }

     // agregar referencias Seleccionadas a la tabla
    const addRefs = (master) => {
        setmasterTable(master)
    }

    // total de dias habiles en el mes
    const totalLaborDays = () => {
        let total = 0
        for (let month in cellLaborDays) {
            let value = parseInt(cellLaborDays[month])
            total = total + value
        }
        return (
            <th>{total}</th>
        )
    }

    // total de hrs STD
    const totalHRSSTD = () => {
        let totalHrsSTD = 0
        for (let value of Object.keys(cellLaborDays)) {
            // obtener piezas producidas en el mes
            let references = cellMasterTable.map(dict => dict.ReferenciaSAP)
            for (let dict of ordersTable) {
                if (dict.FiscalMonth === value && references.includes(dict["Reference"])) {
                    let ref = dict["Reference"]
                    let productionPerc = masterTable.filter(dict3=>dict3.Celula.toString() === selectedCell.toString() && dict3.ReferenciaSAP.toString() === ref.toString())[0]
                    if (productionPerc === undefined) {productionPerc = 0}
                    else {productionPerc = productionPerc["Porcentaje de Pedidos"]}
                    let hrsSTD = cellMasterTable.filter(dict2 => dict2.ReferenciaSAP === dict["Reference"])[0]["HorasSTD"]
                    totalHrsSTD += dict.Qty * productionPerc * hrsSTD / 100
                }
            }
        }
        return (
            <th>{totalHrsSTD.toFixed(2)}</th>
        )
    }

    // total de hrs necesarias STD
    const totalHrsSTDNec = () => {
        let totalHrsSTD = 0
        for (let value of Object.keys(cellLaborDays)) {
            // obtener piezas producidas en el mes
            let references = cellMasterTable.map(dict => dict.ReferenciaSAP)
            for (let dict of ordersTable) {
                if (dict.FiscalMonth === value && references.includes(dict["Reference"])) {
                    let ref = dict["Reference"]
                    let productionPerc = masterTable.filter(dict3=>dict3.Celula.toString() === selectedCell.toString() && dict3.ReferenciaSAP.toString() === ref.toString())[0]
                    if (productionPerc === undefined) {productionPerc = 0}
                    else {productionPerc = productionPerc["Porcentaje de Pedidos"]}
                    let hrsSTD = cellMasterTable.filter(dict2 => dict2.ReferenciaSAP === dict["Reference"])[0]["HorasSTD"]
                    totalHrsSTD += dict.Qty * productionPerc * hrsSTD / 100
                }
            }
        }
        totalHrsSTD = totalHrsSTD / productividadCell
        return (
            <th>{totalHrsSTD.toFixed(2)}</th>
        )
    }

    // total de hrs disponibles
    const totalHrsDisp = () => {
        let total = 0
        for (let value of Object.keys(cellLaborDays)) {
            // obtener piezas producidas en el mes
            let laborDays = cellLaborDays[value]
            let hrsDisponibles = (nOperarios[selectedCell][value]*laborDays*8)/(1+absentismoCell)
            total = total + hrsDisponibles
            }
            return (
                <th>{total.toFixed(2)}</th>
            )
        }

    // total de NOp necesarios
    const totalNOpNec = () => {
        let totalHrsSTD = 0
        let laborDays = 0
        for (let value of Object.keys(cellLaborDays)) {
            // obtener piezas producidas en el mes
            laborDays = laborDays + cellLaborDays[value]
            let references = cellMasterTable.map(dict => dict.ReferenciaSAP)
            for (let dict of ordersTable) {
                if (dict.FiscalMonth === value && references.includes(dict["Reference"])) {
                    let ref = dict["Reference"]
                    let productionPerc = masterTable.filter(dict3=>dict3.Celula.toString() === selectedCell.toString() && dict3.ReferenciaSAP.toString() === ref.toString())[0]
                    if (productionPerc === undefined) {productionPerc = 0}
                    else {productionPerc = productionPerc["Porcentaje de Pedidos"]}
                    let hrsSTD = cellMasterTable.filter(dict2 => dict2.ReferenciaSAP === dict["Reference"])[0]["HorasSTD"]
                    totalHrsSTD += (dict.Qty * productionPerc * hrsSTD)/100
                }
            }
        }
        totalHrsSTD = totalHrsSTD/productividadCell
        let nroOpNecesarios = (totalHrsSTD)/(8*laborDays*(1-absentismoCell))
        let style = {background: nroOpNecesarios > nOperarios[selectedCell].originalValue ? "rgba(255,0,0,0.67)" : "rgba(48,255,144,0.67)"}
        return (
            <th style={style}>{nroOpNecesarios.toFixed(2)}</th>
        )
    }

    // total produccion de piezas mensual
    const totalRefsProdMonthly = () => {
        const monthsList = [...new Set(calendar.map(dict=>`${monthDictionary[dict.FiscalMonth]}-${dict.FiscalYear-2000}`))]
        return (
            monthsList.map((month, index) => {
                let totalMonthQty = 0
                for (let dict of cellMasterTable) {
                    let ref = dict.ReferenciaSAP
                    let productionPerc = masterTable.filter(dict=>dict.Celula.toString() === selectedCell.toString() && dict.ReferenciaSAP === ref)[0]
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
                    <th key={index}>{totalMonthQty.toFixed(0)}</th>
                )
                }))
    }

    // total produccion de piezas en el rango de tiempo
    const totalRefsProd = () => {
        const monthsList = [...new Set(calendar.map(dict=>`${monthDictionary[dict.FiscalMonth]}-${dict.FiscalYear-2000}`))]
        let totalQty = 0
        // eslint-disable-next-line array-callback-return
            monthsList.map((month, index) => {
                for (let dict of cellMasterTable) {
                    let ref = dict.ReferenciaSAP
                    let productionPerc = masterTable.filter(dict=>dict.Celula.toString() === selectedCell.toString() && dict.ReferenciaSAP === ref)[0]
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
                    totalQty = totalQty + monthQty*productionPerc
                }
            })
        return (
            <th>{totalQty.toFixed(0)}</th>
        )
    }

    // total de piezas por dia en el rango de tiempo
    const totalPartsPerDay = () => {
        const monthsList = [...new Set(calendar.map(dict=>`${monthDictionary[dict.FiscalMonth]}-${dict.FiscalYear-2000}`))]
        let totalQty = 0
        // eslint-disable-next-line array-callback-return
        monthsList.map((month, index) => {
            for (let dict of cellMasterTable) {
                let ref = dict.ReferenciaSAP
                let productionPerc = masterTable.filter(dict=>dict.Celula.toString() === selectedCell.toString() && dict.ReferenciaSAP === ref)[0]
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
                totalQty = totalQty + monthQty*productionPerc
            }
        })
        let totalDays = 0
        for (let value of Object.keys(cellLaborDays)) {
            // obtener piezas producidas en el mes
            let laborDays = cellLaborDays[value]
            totalDays = totalDays + laborDays
        }
        return (
            <th>{(totalQty/totalDays).toFixed(2)}</th>
        )
    }

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

    // handler para cuando se cambia el numero de dias laborales
    const handleCellCalendarChanged = (event) => {
        let newDays = parseInt(event.target.value)
        if (isNaN(newDays)) {newDays = 0}
        const month = JSON.parse(event.target.id)
        let cal = {...cellLaborDays}
        cal[month] = newDays
        setcellLaborDays(cal)
    }

    // restaurar valor original del numero de dias laborales
    const restoreCellLaborDays = (event) => {
        let month = JSON.parse(event.target.id)
        let cal = {...cellLaborDays}
        cal[month] = cellLaborDaysOriginal[month]
        setcellLaborDays(cal)
    }

    // actualizar tabla de pedidos
    const updateOrders = () => {
        setordersUpdating(true)
        const msg = {
            method:"GET",
            headers: {
                "Content-Type":"application/json"
            }
        }
        fetch(`${flaskAddress}_update_orders_table`, msg)
            .then(r => {
                getOrdersTable().then(r=> {
                    alert("Ordenes actualizadas exitosamente")
                    setordersUpdating(false)
                })
            })
            .catch(r => {
                alert("Hubo un error al actualizar el pedido")
                setordersUpdating(false)
            })
    }

    // hanlder de cuando se selecciona la celula
    const handleCellSelected = (val) => {
        setselectedCell(val)
        setcellLaborDays(cellLaborDaysOriginal)
    }

    // si no esta autorizado dara lugar a error
    if (sessionStorage.getItem("user") === "Desautorizado" || sessionStorage.getItem("user") === "Manufactura") {
        return (
            <ErrorWindow/>
        )
    }

    // pantalla de carga
    if (calendar.length* masterTable.length* cellsList.length* fiscalCal.length * ordersTable.length * cellSettings.length * Object.keys(nOperarios).length === 0) {
        return (
            <div>
                <NavBar title={"Cargas de Maquina"}/>
                <LoadingWindow/>
            </div>
        )
    }

    // codigo para usuarios que pueden simular
    if (sessionStorage.getItem("user") === "Manager" || sessionStorage.getItem("user") === "Administrador" || sessionStorage.getItem("user") === "Usuario"){
        return (
            <div>
                <AddReferencePopUp show={showAddRefPopUp}
                                   close={handleAddRef}
                                   masterTable={masterTable}
                                   setmasterTable={addRefs}
                                   originalmasterTable={originalMasterTable}
                                   cell={selectedCell}
                    //selectedRefs={Array.from(new Set(cellMasterTable.map((dict) => dict.ReferenciaSAP)))}
                                   cellMasterTable={cellMasterTable}
                                   entireMasterTable={entireMasterTable}
                />
                <UploadFilePopUp show={showPopUp} close={closePopUp} applySimulationData={applySimulationData}/>
                <NavBar title={"Cargas de Maquina"}
                        handleSaveSimulation={handleSaveSimulation}
                        isCargaMaquinaButtonLoading={isButtonLoading}
                        handleImportSimulation={handleImportSimulation}
                        updateOrdersTable={updateOrders}
                        ordersUpdating={ordersUpdating}
                        lastUpdate={lastUpdatedTime}
                />
                <div className={"production-table-container"}>
                    <h5>Ajustes de celula</h5>
                    <div className={'cargas-maquina-settings-container'}>
                        <h6>Celula:</h6>
                        <DropdownList
                            style={{width: "100px"}}
                            defaultValue={selectedCell}
                            data={cellsList}
                            placeholder={'Celula'}
                            value={selectedCell} onChange={handleCellSelected}/>
                        {cellSettingsInputs()}
                        <button className={'restore-cm-settings-button'} onClick={handleAddRef}>Agregar Referencia(s)</button>
                        <DateFilter initDate={minCalendarDate} lastDate={lastCalendarDate} setLastDate={handleLastDayChanged} setFirstDate={handleFirstDayChanged} maxDate={maxCalendarDate}/>
                        <button className={'restore-cm-settings-button'} onClick={restoreCellSettings}>Restaurar ajustes</button>
                    </div>
                    <Table striped bordered hover className={"production-table"} size={"sm"}>
                        <thead>
                        <tr style={{borderColor:"white"}}>
                            <th></th>
                            <th></th>
                            <th colSpan={monthDiff(lastCalendarDate, firstCalendarDate)+1}>
                                <h2 className={'production-table-title'}>CARGAS DE MAQUINA EYE CELULA: {selectedCell}</h2>
                            </th>
                        </tr>
                        <tr style={{borderColor:"white"}}>
                            <th></th>
                            <th></th>
                            <th colSpan={monthDiff(lastCalendarDate, firstCalendarDate)+1} style={{background:"#e3e3e3", color:"black"}}>
                                <div className={"production-table-title"}>NUMERO DE PIEZAS</div>
                            </th>
                        </tr>
                        <tr>
                            {productionMonthHeaders()}
                        </tr>
                        </thead>
                        <tbody>
                        {cellMasterTable.map((dict, key)=>{
                            return (
                                <tr key={key}>
                                    <td style={{color: dict.ExternalHRSSTD ? "red" : "black"}}>
                                        {dict.ReferenciaSAP}
                                    </td>
                                    <td style={{background: dict.editedCell ? "rgba(255,165,0,0.82)" : "none"}}>
                                        <input  value={dict.HorasSTD} className={"parts-produced-entry"} id={JSON.stringify(dict)} onChange={handleHorasSTDChanged}/>
                                        {dict.editedCell ?
                                            <button id={JSON.stringify(dict)} onClick={restoreHorasSTD} className={"restore-qty-value"}>
                                                <BsArrowCounterclockwise id={JSON.stringify(dict)}/>
                                            </button> : null}
                                    </td>
                                    {partsProduced(dict.ReferenciaSAP)}
                                    {totalPartsProduced(dict.ReferenciaSAP, dict.HorasSTD)}
                                </tr>
                            )
                        })}
                        <tr>
                            <td></td>
                            <th>TOTAL</th>
                            {totalRefsProdMonthly()}
                            {totalRefsProd()}
                            {totalPartsPerDay()}
                            {totalHRSSTD()}
                        </tr>
                        <tr>
                            <td colSpan={26} className={'production-table-separator'}></td>
                        </tr>
                        <tr>
                            <th></th>
                            <th></th>
                            {Object.keys(cellLaborDays).map(value => {
                                return (
                                    <th>{value}</th>
                                )
                            })}
                            <th>TOTAL</th>
                            <td colSpan={4} className={"secondary-table-right-filler"}></td>
                        </tr>
                        <tr>
                            <th colSpan={2}>DIAS HABILES</th>
                            {Object.keys(cellLaborDays).map((value, index) => {
                                let editedCell = cellLaborDays[value] !== cellLaborDaysOriginal[value]
                                let colorParada = cellLaborDaysChanged[value] === 1
                                let style = {background: editedCell ? "rgba(255,165,0,0.82)" : "none"}
                                let styleColor = {color: colorParada ? "red" : "black"}
                                return (
                                    <td key={index} style={style}>
                                        <input value={cellLaborDays[value]} className={'parts-produced-entry'} onChange={handleCellCalendarChanged} id={JSON.stringify(value)}/>
                                        {editedCell ?
                                            <button id={JSON.stringify(value)} onClick={restoreCellLaborDays} className={"restore-qty-value"}>
                                                <BsArrowCounterclockwise id={JSON.stringify(value)}/>
                                            </button> : null}
                                    </td>
                                )
                            })}
                            {totalLaborDays()}
                            <td colSpan={4} className={"secondary-table-right-filler"}></td>
                        </tr>
                        <tr>
                            <th colSpan={2}>HRS STD</th>
                            {Object.keys(cellLaborDays).map((value, index) => {
                                // obtener piezas producidas en el mes
                                let references = cellMasterTable.map(dict => dict.ReferenciaSAP)
                                let totalHrsSTD = 0
                                for (let dict of ordersTable) {
                                    if (dict.FiscalMonth === value && references.includes(dict["Reference"])) {
                                        let ref = dict["Reference"]
                                        let productionPerc = masterTable.filter(dict3=>dict3.Celula.toString() === selectedCell.toString() && dict3.ReferenciaSAP.toString() === ref.toString())[0]
                                        if (productionPerc === undefined) {productionPerc = 0}
                                        else {productionPerc = productionPerc["Porcentaje de Pedidos"]}
                                        let hrsSTD = cellMasterTable.filter(dict2 => dict2.ReferenciaSAP === dict["Reference"])[0]["HorasSTD"]

                                        totalHrsSTD += dict.Qty * productionPerc * hrsSTD/100
                                    }
                                }
                                return (
                                    <td key={index}>{totalHrsSTD.toFixed(2)}</td>
                                )
                            })}
                            {totalHRSSTD()}
                            <td colSpan={4} className={"secondary-table-right-filler"}></td>
                        </tr>
                        <tr>
                            <th colSpan={2}>HRS NEC. PEDIDOS</th>
                            {Object.keys(cellLaborDays).map((value, index) => {
                                // obtener piezas producidas en el mes
                                let references = cellMasterTable.map(dict => dict.ReferenciaSAP)
                                let totalHrsSTD = 0
                                for (let dict of ordersTable) {
                                    if (dict.FiscalMonth === value && references.includes(dict["Reference"])) {
                                        let ref = dict["Reference"]
                                        let productionPerc = masterTable.filter(dict3=>dict3.Celula.toString() === selectedCell.toString() && dict3.ReferenciaSAP.toString() === ref.toString())[0]
                                        if (productionPerc === undefined) {productionPerc = 0}
                                        else {productionPerc = productionPerc["Porcentaje de Pedidos"]}
                                        let hrsSTD = cellMasterTable.filter(dict2 => dict2.ReferenciaSAP === dict["Reference"])[0]["HorasSTD"]
                                        totalHrsSTD += dict.Qty * productionPerc * hrsSTD/100
                                    }
                                }
                                totalHrsSTD = totalHrsSTD/productividadCell
                                return (
                                    <td key={index}>{totalHrsSTD.toFixed(2)}</td>
                                )
                            })}
                            {totalHrsSTDNec()}
                            <td colSpan={4} className={"secondary-table-right-filler"}></td>
                        </tr>
                        <tr>
                            <th colSpan={2}>HRS DISPONIBLES</th>
                            {Object.keys(cellLaborDays).map((value, index) => {
                                // obtener piezas producidas en el mes
                                let laborDays = cellLaborDays[value]
                                let references = cellMasterTable.map(dict => dict.ReferenciaSAP)
                                let totalHrsSTD = 0
                                for (let dict of ordersTable) {
                                    if (dict.FiscalMonth === value && references.includes(dict["Reference"])) {
                                        let hrsSTD = cellMasterTable.filter(dict2 => dict2.ReferenciaSAP === dict["Reference"])[0]["HorasSTD"]
                                        totalHrsSTD += dict.Qty * hrsSTD/100
                                    }
                                }
                                let hrsDisponibles = (nOperarios[selectedCell][value]*laborDays*8)/(1+absentismoCell)
                                return (
                                    <td key={index}>{hrsDisponibles.toFixed(2)}</td>
                                )
                            })}
                            {totalHrsDisp()}
                            <td colSpan={4} className={"secondary-table-right-filler"}></td>
                        </tr>
                        <tr>
                            <th colSpan={2}>Nº OP TITULARES</th>
                            {Object.keys(cellLaborDays).map((value, index) => {

                                let JN = 0
                                let JE = 0

                                for (let dict of cellSettings) {
                                    if (dict.CELULA.toString() === selectedCell.toString()){
                                        JE = dict.JORNADA_ESPECIAL
                                        JN = dict.JORNADA_NORMAL
                                    }
                                }
                                return (
                                    <td key={index}>{(JN + JE).toFixed(2)}
                                    </td>
                                )
                            })}
                            <th>{nOperariosTit[selectedCell].originalValue}</th>
                            <td colSpan={4} className={"secondary-table-right-filler"}></td>
                        </tr>
                        <tr>
                            <th colSpan={2}>Nº TURNOS ACTUALES</th>
                            {Object.keys(cellLaborDays).map((value, index) => {
                                let style = {background: nOperarios[selectedCell][value] !== nOperarios[selectedCell].originalValue ? "rgba(255,165,0,0.82)" : "none"}
                                return (
                                    <td key={index} style={style}>
                                        <input value={nOperarios[selectedCell][value]} className={'parts-produced-entry'} onChange={event => handleNOperariosChanged(event.target.value, value)}/>
                                        {nOperarios[selectedCell][value] !== nOperarios[selectedCell].originalValue ?
                                            <button id={value} onClick={event => handleNOperariosChanged(nOperarios[selectedCell].originalValue, event.target.id)} className={"restore-qty-value"}>
                                                <BsArrowCounterclockwise id={value}/>
                                            </button> : null}
                                    </td>
                                )
                            })}
                            <th>{nOperarios[selectedCell].originalValue}</th>
                            <td colSpan={4} className={"secondary-table-right-filler"}></td>
                        </tr>
                        <tr>
                            <th colSpan={2}>Nº TURNOS NECESARIOS</th>
                            {Object.keys(cellLaborDays).map((value, index) => {
                                // obtener piezas producidas en el mes
                                let laborDays = cellLaborDays[value]
                                let references = cellMasterTable.map(dict => dict.ReferenciaSAP)
                                let totalHrsSTD = 0
                                for (let dict of ordersTable) {
                                    if (dict.FiscalMonth === value && references.includes(dict["Reference"])) {
                                        let ref = dict["Reference"]
                                        let productionPerc = masterTable.filter(dict3=>dict3.Celula.toString() === selectedCell.toString() && dict3.ReferenciaSAP.toString() === ref.toString())[0]
                                        if (productionPerc === undefined) {productionPerc = 0}
                                        else {productionPerc = productionPerc["Porcentaje de Pedidos"]}
                                        let hrsSTD = cellMasterTable.filter(dict2 => dict2.ReferenciaSAP === dict["Reference"])[0]["HorasSTD"]
                                        totalHrsSTD += dict.Qty * productionPerc * hrsSTD/100
                                    }
                                }
                                totalHrsSTD = totalHrsSTD/productividadCell
                                let nroOpNecesarios = (totalHrsSTD)/(8*laborDays*(1-absentismoCell))
                                let style = {background: nroOpNecesarios > nOperarios[selectedCell][value] ? "rgba(255,0,0,0.67)" : "rgba(48,255,144,0.67)"}
                                return (
                                    <td key={index} style={style}>{nroOpNecesarios.toFixed(2)}</td>
                                )
                            })}
                            {totalNOpNec()}
                            <td colSpan={4} className={"secondary-table-right-filler"}></td>
                        </tr>
                        </tbody>
                    </Table>
                </div>
            </div>
        )
    }

    // codigo para usuarios visualizadores
    if (sessionStorage.getItem("user") === "Visualizar"){
        return (
            <div>
                <AddReferencePopUp show={showAddRefPopUp}
                                   close={handleAddRef}
                                   masterTable={masterTable}
                                   setmasterTable={addRefs}
                                   originalmasterTable={originalMasterTable}
                                   cell={selectedCell}
                    //selectedRefs={Array.from(new Set(cellMasterTable.map((dict) => dict.ReferenciaSAP)))}
                                   cellMasterTable={cellMasterTable}
                                   entireMasterTable={entireMasterTable}
                />
                <UploadFilePopUp show={showPopUp} close={closePopUp} applySimulationData={applySimulationData}/>
                <NavBar title={"Cargas de Maquina"}
                        handleSaveSimulation={handleSaveSimulation}
                        isCargaMaquinaButtonLoading={isButtonLoading}
                        handleImportSimulation={handleImportSimulation}
                        updateOrdersTable={updateOrders}
                        ordersUpdating={ordersUpdating}
                        lastUpdate={lastUpdatedTime}
                />
                <div className={"production-table-container"}>
                    <h5>Ajustes de celula</h5>
                    <div className={'cargas-maquina-settings-container'}>
                        <h6>Celula:</h6>
                        <DropdownList
                            style={{width: "100px"}}
                            defaultValue={selectedCell}
                            data={cellsList}
                            placeholder={'Celula'}
                            value={selectedCell} onChange={handleCellSelected}/>
                        {/*{cellSettingsInputs()}*/}
                        {/*<button className={'restore-cm-settings-button'} onClick={handleAddRef}>Agregar Referencia(s)</button>*/}
                        <DateFilter initDate={minCalendarDate} lastDate={lastCalendarDate} setLastDate={handleLastDayChanged} setFirstDate={handleFirstDayChanged} maxDate={maxCalendarDate}/>
                        {/*<button className={'restore-cm-settings-button'} onClick={restoreCellSettings}>Restaurar ajustes</button>*/}
                    </div>
                    <Table striped bordered hover className={"production-table"} size={"sm"}>
                        <thead>
                        <tr style={{borderColor:"white"}}>
                            <th></th>
                            <th></th>
                            <th colSpan={monthDiff(lastCalendarDate, firstCalendarDate)+1}>
                                <h2 className={'production-table-title'}>CARGAS DE MAQUINA EYE CELULA: {selectedCell}</h2>
                            </th>
                        </tr>
                        <tr style={{borderColor:"white"}}>
                            <th></th>
                            <th></th>
                            <th colSpan={monthDiff(lastCalendarDate, firstCalendarDate)+1} style={{background:"#e3e3e3", color:"black"}}>
                                <div className={"production-table-title"}>NUMERO DE PIEZAS</div>
                            </th>
                        </tr>
                        <tr>
                            {productionMonthHeaders()}
                        </tr>
                        </thead>
                        <tbody>
                        {cellMasterTable.map((dict, key)=>{
                            return (
                                <tr key={key}>
                                    <td style={{color: dict.ExternalHRSSTD ? "red" : "black"}}>
                                        {dict.ReferenciaSAP}
                                    </td>
                                    <td style={{background: dict.editedCell ? "rgba(255,165,0,0.82)" : "none"}}>
                                        {dict.HorasSTD}
                                    </td>
                                    {partsProducedV(dict.ReferenciaSAP)}
                                    {totalPartsProduced(dict.ReferenciaSAP, dict.HorasSTD)}
                                </tr>
                            )
                        })}
                        <tr>
                            <td></td>
                            <th>TOTAL</th>
                            {totalRefsProdMonthly()}
                            {totalRefsProd()}
                            {totalPartsPerDay()}
                            {totalHRSSTD()}
                        </tr>
                        <tr>
                            <td colSpan={26} className={'production-table-separator'}></td>
                        </tr>
                        <tr>
                            <th></th>
                            <th></th>
                            {Object.keys(cellLaborDays).map(value => {
                                return (
                                    <th>{value}</th>
                                )
                            })}
                            <th>TOTAL</th>
                            <td colSpan={4} className={"secondary-table-right-filler"}></td>
                        </tr>
                        <tr>
                            <th colSpan={2}>DIAS HABILES</th>
                            {Object.keys(cellLaborDays).map((value, index) => {
                                let editedCell = cellLaborDays[value] !== cellLaborDaysOriginal[value]
                                let style = {background: editedCell ? "rgba(255,165,0,0.82)" : "none"}
                                return (
                                    <td key={index} style={style}>
                                        {cellLaborDays[value]}
                                    </td>
                                )
                            })}
                            {totalLaborDays()}
                            <td colSpan={4} className={"secondary-table-right-filler"}></td>
                        </tr>
                        <tr>
                            <th colSpan={2}>HRS STD</th>
                            {Object.keys(cellLaborDays).map((value, index) => {
                                // obtener piezas producidas en el mes
                                let references = cellMasterTable.map(dict => dict.ReferenciaSAP)
                                let totalHrsSTD = 0
                                for (let dict of ordersTable) {
                                    if (dict.FiscalMonth === value && references.includes(dict["Reference"])) {
                                        let ref = dict["Reference"]
                                        let productionPerc = masterTable.filter(dict3=>dict3.Celula.toString() === selectedCell.toString() && dict3.ReferenciaSAP.toString() === ref.toString())[0]
                                        if (productionPerc === undefined) {productionPerc = 0}
                                        else {productionPerc = productionPerc["Porcentaje de Pedidos"]}
                                        let hrsSTD = cellMasterTable.filter(dict2 => dict2.ReferenciaSAP === dict["Reference"])[0]["HorasSTD"]
                                        totalHrsSTD += dict.Qty * productionPerc * hrsSTD/100
                                    }
                                }
                                return (
                                    <td key={index}>{totalHrsSTD.toFixed(2)}</td>
                                )
                            })}
                            {totalHRSSTD()}
                            <td colSpan={4} className={"secondary-table-right-filler"}></td>
                        </tr>
                        <tr>
                            <th colSpan={2}>HRS NEC. PEDIDOS</th>
                            {Object.keys(cellLaborDays).map((value, index) => {
                                // obtener piezas producidas en el mes
                                let references = cellMasterTable.map(dict => dict.ReferenciaSAP)
                                let totalHrsSTD = 0
                                for (let dict of ordersTable) {
                                    if (dict.FiscalMonth === value && references.includes(dict["Reference"])) {
                                        let ref = dict["Reference"]
                                        let productionPerc = masterTable.filter(dict3=>dict3.Celula.toString() === selectedCell.toString() && dict3.ReferenciaSAP.toString() === ref.toString())[0]
                                        if (productionPerc === undefined) {productionPerc = 0}
                                        else {productionPerc = productionPerc["Porcentaje de Pedidos"]}
                                        let hrsSTD = cellMasterTable.filter(dict2 => dict2.ReferenciaSAP === dict["Reference"])[0]["HorasSTD"]
                                        totalHrsSTD += dict.Qty * productionPerc * hrsSTD/100
                                    }
                                }
                                totalHrsSTD = totalHrsSTD/productividadCell
                                return (
                                    <td key={index}>{totalHrsSTD.toFixed(2)}</td>
                                )
                            })}
                            {totalHrsSTDNec()}
                            <td colSpan={4} className={"secondary-table-right-filler"}></td>
                        </tr>
                        <tr>
                            <th colSpan={2}>HRS DISPONIBLES</th>
                            {Object.keys(cellLaborDays).map((value, index) => {
                                // obtener piezas producidas en el mes
                                let laborDays = cellLaborDays[value]
                                let references = cellMasterTable.map(dict => dict.ReferenciaSAP)
                                let totalHrsSTD = 0
                                for (let dict of ordersTable) {
                                    if (dict.FiscalMonth === value && references.includes(dict["Reference"])) {
                                        let hrsSTD = cellMasterTable.filter(dict2 => dict2.ReferenciaSAP === dict["Reference"])[0]["HorasSTD"]
                                        totalHrsSTD += dict.Qty * hrsSTD/100
                                    }
                                }
                                let hrsDisponibles = (nOperarios[selectedCell][value]*laborDays*8)/(1+absentismoCell)
                                return (
                                    <td key={index}>{hrsDisponibles.toFixed(2)}</td>
                                )
                            })}
                            {totalHrsDisp()}
                            <td colSpan={4} className={"secondary-table-right-filler"}></td>
                        </tr>
                        <tr>
                            <th colSpan={2}>Nº OP TITULARES</th>
                            {Object.keys(cellLaborDays).map((value, index) => {

                                let JN = 0
                                let JE = 0

                                for (let dict of cellSettings) {
                                    if (dict.CELULA.toString() === selectedCell.toString()){
                                        JE = dict.JORNADA_ESPECIAL
                                        JN = dict.JORNADA_NORMAL
                                    }
                                }
                                return (
                                    <td key={index}>{(JN + JE).toFixed(2)}
                                    </td>
                                )
                            })}
                            <th>{nOperariosTit[selectedCell].originalValue.toFixed(2)}</th>
                            <td colSpan={4} className={"secondary-table-right-filler"}></td>
                        </tr>
                        <tr>
                            <th colSpan={2}>Nº TURNOS ACTUALES</th>
                            {Object.keys(cellLaborDays).map((value, index) => {
                                let T = 0

                                for (let dict of cellSettings) {
                                    if (dict.CELULA.toString() === selectedCell.toString()){
                                        T = dict.N_TURNOS_ACT

                                    }
                                }
                                return (
                                    <td key={index}>{T.toFixed(2)}
                                    </td>
                                )
                            })}
                            <th>{nOperarios[selectedCell].originalValue}</th>
                            <td colSpan={4} className={"secondary-table-right-filler"}></td>
                        </tr>
                        <tr>
                            <th colSpan={2}>Nº TURNOS NECESARIOS</th>
                            {Object.keys(cellLaborDays).map((value, index) => {
                                // obtener piezas producidas en el mes
                                let laborDays = cellLaborDays[value]
                                let references = cellMasterTable.map(dict => dict.ReferenciaSAP)
                                let totalHrsSTD = 0
                                for (let dict of ordersTable) {
                                    if (dict.FiscalMonth === value && references.includes(dict["Reference"])) {
                                        let ref = dict["Reference"]
                                        let productionPerc = masterTable.filter(dict3=>dict3.Celula.toString() === selectedCell.toString() && dict3.ReferenciaSAP.toString() === ref.toString())[0]
                                        if (productionPerc === undefined) {productionPerc = 0}
                                        else {productionPerc = productionPerc["Porcentaje de Pedidos"]}
                                        let hrsSTD = cellMasterTable.filter(dict2 => dict2.ReferenciaSAP === dict["Reference"])[0]["HorasSTD"]
                                        totalHrsSTD += dict.Qty * productionPerc * hrsSTD/100
                                    }
                                }
                                totalHrsSTD = totalHrsSTD/productividadCell
                                let nroOpNecesarios = (totalHrsSTD)/(8*laborDays*(1-absentismoCell))
                                let style = {background: nroOpNecesarios > nOperarios[selectedCell][value] ? "rgba(255,0,0,0.67)" : "rgba(48,255,144,0.67)"}
                                return (
                                    <td key={index} style={style}>{nroOpNecesarios.toFixed(2)}</td>
                                )
                            })}
                            {totalNOpNec()}
                            <td colSpan={4} className={"secondary-table-right-filler"}></td>
                        </tr>
                        </tbody>
                    </Table>
                </div>
            </div>
        )
    }

}

export default CargasMaquinaWindow