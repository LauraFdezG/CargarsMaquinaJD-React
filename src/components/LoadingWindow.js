import {Spinner} from "react-bootstrap";
import React from 'react';
import "./LoadingWindow.css"

const LoadingWindow = () => {
    return (
        <div className={'loading-window'}>
            <h1>Loading</h1>
            <Spinner animation="grow" />
        </div>
    )
}

export default LoadingWindow