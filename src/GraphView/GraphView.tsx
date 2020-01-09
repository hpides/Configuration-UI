import React from 'react'
import './GraphView.css'
import NodeAdder from './NodeAdder';
import Inspector from './Inspector';
import Node from './Nodes/Node';
import DataGeneration from './Nodes/DataGeneration';
import Request from './Nodes/Request';
import Delay from './Nodes/Delay';
import Edge from './Edge';
import NodeConfig from './Nodes/NodeConfig';

interface Props {}

interface State {
    nodes: JSX.Element[],
    edges: {startNode: Node, endNode: Node}[],
    connecting: boolean,
    connStartNode: any,
    connEndNode: any,
    activeNodeConfig: any
}

class GraphView extends React.Component<Props, State> {
    constructor(props: any) {
        super(props);

        this.state = {
            nodes: [],
            edges: [],
            connecting: false,
            connStartNode: null,
            connEndNode: null,
            activeNodeConfig: null
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

    handleNodeDragged = (draggedNode: Node) => {
        this.forceUpdate();
    }

    handleNodeSelected = (node: Node) => {
        this.deselectAllNodes();
        node.select();
        this.setState({activeNodeConfig: node.props.nodeConfig})
    }

    handleGraphClicked = () => {
        this.deselectAllNodes();
    }

    deselectAllNodes() {
        this.setState({activeNodeConfig: null});
        for (let i=0; i < this.state.nodes.length;i++) {
            let node = this.state.nodes[i];
            
            console.log(node.type);
        }
    }

    addNode = (type: String) => {
        var nodes = this.state.nodes;

        let newNode;
        let nodeConfig = new NodeConfig();
        switch(type) {
            case "data_generation":
                nodeConfig.setName("Data Generation");
                newNode = <DataGeneration
                    handleConnMouseDown={this.startConnecting}
                    handleMouseEnter={this.nodeMouseEnter}
                    handleMouseLeave={this.nodeMouseLeave}
                    handleNodeDragged={this.handleNodeDragged}
                    handleNodeSelected={this.handleNodeSelected}
                    nodeConfig={nodeConfig}
                />;
                break;
            case "request":
                nodeConfig.setName("Request");
                newNode = <Request
                    handleConnMouseDown={this.startConnecting}
                    handleMouseEnter={this.nodeMouseEnter}
                    handleMouseLeave={this.nodeMouseLeave}
                    handleNodeDragged={this.handleNodeDragged}
                    handleNodeSelected={this.handleNodeSelected}
                    nodeConfig={nodeConfig}
                />;
                break;
            case "delay":
                nodeConfig.setName("Delay");
                newNode = <Delay
                    handleConnMouseDown={this.startConnecting}
                    handleMouseEnter={this.nodeMouseEnter}
                    handleMouseLeave={this.nodeMouseLeave}
                    handleNodeDragged={this.handleNodeDragged}
                    handleNodeSelected={this.handleNodeSelected}
                    nodeConfig={nodeConfig}
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
        let inspector;
        if (this.state.activeNodeConfig) {
            inspector = <Inspector
                            activeConfig={this.state.activeNodeConfig}
                        />;
        }
        return (
            <div id="graphview" onMouseUp={this.handleMouseUp}>
                <div className="container">
                    <div className="graph" onClick={this.handleGraphClicked}>
                        <svg>
                            {this.renderEdges()}
                        </svg>
                        <div
                            className="nodes-container"
                        >
                            {this.state.nodes}
                        </div>
                    </div>
                </div>
                <NodeAdder onAddNode={this.addNode}/>
                {inspector}
            </div>
        );
    }
}

export default GraphView;