import React from "react";
import "./NodeAdder.css";

interface IProps {
    onAddNode: (type: string) => void;
}

class NodeAdder extends React.Component<IProps, {}> {

    public onAddNode = (event: React.MouseEvent<HTMLButtonElement>) => {
        const name = event.currentTarget.getAttribute("name");
        if (name) {
            this.props.onAddNode(name);
        }
    }
    public handleDragStart = (event: React.DragEvent<HTMLButtonElement>) => {
        const name = event.currentTarget.getAttribute("name");
        if (name) {
            event.dataTransfer.setData("tdgt-node-type", name);
        }
    }
    public render() {
        return (
            <div className="nodeadder">
                <button
                    draggable={true}
                    name="DATA_GENERATION"
                    onDragStart={this.handleDragStart}
                    onClick={this.onAddNode}
                >Generate Data</button>
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
                <button
                    name="ASSIGNMENT"
                    draggable={true}
                    onDragStart={this.handleDragStart}
                    onClick={this.onAddNode}
                >Assignment</button>
            </div>
        );
    }
}

export default NodeAdder;
