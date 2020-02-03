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
                    name="DATA_GENERATION"
                    onClick={this.onAddNode}
                >Generate Data</button>
                <button
                    name="DATA_LOAD"
                    onClick={this.onAddNode}
                >Load data</button>
                <button
                    name="REQUEST"
                    onClick={this.onAddNode}
                >Request</button>
                <button
                    name="DELAY"
                    onClick={this.onAddNode}
                >Delay</button>
                <button
                    name="WARMUP_END"
                    onClick={this.onAddNode}
                >Warmup End</button>
            </div>
        );
    }
}

export default NodeAdder;