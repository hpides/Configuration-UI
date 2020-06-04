import React from "react";
import "./NodeAdder.css";

interface IProps {
    onAddNode: (type: string) => void;
}

class NodeAdder extends React.Component<IProps, {}> {

    static nodeTypes = [
        {key: "DATA_GENERATION", title: "Generate Data"},
        {key: "REQUEST", title: "Request"},
        {key: "DELAY", title: "Delay"},
        {key: "WARMUP_END", title: "Warmup End"},
        {key: "ASSIGNMENT", title: "Assignment"}
    ];

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
        let buttons: JSX.Element[] = [];
        NodeAdder.nodeTypes.forEach((type) => {
            buttons.push(
                <button
                    name={type.key}
                    draggable={true}
                    onDragStart={this.handleDragStart}
                    onClick={this.onAddNode}
                >{type.title}</button>
            );
        });
        
        return (
            <div className="nodeadder">
                {buttons}
            </div>
        );
    }
}

export default NodeAdder;
