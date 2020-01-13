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
import DelayConfig from './Nodes/DelayConfig';
import DataGenerationConfig from './Nodes/DataGenerationConfig';
import RequestConfig from './Nodes/RequestConfig';

interface Props {}

interface State {
    nodes: {node: JSX.Element, ref: React.RefObject<Node>}[],
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

    handleInspectorValueChanged = (key: string, value: string) => {
        let conf: NodeConfig = this.state.activeNodeConfig;

        conf.setAttribute(key, value);

        this.setState({activeNodeConfig: conf});
    }

    deselectAllNodes() {
        this.setState({activeNodeConfig: null});
        for (let i=0; i < this.state.nodes.length;i++) {
            let node = this.state.nodes[i];
            if (node.ref.current) {
                node.ref.current.deselect();
            }
        }
    }

    addNode = (type: String) => {
        var nodes = this.state.nodes;

        let ref = React.createRef<Node>();

        let newNode;
        let nodeConfig: NodeConfig;

        switch(type) {
            case "data_generation":
                nodeConfig = new DataGenerationConfig();
                break;
            case "request":
                nodeConfig = new RequestConfig();
                break;
            case "delay":
                nodeConfig = new DelayConfig();
                break;
            default:
                console.error("Could not add note: undefined type ", type);
                return;
        }

        newNode = <Node
            handleConnMouseDown={this.startConnecting}
            handleMouseEnter={this.nodeMouseEnter}
            handleMouseLeave={this.nodeMouseLeave}
            handleNodeDragged={this.handleNodeDragged}
            handleNodeSelected={this.handleNodeSelected}
            nodeConfig={nodeConfig}
            ref={ref}
        />;
        
        nodes.push({node: newNode, ref: ref});
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
                            onValueChanged={this.handleInspectorValueChanged}
                        />;
        }
        let nodes: JSX.Element[] = [];
        for (let i=0; i<this.state.nodes.length; i++) {
            nodes.push(this.state.nodes[i].node);
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
                            {nodes}
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