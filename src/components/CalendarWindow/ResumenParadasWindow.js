import "./ResumenParadasWindow.css"
import {useEffect, useState} from "react";
import flaskAddress from "../Constants";
import {eventTypesColors} from "./EventTypeColors";
import NavBar from "../NavBar";
import LoadingWindow from "../LoadingWindow";
import {Table} from "react-bootstrap";
import AddPopUp from "../ResumenCargaWindow/AddPopUp";
import DateFilter from "../CargasMaquinaWindow/DateFilter";
import ErrorWindow from "../ErrorWindow/ErrorWindow";

const ResumenParadasWindow = () => {
    const [calendar, setcalendar] = useState([])
    const [calendarData, setcalendarData] = useState([])
    const [cellsCalendarData, setcellsCalendarData] = useState([])
    const [cellList, setcellList] = useState([])
    const [showAddCellPopUp, setshowAddCellPopUp] = useState(false)
    const [selectedCells, setselectedCells] = useState([])
    const [firstCalendarDate, setfirstCalendarDate] = useState(new Date().addDays(-1).addMonth(0))
    const [minCalendarDate, setminCalendarDate] = useState(firstCalendarDate)
    const [maxCalendarDate, setmaxCalendarDate] = useState(new Date().addDays(-1).addMonth(1).addYear(1).addMonth(6))
    const [lastCalendarDate, setlastCalendarDate] = useState(new Date().addDays(-1).addMonth(1).addYear(1).addMonth(6))


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
                let cells = []
                for (let dict of cellCal) {
                    if (cells.includes(dict.celula) === false) {
                        cells.push(dict.celula)
                    }

                    dict.startDate = new Date(dict.startDate)
                    dict.endDate = new Date(dict.endDate)
                    dict.color = eventTypesColors[dict.name]
                }
                setcellsCalendarData(cellCal)
                setcellList(cells)
            })
    }, [])

    // helps the modal of addcells to open and close
    const handleAddCell = () => {
        setshowAddCellPopUp(!showAddCellPopUp)
    }

    // brings the changes for the selected cells from the popup
    const addCells = (selCells) => {
        setselectedCells(selCells)
    }

    // cambiar filtro de ultima fecha del calendario
    const handleLastDayChanged = (date) => {
        setlastCalendarDate(date)
    }

    // cambiar filtro de primera fecha del calendario
    const handleFirstDayChanged = (date) => {
        setfirstCalendarDate(date)
    }

    // si el usuario no esta autorizado la aplicacion dara error
    if (sessionStorage.getItem("user") === "Desautorizado") {
        return (
            <ErrorWindow/>
        )
    }

    // mantener la pestaña de carga mientras se actualizan los datos
    if (calendarData.length*cellsCalendarData.length === 0) {
        return (
            <div>
                <NavBar title={'Calendario'} currentCalendar={'/resumen_paradas'}/>
                <LoadingWindow/>
            </div>
        )
    }

    return (
        <div>
            <NavBar title={'Calendario'} currentCalendar={'/resumen_paradas'}/>
            <div>
                <div className={"resumen-tabla-container"}>
                    <div className={"resumen-settings-container"} style={{position: "fixed", backgroundColor: "white"}}>
                        <AddPopUp
                            title={"Agregar Celulas"}
                            show={showAddCellPopUp}
                            close={handleAddCell}
                            inputList={cellList}
                            inputSelected={selectedCells}
                            addItems={addCells}
                        />
                        <button className={'resumen-settings-button'} onClick={handleAddCell}>Agregar Célula(s)</button>
                        <DateFilter
                            initDate={minCalendarDate}
                            lastDate={maxCalendarDate}
                            setLastDate={handleLastDayChanged}
                            setFirstDate={handleFirstDayChanged}
                            maxDate={maxCalendarDate}
                        />
                    </div>
                    <Table striped bordered hover className={"resumen-table"} size={"sm"} style={{marginTop: 75}}>
                        <thead>
                        <tr>
                            <th>Celula</th>
                            <th>Fecha Inicio</th>
                            <th>Fecha Fin</th>
                            <th>Descripcion</th>
                        </tr>
                        </thead>
                        <tbody>
                        {cellsCalendarData.map((data, key) => {
                            if (data.name === "Parada Programada") {
                                if (selectedCells.includes(data.celula)) {
                                    if (firstCalendarDate <= data.startDate && lastCalendarDate.addMonth(1) >= data.endDate) {
                                        return (
                                            <tr>
                                                <td>{data.celula}</td>
                                                <td>{data.startDate.toLocaleDateString()}</td>
                                                <td>{data.endDate.toLocaleDateString()}</td>
                                                <td>{data.description}</td>
                                            </tr>
                                        )
                                    }
                                }
                            }
                        })}
                        </tbody>
                    </Table>
                </div>
            </div>
        </div>
    )



}

export default ResumenParadasWindow