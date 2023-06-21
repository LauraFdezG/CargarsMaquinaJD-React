import NavBar from "../NavBar";
import flaskAddress from "../Constants";
import {useEffect, useState} from "react";
import LoadingWindow from "../LoadingWindow";
import "./InicioSesionWindow.css"
import {Navigate, useNavigate} from "react-router-dom";

const InicioSesionWindow = () => {
    const [roles, setroles] = useState([])

    // obtener tabla con roles
    const getRoles = async () => {
        const msg = {
            method:"GET",
            headers: {
                "Content-Type":"application/json"
            }
        }
        fetch(`${flaskAddress}_get_roles`, msg)
            .then(response => response.json())
            .then(json => {
                json.map((dict, index) => {
                    dict.id = index
                    return (dict)
                })
                setroles(json)
                console.log(json)
            })
    }

    useEffect(() => {
        getRoles().then(r => r)
    }, [])

    const setUser = () => {
        let user = document.getElementById("input-user").value

        sessionStorage.setItem("user", "Desautorizado")

        for (let u of roles) {
            if (u.Usuario.toUpperCase() === user.toUpperCase()) {
                console.log(u.Rol)
                sessionStorage.setItem("user", u.Rol)
            }
        }
        // window.location.href = '/cargas_maquina'

        if (sessionStorage.getItem("user") === "Desautorizado") {
            document.getElementById("user-role").textContent = 'No está autorizado'
            document.getElementById("user-role").style.color = "red"
        }

        if (sessionStorage.getItem("user") === "Manufactura") {
            document.getElementById("user-role").textContent = 'Bienvenido Manufactura'
            document.getElementById("user-role").style.color = "black"
        }

        if (sessionStorage.getItem("user") === "Usuario") {
            document.getElementById("user-role").textContent = 'Bienvenido Usuario'
            document.getElementById("user-role").style.color = "black"
        }

        if (sessionStorage.getItem("user") === "Visualizar") {
            document.getElementById("user-role").textContent = 'Bienvenido Visualizar'
            document.getElementById("user-role").style.color = "black"
        }

        if (sessionStorage.getItem("user") === "Manager") {
            document.getElementById("user-role").textContent = 'Bienvenido Manager'
            document.getElementById("user-role").style.color = "black"
        }

        if (sessionStorage.getItem("user") === "Administrador") {
            document.getElementById("user-role").textContent = 'Bienvenido Administrador'
            document.getElementById("user-role").style.color = "black"
        }

    }

    if (roles.length === 0) {
        sessionStorage.setItem("user", "Desautorizado")
        return (
            <div>
                <NavBar title={'Inicio de Sesion'}/>
                <LoadingWindow/>
            </div>
        )
    }

    return (
        <div>
            <NavBar title={"Inicio de Sesion"}
            />
            <div className={"main-div"}>
                <div className={"body-div"}>
                    <div className={"box-div"}>
                        <div className={"title"}>
                            <h2>Cargas de Maquinas EYE</h2>
                        </div>
                        <text style={{color: "white"}} id={"user-role"}></text>
                        <div className={"login-div"}>
                            <input className={"input"} placeholder={"Usuario"} id={"input-user"}></input>
                            <br/>
                            <div className={"boton-div"}>
                                <button id={"boton-entrada"} className={"boton"} onClick={setUser}>Entrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InicioSesionWindow