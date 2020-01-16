import React from 'react'
import './Inspector.css'
import { Node } from './Nodes/Node';

interface Props {
    onValueChanged: (key: string, value: string) => void;
    node: Node,
}

interface State {}

class Inspector extends React.Component<Props, State> {

    inputChanged = (event: React.FormEvent<HTMLInputElement>) => {
        this.props.onValueChanged(event.currentTarget.name, event.currentTarget.value);
        /*let key = event.currentTarget.name;
        let value = event.currentTarget.value;

        this.props.node.setAttribute(key, value);

        console.log(this.props.node.getAttributes());*/
    }

    render() {
        let node = this.props.node;
        let inputs: JSX.Element[] = []

        for (let i = 0; i < node.getKeys().length; i++) {
            let key = node.getKeys()[i];
            let label = <label>
                {key}
            </label>
            let input = <input
                type="text"
                name={key}
                value={node.getAttribute(key)}
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