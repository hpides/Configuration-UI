import React from 'react';
import Node from './Nodes/Node';

interface Props {
    startNode: Node,
    endNode: Node
}

interface State {
}

class Edge extends React.Component<Props, State> {
    constructor(props: any) {
        super(props);
    }

    render() {
        let startNodePosition = this.props.startNode.getPosition();
        let endNodePosition = this.props.endNode.getPosition();
        let x1 = startNodePosition.x+100;
        let y1 = startNodePosition.y+15;
        let x2 = endNodePosition.x;
        let y2 = endNodePosition.y+15;
        return (
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="black"/>
        );
    }
}

export default Edge;