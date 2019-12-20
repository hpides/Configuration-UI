import React from 'react'
import './Node.css'

type Point = {x: number, y: number};

interface Props {
}

interface State {
    origin: Point
}

class Node extends React.Component<Props, State> {
    constructor(props: any) {
        super(props);

        this.state = {
            origin: {x: 10, y: 10}
        }
    }

    render() {
        let style = {
            left: this.state.origin.x,
            top: this.state.origin.y
        }
        return (
            <div className="node" style={style}></div>
        );
    }
}

export default Node;