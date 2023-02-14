import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import "react-widgets/styles.css";
import ConfigurationTable from "./components/ConfigurationWindow/ConfigurationTable";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import CalendarWindow from "./components/CalendarWindow/CalendarWindow";
import DailyCalendarWindow from "./components/CalendarWindow/DailyCalendarWindow";
import MonthlyCalendarWindow from "./components/CalendarWindow/MonthlyCalendarWindow";
import CargasMaquinaWindow from "./components/CargasMaquinaWindow/CargasMaquinaWindow";
import ErrorWindow from "./components/CargasMaquinaWindow/ErrorWindow";
import CellSettingsWindow from "./components/CellSettingsWindow/CellSettingsWindow";
import ResumenCargaWindow from "./components/ResumenCargaWindow/ResumenCargaWindow";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route exact path="/reference_settings" element={<ConfigurationTable/>}/>
                <Route path={"/calendar"} element={<CalendarWindow/>}/>
                <Route path={"/daily_calendar"} element={<DailyCalendarWindow/>}/>
                <Route path={"/monthly_calendar"} element={<MonthlyCalendarWindow/>}/>
                <Route path={"/"} element={<CargasMaquinaWindow/>}/>
                <Route path={"/error"} element={<ErrorWindow/>} />
                <Route path={"/cell_settings"} element={<CellSettingsWindow/>}/>
                <Route path={"/resumen_carga"} element={<ResumenCargaWindow/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App;
