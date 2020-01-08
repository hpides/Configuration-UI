import React from 'react';
import './Node.css';
import Node from './Node';

export type Point = {x: number, y: number};

class DataGeneration extends Node {

    renderContent() {
        return(
            <h4>Data Generation</h4>
        )
    }

}

export default DataGeneration;