import {useState} from "react";
import DatePicker from "react-widgets/DatePicker";


const DateFilter = (props) => {
    const [startDate, setstartDate] = useState(props.initDate)
    const [lastDate, setlastDate] = useState(props.lastDate)

    const handleStarDateChanged = (date) => {
        setstartDate(date)
        props.setFirstDate(date)
    }

    const handleLastDateChanged = (date) => {
        setlastDate(date)
        props.setLastDate(date)
    }

    return (
        <div className={"date-picker-filter-container"}>
            <div className={"date-picker-filter"}>
                <h6>Inicio: </h6>
                <DatePicker
                    value={startDate}
                    onChange={handleStarDateChanged}
                    min={props.initDate}
                    max={props.maxDate.addDays(1)}
                    valueFormat={{ month: "numeric", year: "numeric" }}
                    calendarProps={{ views: ["year", "decade", "century"] }}
                />
            </div>
            <div className={"date-picker-filter"}>
                <h6>Fin: </h6>
                <DatePicker
                    value={lastDate}
                    onChange={handleLastDateChanged}
                    min={props.initDate}
                    max={props.maxDate.addDays(1)}
                    valueFormat={{ month: "numeric", year: "numeric" }}
                    calendarProps={{ views: ["year", "decade", "century"] }}
                />
            </div>
        </div>
    )
}

export default DateFilter