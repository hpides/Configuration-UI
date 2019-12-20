import React from 'react';
import './Node.css';
import Draggable from 'react-draggable';

type Point = {x: number, y: number};

interface Props {
}

interface State {
    origin: Point,
    dragging: boolean
}

class Node extends React.Component<Props, State> {
    constructor(props: any) {
        super(props);

        this.state = {
            origin: {x: 10, y: 10},
            dragging: false
        }
    }

    render() {
        let style = {
            left: this.state.origin.x,
            top: this.state.origin.y
        }
        return (
            <Draggable>
                <div className="node" style={style}></div>
            </Draggable>
        );
    }
}

export default Node;