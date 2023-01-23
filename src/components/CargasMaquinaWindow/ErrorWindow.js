import NavBar from "../NavBar";
import "./ErrorWindow.css"

const ErrorWindow = (props) => {
    return (
        <div>
            <NavBar title={"Cargas de Maquina"}/>
            <div className={'error-message'}>
                <h1>HA OCURRIDO UN ERROR</h1>
            </div>
        </div>
    )
}

export default ErrorWindow