import React from 'react'
import './Inspector.css'
import { Node } from './Nodes/Node';
import { DataGenerationNode } from './Nodes/DataGenerationNode';
import { GeneratorAdder } from './Inspector/GeneratorAdder';
import { timingSafeEqual } from 'crypto';
import { GeneratorConfig } from './Inspector/GeneratorConfig';

interface Props {
    onValueChanged: (key: string, value: string) => void;
    node: Node,
}

interface State {
    addingGenerator: boolean
}

export class Inspector extends React.Component<Props, State> {
    constructor(props: any) {
        super(props);

        this.state = {
            addingGenerator: false,
        }
    }

    inputChanged = (event: React.FormEvent<HTMLInputElement>) => {
        this.props.onValueChanged(event.currentTarget.name, event.currentTarget.value);
    }

    addGenerator = () => {
        this.setState({addingGenerator: true});
    }

    handleAddGeneratorDialog = (name: string, genConfig: GeneratorConfig) => {
        if (!(this.props.node instanceof DataGenerationNode)) {
            return;
        }

        let node: DataGenerationNode = this.props.node;

        //node.data_to_generate[name] = genConfig;
        node.addData(name, genConfig);

        this.setState({addingGenerator: false});
    }

    handleCancelGeneratorDialog = () => {
        this.setState({addingGenerator: false});
    }

    renderTable() {
        if (!(this.props.node instanceof DataGenerationNode)) {
            return;
        }
        let node: DataGenerationNode = this.props.node;

        let rows: JSX.Element[] = [];

        let keys = Object.keys(node.data_to_generate);

        for (let i = 0; i < keys.length; i++) {
            rows.push(
                <tr>
                    <td>{keys[i]}</td>
                    <td>{node.data_to_generate[keys[i]].getTypeString()}</td>
                </tr>
            )
        }

        return (
            <div className="data-generation-table">
                <table>
                    <tr>
                        <th>Key</th>
                        <th>Generator</th>
                    </tr>
                    {rows}
                </table>
                <button
                    onClick={this.addGenerator}
                >Add Data</button>
            </div>
        );
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

        let table = this.renderTable();

        let generatorAdder;
        if (this.state.addingGenerator) {
            generatorAdder = <GeneratorAdder
                onAdd={this.handleAddGeneratorDialog}
                onCancel={this.handleCancelGeneratorDialog}
            />
        }
        
        return (
            <div className="inspector">
                <h3>Inspector</h3>
                <div className="inputs-container">
                    {inputs}
                </div>
                {table}
                {generatorAdder}
            </div>
        );
    }
}