import React from 'react'
import './GraphView.css'
import NodeAdder from './NodeAdder';
import Node from './Nodes/Node';
import Edge from './Edge';

interface Props {}

interface State {
    nodes: JSX.Element[],
    edges: JSX.Element[],
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
            let newEdge = <Edge
                startNode={this.state.connStartNode}
                endNode={this.state.connEndNode}
            />;
            edges.push(newEdge);
            this.setState({edges: edges});
        }
    }

    addNode = () => {
        var nodes = this.state.nodes;
        let newNode = <Node
            handleConnMouseDown={this.startConnecting}
            handleMouseEnter={this.nodeMouseEnter}
            handleMouseLeave={this.nodeMouseLeave}
        />;
        nodes.push(newNode);
        this.setState({nodes: nodes});
    }

    render() {
        return (
            <div id="graphview" onMouseUp={this.handleMouseUp}>
                <div className="container">
                    <div className="graph">
                        <svg>
                            {this.state.edges}
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