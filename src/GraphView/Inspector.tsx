import {DiagramModel} from "@projectstorm/react-diagrams";
import React from "react";
import "./Inspector.css";
import { AuthAdder } from "./Inspector/AuthAdder";
import { AssertionAdder } from "./Inspector/AssertionAdder";
import { GeneratorAdder } from "./Inspector/GeneratorAdder";
import {GeneratorConfig} from "./Inspector/GeneratorConfig";
import { DataGenerationNode } from "./Nodes/DataGenerationNode";
import { Node } from "./Nodes/Node";
import { RequestNode } from "./Nodes/RequestNode";
import {AssertionConfig} from "./Inspector/AssertionConfig";
interface IProps {
    onValueChanged: (key: string, value: string) => void;
    node: Node;
    model: DiagramModel;
    disableDeleteKey: () => void;
    enableDeleteKey: () => void;
}

interface IState {
    addingGenerator: boolean;
    addingAuth: boolean;
    addingAssertion: boolean;
}

interface IBasicAuth {
    user: string;
    password: string;
}

export class Inspector extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props);

        this.state = {
            addingAuth: false,
            addingGenerator: false,
            addingAssertion: false
        };
    }

    public inputChanged = (event: React.FormEvent<HTMLInputElement>) => {
        this.props.onValueChanged(event.currentTarget.name, event.currentTarget.value);
    }

    public addGenerator = () => {
        this.setState({addingGenerator: true});
    }

    public handleAddGeneratorDialog = (name: string, genConfig: GeneratorConfig) => {
        if (!(this.props.node instanceof DataGenerationNode)) {
            return;
        }

        const node: DataGenerationNode = this.props.node;

        // node.dataToGenerate[name] = assertionConfig;
        node.addData(name, genConfig);

        this.setState({addingGenerator: false});
    }

    public handleCancelGeneratorDialog = () => {
        this.setState({addingGenerator: false});
    }

    public addAuth = () => {
        this.setState({addingAuth: true});
    }

    public handleAddAssertionDialog = (config: AssertionConfig) => {
        if (!(this.props.node instanceof RequestNode)) {
            return;
        }

        const node: RequestNode = this.props.node;

        // node.dataToGenerate[name] = assertionConfig;
        node.addAssertion(config);

        this.setState({addingAssertion: false});
    }

    public handleCancelAddAssertionDialogf = () => {
        this.setState({addingAssertion: false});
    }

    public addAssertion = () => {
        this.setState({addingAssertion: true});
    }

    public handleAddAuthDialog = (user: string, password: string) => {
        if (!(this.props.node instanceof RequestNode)) {
            return;
        }

        const node: RequestNode = this.props.node;

        node.setAttribute("basicAuth", {
            password,
            user,
        } as IBasicAuth);

        this.setState({addingAuth: false});
    }

    public handleCancelAuthDialog = () => {
        this.setState({addingAuth: false});
    }

    public renderTable() {
        if (!(this.props.node instanceof DataGenerationNode)) {
            return;
        }
        const node: DataGenerationNode = this.props.node;

        const rows: JSX.Element[] = [];

        const keys = Array.from(node.dataToGenerate.value.keys());

        for (let i = 0; i < keys.length; i++) {
            // react needs a key element for every tr
            rows.push(
                <tr  key={i}>
                    <td>{keys[i]}</td>
                    <td >{node.dataToGenerate.value.get(keys[i])!.getTypeString()}</td>
                </tr>,
            );
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

    public render() {
        const node = this.props.node;
        const inputs: JSX.Element[] = [];

        for (let i = 0; i < node.getKeys().length; i++) {
            const key:string = node.getKeys()[i];
            let note = "";
            if (key === "requestParams" || key === "responseJSONObject") {
               note += " (comma separated)"
            }
            const label = <label key={key}>
                {key+note}
            </label>;

            if (key === "basicAuth") {

                let buttonString = "Add Auth";
                const authObject = node.getAttribute(key);
                if (authObject) {
                    buttonString = authObject.user + ":" + authObject.password;
                }
                const authButton = <button key={i}
                    onClick={this.addAuth}
                >{buttonString}</button>;
                inputs.push(label);
                inputs.push(authButton);
            // users should not enter IDs or dataToGenerate, this is handled in the background
            } else if (!(key === "id" || key === "dataToGenerate" || key === "assertions")) {
                const input = <input onFocus={this.props.disableDeleteKey} onBlur={this.props.enableDeleteKey} key={i}
                    type="text"
                    name={key}
                    value={node.getAttribute(key)}
                    onChange={this.inputChanged}
                />;
                inputs.push(label);
                inputs.push(input);

            } else if(key === "assertions"){
                let buttonString = "Add Assertion";
                const assertionButton = <button key={i}
                                           onClick={this.addAssertion}
                >{buttonString}</button>;
                inputs.push(label);
                inputs.push(assertionButton);
            }
        }

        const table = this.renderTable();

        let generatorAdder;
        if (this.state.addingGenerator) {
            generatorAdder = <GeneratorAdder
                enableDeleteKey={this.props.enableDeleteKey}
                disableDeleteKey={this.props.disableDeleteKey}
                onAdd={this.handleAddGeneratorDialog}
                onCancel={this.handleCancelGeneratorDialog}
            />;
        }

        let authAdder;
        if (this.state.addingAuth) {
            authAdder = <AuthAdder
                enableDeleteKey={this.props.enableDeleteKey}
                disableDeleteKey={this.props.disableDeleteKey}
                onAdd={this.handleAddAuthDialog}
                onCancel={this.handleCancelAuthDialog}
                auth={this.props.node.getAttribute("basicAuth")}
            />;
        }

        let assertionAdder;
        if (this.state.addingAssertion) {
            authAdder = <AssertionAdder
                enableDeleteKey={this.props.enableDeleteKey}
                disableDeleteKey={this.props.disableDeleteKey}
                onAdd={this.handleAddAssertionDialog}
                onCancel={this.handleCancelAuthDialog}
            />;
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
                {assertionAdder}
            </div>
        );
    }
}
