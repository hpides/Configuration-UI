import React from 'react';
import './Node.css';
import Draggable from 'react-draggable';
import NodeConfig from './NodeConfig';

export type Point = {x: number, y: number};

interface Props {
    handleConnMouseDown: (node: Node) => void,
    handleMouseEnter: (node: Node) => void,
    handleMouseLeave: () => void,
    handleNodeDragged: (draggedNode: Node) => void,
    handleNodeSelected: (node: Node) => void,
    nodeConfig: NodeConfig,
}

interface State {
    origin: Point,
    deltaPosition: Point,
    selected: boolean,
}

class Node extends React.Component<Props, State> {
    constructor(props: any) {
        super(props);

        this.state = {
            origin: {x: 0, y: 0},
            deltaPosition: {x: 0, y: 0},
            selected: false,
        }
    }

    getPosition() {
        return this.state.deltaPosition;
    }

    handleDrag = (e: any, ui: any) => {
        const {x, y} = this.state.deltaPosition;
        this.setState({
            deltaPosition: {
                x: x + ui.deltaX,
                y: y + ui.deltaY,
            }
        });
        this.props.handleNodeDragged(this);
    }

    handleMouseEnter = () => {
        this.props.handleMouseEnter(this);
    }

    handleConnMouseDown = () => {
        this.props.handleConnMouseDown(this);
    }

    handleClick = (e: React.MouseEvent) => {
        this.props.handleNodeSelected(this);
        e.stopPropagation();
    }

    select() {
        this.setState({selected: true});
    }

    deselect() {
        this.setState({selected: false});
    }

    renderContent() {
        let title = this.props.nodeConfig.getAttributes().name;
        let attributes: JSX.Element[] = [];

        let conf = this.props.nodeConfig;
        for (let i = 0; i < conf.getKeys().length; i++) {
            let key = conf.getKeys()[i];
            attributes.push(
                <tr>
                    <td>{key}:</td>
                    <td>{conf.getAttribute(key)}</td>
                </tr>
            )
        }
        return (
            <div className="node-content">
                <h4>{title}</h4>
                <table className="node-attributes">
                    {attributes} 
                </table>           
            </div>
        );
    }

    render() {
        let style = {
            left: this.state.origin.x,
            top: this.state.origin.y
        }
        let content = this.renderContent();
        let selected: String = this.state.selected ? " selected" : "";
        return (
            <Draggable onDrag={this.handleDrag} cancel=".conn">
                <div
                    onMouseEnter={this.handleMouseEnter}
                    onMouseLeave={this.props.handleMouseLeave}
                    onClick={this.handleClick}
                    className={"node" + selected}
                    style={style}
                >
                    <div className="conn conn-in"></div>
                    <div onMouseDown={this.handleConnMouseDown} className="conn conn-out"></div>

                    {content}
                </div>
            </Draggable>
        );
    }
}

export default Node;