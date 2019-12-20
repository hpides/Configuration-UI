import React from 'react'
import './NodeAdder.css'

interface Props {
    onAddNode: () => void
}

interface State {}

class NodeAdder extends React.Component<Props, State> {
    render() {
        return (
            <div className="nodeadder">
                <button onClick={this.props.onAddNode}>Node</button>
                <button onClick={this.props.onAddNode}>Delay</button>
            </div>
        );
    }
}

export default NodeAdder;