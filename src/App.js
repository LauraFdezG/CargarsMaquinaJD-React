import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import "react-widgets/styles.css";
import ConfigurationTable from "./components/ConfigurationWindow/ConfigurationTable";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import CalendarWindow from "./components/CalendarWindow/CalendarWindow";
function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route exact path="/" element={<ConfigurationTable/>}/> // cambiar despues por ref_settings
                <Route path={"/calendar"} element={<CalendarWindow/>}/>
            </Routes>
        </BrowserRouter>
    )

    return (
        <div className="App">
            <ConfigurationTable/>
        </div>
    );
}

export default App;
