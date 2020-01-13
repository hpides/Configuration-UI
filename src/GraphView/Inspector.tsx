import React from 'react'
import './Inspector.css'
import NodeConfig from './Nodes/NodeConfig';

interface Props {
    activeConfig: NodeConfig;
    onValueChanged: (key: string, value: string) => void;
}

interface State {}

class Inspector extends React.Component<Props, State> {

    inputChanged = (event: React.FormEvent<HTMLInputElement>) => {
        this.props.onValueChanged(event.currentTarget.name, event.currentTarget.value);
    }

    render() {
        let conf = this.props.activeConfig;
        let inputs: JSX.Element[] = []

        for (let i = 0; i < conf.getKeys().length; i++) {
            let key = conf.getKeys()[i];
            let label = <label>
                {key}
            </label>
            let input = <input
                type="text"
                name={key}
                value={conf.getAttribute(key)}
                onChange={this.inputChanged}    
            />
            inputs.push(label);
            inputs.push(input);
        }
        return (
            <div className="inspector">
                <h3>Inspector</h3>
                <div className="inputs-container">
                    {inputs}
                </div>
            </div>
        );
    }
}

export default Inspector;