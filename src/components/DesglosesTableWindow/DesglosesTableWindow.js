import "./DesglosesTableWindow.css"
import NavBar from "../NavBar";
import LoadingWindow from "../LoadingWindow";

const DesglosesTableWindow = (props) => {
    return (
        <div>
            <NavBar title={"Cargas de Maquina"}/>
            <LoadingWindow/>
        </div>
    )
}

export default DesglosesTableWindow