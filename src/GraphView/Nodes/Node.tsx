import React from 'react';
import './Node.css';
import Draggable from 'react-draggable';

export type Point = {x: number, y: number};

interface Props {
    handleConnMouseDown: (node: Node) => void,
    handleMouseEnter: (node: Node) => void,
    handleMouseLeave: () => void,
    handleNodeDragged: (draggedNode: Node) => void,
}

interface State {
    origin: Point,
    deltaPosition: Point
}

abstract class Node extends React.Component<Props, State> {
    constructor(props: any) {
        super(props);

        this.state = {
            origin: {x: 0, y: 0},
            deltaPosition: {x: 0, y: 0},
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

    abstract renderContent(): JSX.Element;

    render() {
        let style = {
            left: this.state.origin.x,
            top: this.state.origin.y
        }
        let content = this.renderContent();
        return (
            <Draggable onDrag={this.handleDrag} cancel=".conn">
                <div
                    onMouseEnter={this.handleMouseEnter}
                    onMouseLeave={this.props.handleMouseLeave}
                    className="node"
                    style={style}
                >
                    <div className="conn conn-in"></div>
                    <div onMouseDown={this.handleConnMouseDown} className="conn conn-out"></div>

                    <div className="node-content">
                        {content}
                    </div>
                </div>
            </Draggable>
        );
    }
}

export default Node;