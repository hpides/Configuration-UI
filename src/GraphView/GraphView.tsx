import React from 'react'
import './GraphView.css'
import NodeAdder from './NodeAdder';
import createEngine, {
    DiagramModel, 
    DiagramEngine,
    DefaultNodeModelOptions
} from '@projectstorm/react-diagrams';

import {
    CanvasWidget,
    BaseEvent,
    BaseModelListener,
} from '@projectstorm/react-canvas-core';
import { Node } from './Nodes/Node';
import { StartNode } from './Nodes/StartNode';
import { DataGenerationNode } from './Nodes/DataGenerationNode';
import { RequestNode } from './Nodes/RequestNode';
import { DelayNode } from './Nodes/DelayNode';
import { Inspector } from './Inspector';


interface Props {}

interface State {
    nodes: Node[],
    startNode?: Node,
    selectedNode?: Node,
}

export class GraphView extends React.Component<Props, State> {
    engine: DiagramEngine;
    model: DiagramModel;

    constructor(props: any) {
        super(props);

        this.state = {
            nodes: [],
        }

        this.engine = createEngine();

        this.model = new DiagramModel();
        this.engine.setModel(this.model);
    }

    componentDidMount() {
        this.setState({startNode: this.addNode("START")});
    }

    handleSelectionChanged = (event: BaseEvent) => {
        let nodes = this.state.nodes;

        this.setState({selectedNode: undefined});

        nodes.forEach((node: Node) => {
            if (node.isSelected()) {
                this.setState({selectedNode: node});
                return;
            }
        })
    }

    addNode = (type: String) => {

        let node: Node;

        let nodeOptions: DefaultNodeModelOptions = {
            name: type.toString(),
            color: 'rgb(0,192,255)',
        }

        switch(type) {
            case "START":
                node = new StartNode(nodeOptions);
                break;
            case "DATA_GENERATION":
                node = new DataGenerationNode(nodeOptions);
                break;
            case "REQUEST":
                node = new RequestNode(nodeOptions);
                break;
            case "DELAY":
                node = new DelayNode(nodeOptions);
                break;
            default:
                console.error("Error adding node: unknown type ", type);
                return;
        }

        node.registerListener({
            selectionChanged: this.handleSelectionChanged
        });

        node.setPosition(10,10);

        let nodes = this.state.nodes;
        nodes.push(node);
        this.setState({nodes: nodes});

        this.model.addNode(node);

        this.forceUpdate();

        return node;
    }

    handleInspectorValueChanged = (key: string, value: string) => {
        let node = this.state.selectedNode;

        node?.setAttribute(key, value);

        this.setState({selectedNode: node});
    }

    render() {
        let inspector;
        if (this.state.selectedNode) {
            inspector = <Inspector
                onValueChanged={this.handleInspectorValueChanged}
                node={this.state.selectedNode}
            />
        }
        return (
            <div id="graphview">
                <div className="container">
                    <CanvasWidget engine={this.engine}/>
                </div>
                <NodeAdder onAddNode={this.addNode}/>
                {inspector}
            </div>
        );
    }
}