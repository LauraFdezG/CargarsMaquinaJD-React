import "./CargasMaquinaWindow.css"
import NavBar from "../NavBar";
import {Table} from "react-bootstrap";
import {useEffect, useState} from "react";
import flaskAddress from "../Constants";
import LoadingWindow from "../LoadingWindow";

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

const CargasMaquinaWindow = () => {
    const [productionTableHeaders, setproductionTableHeaders] = useState([])
    const [calendar, setcalendar] = useState([])
    const [selectedCell, setselectedCell] = useState("147")
    const [cellsList, setcellsList] = useState([])
    const [masterTable, setmasterTable] = useState([])
    const [cellMasterTable, setcellMasterTable] = useState([])
    const [fiscalCal, setfiscalCal] = useState([])
    const [ordersTable, setordersTable] = useState([])

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
                // console.log(json)
                console.log(json[0])
                setmasterTable(json)
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
                let orders = json
                for (let dict of orders) {
                    let date = new Date(dict["Fiscal Month"])
                    dict.FiscalMonth = `${monthDictionary[date.getMonth()]}-${date.getFullYear()-2000}`
                }
                setordersTable(orders)
            })
    }

    // descargar configuraciones, celulas, tabla maestra, tabla de ordenes
    useEffect(()=> {
        getFiscalCal().then(r => r)
        getCellsList().then(r => r)
        getmasterTable().then(r => r)
        getOrdersTable().then(r => r)
    }, [])

    // crear calendario para el rango de fechas despues de descargar el fiscal
    useEffect(()=> {
        getCalendar().then(r => r)
    }, [fiscalCal])

    // filtrar la tabla maestra para la celula que se esta visualizando
    useEffect(()=> {
        let table = [...masterTable]
        let filteredTable = table.filter(dict=>dict.Celula.toString() === selectedCell.toString())
        setcellMasterTable(filteredTable)
    }, [masterTable, selectedCell])

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

    // TODO arreglar los encabezdos de fechas (hablar con serrgio) y las cantidades no estan saliendo bien
    // piezas producidas por mes fiscal
    const partsProduced = (ref: string) => {
        const monthsList = [...new Set(calendar.map(dict=>`${monthDictionary[dict.FiscalMonth]}-${dict.FiscalYear-2000}`))]
        return (
            monthsList.map((month, index) => {
                let monthQty = 0
                for (let dict of ordersTable) {
                    if (dict.FiscalMonth === month && dict["Reference"] === ref) {
                        monthQty += dict.Qty
                    }
                }
                return (
                    <td>{monthQty}</td>
                )
            })
        )
    }

    // pantalla de carga
    if (calendar.length === 0 || masterTable.length === 0 || cellsList.length === 0 || fiscalCal.length === 0 || ordersTable.length === 0) {
        return (
            <div>
                <NavBar title={"Cargas de Maquina"}/>
                <LoadingWindow/>
            </div>
        )
    }

    return (
        <div>
            <NavBar title={"Cargas de Maquina"}/>
            <div className={"production-table-container"}>

                <Table striped bordered hover className={"production-table"} size={"sm"}>
                    <thead>
                        <tr style={{borderColor:"white"}}>
                            <th></th>
                            <th></th>
                            <th colSpan={19}>
                                <h2 className={'production-table-title'}>CARGAS DE MAQUINA EYE CELULA: {selectedCell}</h2>
                            </th>
                        </tr>
                        <tr style={{borderColor:"white"}}>
                            <th></th>
                            <th></th>
                            <th colSpan={19} style={{background:"#e3e3e3", color:"black"}}>
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
                                <tr>
                                    <td>
                                        {dict.ReferenciaSAP}
                                    </td>
                                    <td>
                                        {dict.HorasSTD}
                                    </td>
                                    {partsProduced(dict.ReferenciaSAP)}
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>
            </div>
        </div>
    )
}

export default CargasMaquinaWindow