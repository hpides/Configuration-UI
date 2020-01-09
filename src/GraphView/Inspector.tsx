import React from 'react'
import './Inspector.css'
import NodeConfig from './Nodes/NodeConfig';

interface Props {
    activeConfig: NodeConfig;
    onValueChanged: () => void;
}

interface State {}

class Inspector extends React.Component<Props, State> {

    inputChanged = (event: React.FormEvent<HTMLInputElement>) => {
        this.props.activeConfig.setName(event.currentTarget.value);
        this.props.onValueChanged();
    }

    render() {
        let conf = this.props.activeConfig;
        return (
            <div className="inspector">
                <h3>Inspector</h3>
                <input
                    type="text"
                    name="title"
                    value={conf.getName().toString()}
                    onChange={this.inputChanged}
                />
            </div>
        );
    }
}

export default Inspector;