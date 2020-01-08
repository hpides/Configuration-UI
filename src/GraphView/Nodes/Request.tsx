import React from 'react';
import './Node.css';
import Node from './Node';

export type Point = {x: number, y: number};

class Request extends Node {

    renderContent() {
        return(
            <h4>Request</h4>
        )
    }
}

export default Request;