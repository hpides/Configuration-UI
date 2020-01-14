import React from 'react'
import './GraphView.css'
import NodeAdder from './NodeAdder';
import Inspector from './Inspector';
import createEngine, {
    DefaultLinkModel, 
    DefaultNodeModel,
    DiagramModel, 
    DiagramEngine
} from '@projectstorm/react-diagrams';

import {CanvasWidget} from '@projectstorm/react-canvas-core';


interface Props {}

interface State {
}

class GraphView extends React.Component<Props, State> {
    engine: DiagramEngine;
    model: DiagramModel;

    constructor(props: any) {
        super(props);

        this.state = {
        }

        this.engine = createEngine();

        const node1 = new DefaultNodeModel({
            name: 'Node 1',
            color: 'rgb(0,192,255)',
        });
        node1.setPosition(100,100);
        let port1 = node1.addOutPort('Out');

        const node2 = new DefaultNodeModel({
            name: 'Node 2',
            color: 'rgb(0,192,255)',
        });
        node2.setPosition(300,300);
        let port2 = node2.addInPort('In');

        this.model = new DiagramModel();
        this.model.addAll(node1, node2);
        this.engine.setModel(this.model);
    }

    handleInspectorValueChanged = (key: string, value: string) => {
        
    }

    addNode = (type: String) => {

        let node = new DefaultNodeModel({
            name: type.toString(),
            color: 'rgb(0,192,255)'
        });
        let inPort = node.addInPort('In');
        let outPort = node.addOutPort('Out');
        node.setPosition(10,10);
        this.model.addNode(node);

        this.forceUpdate();
    }

    render() {
        return (
            <div id="graphview">
                <div className="container">
                    <CanvasWidget engine={this.engine}/>
                </div>
                <NodeAdder onAddNode={this.addNode}/>
            </div>
        );
    }
}

export default GraphView;