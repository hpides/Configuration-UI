import React from 'react';

interface Props {
    startNodePosition: {x: number, y: number},
    endNodePosition: {x: number, y: number}
}

interface State {}

class Edge extends React.Component<Props, State> {
    constructor(props: any) {
        super(props);
    }

    render() {
        let startNodePosition = this.props.startNodePosition;
        let endNodePosition = this.props.endNodePosition;
        let x1 = startNodePosition.x+150;
        let y1 = startNodePosition.y+16;
        let x2 = endNodePosition.x;
        let y2 = endNodePosition.y+16;
        return (
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="white"/>
        );
    }
}

export default Edge;