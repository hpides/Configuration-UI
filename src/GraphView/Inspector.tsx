import React from 'react'
import './Inspector.css'
import { Node } from './Nodes/Node';
import { DataGenerationNode } from './Nodes/DataGenerationNode';
import { GeneratorAdder } from './Inspector/GeneratorAdder';
import {GeneratorConfig} from './Inspector/GeneratorConfig';
import { RequestNode } from './Nodes/RequestNode';
import { AuthAdder } from './Inspector/AuthAdder';

interface Props {
    onValueChanged: (key: string, value: string) => void;
    node: Node,
}

interface State {
    addingGenerator: boolean,
    addingAuth: boolean
}

interface IBasicAuth {
    user: string;
    password: string;
}

export class Inspector extends React.Component<Props, State> {
    constructor(props: any) {
        super(props);

        this.state = {
            addingGenerator: false,
            addingAuth: false,
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

        //node.dataToGenerate[name] = genConfig;
        node.addData(name, genConfig);

        this.setState({addingGenerator: false});
    }

    handleCancelGeneratorDialog = () => {
        this.setState({addingGenerator: false});
    }

    addAuth = () => {
        this.setState({addingAuth: true});
    }

    handleAddAuthDialog = (user: string, password: string) => {
        if (!(this.props.node instanceof RequestNode)) {
            return;
        }

        let node: RequestNode = this.props.node;

        node.setAttribute("basicAuth", {
            user: user,
            password: password,
        } as IBasicAuth);

        this.setState({addingAuth: false});
    }

    handleCancelAuthDialog = () => {
        this.setState({addingAuth: false});
    }

    renderTable() {
        if (!(this.props.node instanceof DataGenerationNode)) {
            return;
        }
        let node: DataGenerationNode = this.props.node;

        let rows: JSX.Element[] = [];

        let keys = Array.from(node.dataToGenerate.value.keys());

        for (let i = 0; i < keys.length; i++) {
            //react needs a key element for every tr
            rows.push(
                <tr  key={i}>
                    <td>{keys[i]}</td>
                    <td >{node.dataToGenerate.value.get(keys[i])!.getTypeString()}</td>
                </tr>
            )
        }

        return (
            <div className="data-generation-table">
                <table>
                    <tbody>
                    <tr>
                        <th>Key</th>
                        <th>Generator</th>
                    </tr>
                    {rows}
                    </tbody>
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
            let label = <label key={key}>
                {key}
            </label>

            if (key === "basicAuth") {

                let buttonString = "Add Auth";
                let authObject = node.getAttribute(key);
                if (authObject) {
                    buttonString = authObject["user"] + ":" + authObject["password"];
                }
                let authButton = <button key={i}
                    onClick={this.addAuth}
                >{buttonString}</button>;
                inputs.push(label);
                inputs.push(authButton);
            //users should not enter IDs or dataToGenerate, this is handled in the background
            } else if(!(key === "id" || key === "dataToGenerate")){

                let input = <input key={i}
                    type="text"
                    name={key}
                    value={node.getAttribute(key)}
                    onChange={this.inputChanged}
                />
                inputs.push(label);
                inputs.push(input);
            
            }
        }

        let table = this.renderTable();

        let generatorAdder;
        if (this.state.addingGenerator) {
            generatorAdder = <GeneratorAdder
                onAdd={this.handleAddGeneratorDialog}
                onCancel={this.handleCancelGeneratorDialog}
            />
        }

        let authAdder;
        if (this.state.addingAuth) {
            authAdder = <AuthAdder
                onAdd={this.handleAddAuthDialog}
                onCancel={this.handleCancelAuthDialog}
                auth={this.props.node.getAttribute("basicAuth")}
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
                {authAdder}
            </div>
        );
    }
}