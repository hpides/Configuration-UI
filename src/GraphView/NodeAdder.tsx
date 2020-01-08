import React from 'react'
import './NodeAdder.css'

interface Props {
    onAddNode: (type: String) => void
}

interface State {}

class NodeAdder extends React.Component<Props, State> {

    onAddNode = (event: React.MouseEvent<HTMLButtonElement>) => {
        let name = event.currentTarget.getAttribute("name");
        if (name) {
            this.props.onAddNode(name);
        }
    }
    render() {
        return (
            <div className="nodeadder">
                <button
                    name="data_generation"
                    onClick={this.onAddNode}
                >Data Generation</button>
                <button
                    name="request"
                    onClick={this.onAddNode}
                >Request</button>
                <button
                    name="delay"
                    onClick={this.onAddNode}
                >Delay</button>
            </div>
        );
    }
}

export default NodeAdder;