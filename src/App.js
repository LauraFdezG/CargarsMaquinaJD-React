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
import RoleWindow from "./components/RoleWindow/RoleWindow";
import ResumenParadasWindow from "./components/CalendarWindow/ResumenParadasWindow";
import InicioSesionWindow from "./components/InicioSesionWindow/InicioSesionWindow";
import HrsWindow from "./components/ConfigurationWindow/HrsWindow";
import React from 'react';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route exact path="/reference_settings" element={<ConfigurationTable/>}/>
                <Route path={"/calendar"} element={<CalendarWindow/>}/>
                <Route path={"/daily_calendar"} element={<DailyCalendarWindow/>}/>
                <Route path={"/resumen_paradas"} element={<ResumenParadasWindow/>}/>
                <Route path={"/monthly_calendar"} element={<MonthlyCalendarWindow/>}/>
                <Route path={"/cargas_maquina"} element={<CargasMaquinaWindow/>}/>
                <Route path={"/hrs_std"} element={<HrsWindow/>}/>
                <Route path={"/"} element={<InicioSesionWindow/>}/>
                <Route path={"/error"} element={<ErrorWindow/>} />
                <Route path={"/cell_settings"} element={<CellSettingsWindow/>}/>
                <Route path={"/resumen_carga"} element={<ResumenCargaWindow/>}/>
                <Route path={"/roles"} element={<RoleWindow/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App;
