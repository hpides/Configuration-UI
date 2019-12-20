import React from 'react'
import './GraphView.css'
import NodeAdder from './NodeAdder';
import Node from './Nodes/Node';

interface Props {}

interface State {
    nodes: JSX.Element[];
}

class GraphView extends React.Component<Props, State> {
    constructor(props: any) {
        super(props);

        this.state = {
            nodes: []
        }
    }

    addNode = () => {
        var nodes = this.state.nodes;
        let newNode = <Node />;
        nodes.push(newNode);
        this.setState({nodes: nodes});
    }

    render() {
        return (
            <div id="graphview">
                <div className="container">
                    <div className="graph">
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