import React from 'react';
import './Node.css';
import Node from './Node';

export type Point = {x: number, y: number};

class Delay extends Node {

    renderContent() {
        return(
            <h4>Delay</h4>
        )
    }
}

export default Delay;