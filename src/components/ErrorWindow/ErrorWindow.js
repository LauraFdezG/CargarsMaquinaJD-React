import NavBar from "../NavBar";
import flaskAddress from "../Constants";
import {useEffect, useState} from "react";
import LoadingWindow from "../LoadingWindow";
import React from 'react';

const ErrorWindow = () => {

    return (
        <div>
            <NavBar title={""}
            />
            <div className={"main-div"}>
                <h3>Usted no tiene permiso para acceder a esta pagina</h3>
            </div>
        </div>
    )
}

export default ErrorWindow