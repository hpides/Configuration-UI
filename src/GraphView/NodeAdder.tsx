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
    handleDragStart = (event: React.DragEvent<HTMLButtonElement>) => {
        let name = event.currentTarget.getAttribute("name");
        if (name) {
            event.dataTransfer.setData('tdgt-node-type', name);
        }
    }
    render() {
        return (
            <div className="nodeadder">
                <button
                    draggable={true}
                    name="DATA_GENERATION"
                    onDragStart={this.handleDragStart}
                    onClick={this.onAddNode}
                >Generate Data</button>
                <button
                    draggable={true}
                    name="DATA_LOAD"
                    onDragStart={this.handleDragStart}
                    onClick={this.onAddNode}
                >Load data</button>
                <button
                    name="REQUEST"
                    draggable={true}
                    onDragStart={this.handleDragStart}
                    onClick={this.onAddNode}
                >Request</button>
                <button
                    name="DELAY"
                    draggable={true}
                    onDragStart={this.handleDragStart}
                    onClick={this.onAddNode}
                >Delay</button>
                <button
                    name="WARMUP_END"
                    draggable={true}
                    onDragStart={this.handleDragStart}
                    onClick={this.onAddNode}
                >Warmup End</button>
            </div>
        );
    }
}

export default NodeAdder;