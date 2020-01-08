import React from 'react'
import './GraphView.css'
import NodeAdder from './NodeAdder';
import Node from './Nodes/Node';
import DataGeneration from './Nodes/DataGeneration';
import Request from './Nodes/Request';
import Delay from './Nodes/Delay';
import Edge from './Edge';

interface Props {}

interface State {
    nodes: JSX.Element[],
    edges: {startNode: Node, endNode: Node}[],
    connecting: boolean,
    connStartNode: any,
    connEndNode: any
}

class GraphView extends React.Component<Props, State> {
    constructor(props: any) {
        super(props);

        this.state = {
            nodes: [],
            edges: [],
            connecting: false,
            connStartNode: null,
            connEndNode: null
        }
    }

    startConnecting = (startNode: Node) => {
        this.setState({
            connecting: true,
            connStartNode: startNode
        });
    }

    nodeMouseEnter = (enteredNode: Node) => {
        if (!this.state.connecting) {
            return;
        }

        this.setState({connEndNode: enteredNode});
    }

    nodeMouseLeave = () => {
        if (!this.state.connecting) {
            return;
        }

        this.setState({connEndNode: null});
    }

    handleMouseUp = () => {
        if (this.state.connStartNode && this.state.connEndNode) {
            var edges = this.state.edges;
            edges.push({
                startNode: this.state.connStartNode,
                endNode: this.state.connEndNode
            });
            this.setState({
                edges: edges,
                connStartNode: null,
                connEndNode: null
            });
        }
    }

    handleNodeDragged = (graddedNode: Node) => {
        this.forceUpdate();
    }

    addNode = (type: String) => {
        var nodes = this.state.nodes;

        let newNode;
        switch(type) {
            case "data_generation":
                newNode = <DataGeneration
                    handleConnMouseDown={this.startConnecting}
                    handleMouseEnter={this.nodeMouseEnter}
                    handleMouseLeave={this.nodeMouseLeave}
                    handleNodeDragged={this.handleNodeDragged}
                />;
                break;
            case "request":
                newNode = <Request
                    handleConnMouseDown={this.startConnecting}
                    handleMouseEnter={this.nodeMouseEnter}
                    handleMouseLeave={this.nodeMouseLeave}
                    handleNodeDragged={this.handleNodeDragged}
                />;
                break;
            case "delay":
                newNode = <Delay
                    handleConnMouseDown={this.startConnecting}
                    handleMouseEnter={this.nodeMouseEnter}
                    handleMouseLeave={this.nodeMouseLeave}
                    handleNodeDragged={this.handleNodeDragged}
                />;
                break;
            default:
                console.log("ERROR: Node type not supported: ", type);
                return;
        }
        nodes.push(newNode);
        this.setState({nodes: nodes});
    }

    renderEdge(i: number) {
        let startNodePosition = this.state.edges[i].startNode.getPosition();
        let endNodePosition = this.state.edges[i].endNode.getPosition();
        return (
            <Edge
                startNodePosition={startNodePosition}
                endNodePosition={endNodePosition}
            />
        );
    }

    renderEdges = () => {
        let edges = []

        for (let i=0; i < this.state.edges.length; i++) {
            edges.push(this.renderEdge(i));
        }

        return edges;
    }

    render() {
        return (
            <div id="graphview" onMouseUp={this.handleMouseUp}>
                <div className="container">
                    <div className="graph">
                        <svg>
                            {this.renderEdges()}
                        </svg>
                        <div className="nodes-container">
                            {this.state.nodes}
                        </div>
                    </div>
                </div>
                <NodeAdder onAddNode={this.addNode}/>
            </div>
        );
    }
}

export default GraphView;