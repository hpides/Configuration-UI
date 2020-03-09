import {DiagramModel} from "@projectstorm/react-diagrams";
import React from "react";
import "./Inspector.css";
import {AssertionAdder} from "./Inspector/AssertionAdder";
import {ContentNotEmptyAssertion, ContentTypeAssertion, ResponseCodeAssertion} from "./Inspector/AssertionConfig";
import {AssertionConfig} from "./Inspector/AssertionConfig";
import {AuthAdder} from "./Inspector/AuthAdder";
import {GeneratorAdder} from "./Inspector/GeneratorAdder";
import {GeneratorConfig} from "./Inspector/GeneratorConfig";
import {DataGenerationNode} from "./Nodes/DataGenerationNode";
import {Node} from "./Nodes/Node";
import {RequestNode} from "./Nodes/RequestNode";

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
    activeGenerator: {key: string, genConfig: GeneratorConfig} | null;
    activeAssertion: AssertionConfig | null;
}

interface IBasicAuth {
    user: string;
    password: string;
}

export class Inspector extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props);

        this.state = {
            activeGenerator: null,
            activeAssertion: null,
            addingAssertion: false,
            addingAuth: false,
            addingGenerator: false,
        };
    }

    public inputChanged = (event: React.FormEvent<HTMLInputElement>) => {
        this.props.onValueChanged(event.currentTarget.name, event.currentTarget.value);
    }

    public addGenerator = () => {
        this.setState({addingGenerator: true});
    }

    public editGenerator = (event: React.MouseEvent<HTMLTableRowElement>) => {
        if (!(this.props.node instanceof DataGenerationNode)) {
            return;
        }

        const node: DataGenerationNode = this.props.node;

        const key = event.currentTarget.getAttribute("data-key");
        if (!key) { return; }

        const gen = node.dataToGenerate.value.get(key);
        if (!gen) { return; }

        this.setState({
            activeGenerator: {key, genConfig: gen},
            addingGenerator: true,
        });
    }

    public deleteGenerator = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!(this.props.node instanceof DataGenerationNode)) {
            return;
        }

        const node: DataGenerationNode = this.props.node;

        const key = event.currentTarget.getAttribute("data-key");
        if (!key) { return; }

        node.removeData(key);
        this.forceUpdate();
    }

    public handleAddGeneratorDialog = (key: string, genConfig: GeneratorConfig) => {
        if (!(this.props.node instanceof DataGenerationNode)) {
            return;
        }

        const node: DataGenerationNode = this.props.node;

        node.addData(key, genConfig);

        if (this.state.activeGenerator) {
            if (this.state.activeGenerator.key !== key) {
                node.removeData(this.state.activeGenerator.key);
            }
        }

        this.setState({
            activeGenerator: null,
            addingGenerator: false,
        });
    }

    public handleCancelGeneratorDialog = () => {
        this.setState({
            activeGenerator: null,
            addingGenerator: false,
        });
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

    public handleCancelAssertionDialog = () => {
        this.setState({
            activeAssertion: null,
            addingAssertion: false,
        })
    }

    public handleCancelAddAssertionDialogf = () => {
        this.setState({addingAssertion: false});
    }

    public addAssertion = () => {
        this.setState({addingAssertion: true});
    }

    public editAssertion = (event: React.MouseEvent<HTMLTableRowElement>) => {
        if (!(this.props.node instanceof RequestNode)) {
            return;
        }

        const node: RequestNode = this.props.node;

        const index = event.currentTarget.getAttribute("data-index");
        if (!index) { return; }

        const assertion = node.getAttribute("assertions")[Number(index)]
        this.setState({
            activeAssertion: assertion,
            addingAssertion: true,
        });
    }

    public deleteAssertion = (event: React.MouseEvent<HTMLButtonElement>) => {

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
                <tr key={i} data-key={keys[i]} onClick={this.editGenerator}>
                    <td>{keys[i]}</td>
                    <td>{node.dataToGenerate.value.get(keys[i])!.getTypeString()}</td>
                    <button
                        className="delete-data-btn"
                        data-key={keys[i]}
                        onClick={this.deleteGenerator}
                    >&times;</button>
                </tr>,
            );
        }

        return (
            <div className="data-generation-table">
                <table>
                    <tbody>
                    <tr>
                        <th>Key</th>
                        <th colSpan={2}>Generator</th>
                    </tr>
                    {rows}
                    </tbody>
                </table>
                <button
                    onClick={this.addGenerator}
                >Add Data
                </button>
            </div>
        );
    }

    public renderAssertions() {
        if (!(this.props.node instanceof RequestNode)) {
            return;
        }
        const node: RequestNode = this.props.node;

        const rows: JSX.Element[] = [];

        const assertions = node.getAttribute("assertions");

        for (let i = 0; i < assertions.length; i++) {
            const assertion = assertions[i];
            let assertionText = "";
            if (assertion instanceof ResponseCodeAssertion) {
                assertionText = "Response Code is " + assertion.responseCode.toString();
            } else if (assertion instanceof ContentTypeAssertion) {
                assertionText = "Response Conent Type is " + assertion.contentType
            } else if (assertion instanceof ContentNotEmptyAssertion) {
                assertionText = "Response is not empty";
            }
            rows.push(
                <tr key={i} data-index={i} onClick={this.editAssertion}>
                    <td>{assertion.name}</td>
                    <td>{assertionText}</td>
                    <button
                        className="delete-data-btn"
                        data-index={i}
                        onClick={this.deleteAssertion}
                    >&times;</button>
                </tr>,
            );
        }

        return(
            <div className="data-generation-table">
                <table>
                    <tbody>
                        <tr>
                            <th>Name</th>
                            <th colSpan={2}>Assertion</th>
                        </tr>
                        {rows}
                    </tbody>
                </table>
                <button
                    onClick={this.addAssertion}
                >Add Assertion</button>
            </div>
        )
    }

    public render() {
        const node = this.props.node;
        const inputs: JSX.Element[] = [];

        for (let i = 0; i < node.getKeys().length; i++) {
            const key: string = node.getKeys()[i];
            let note = "";
            if (key === "requestParams" || key === "responseJSONObject") {
                note += " (comma separated)";
            }
            const label = <label key={key}>
                {key + note}
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

            }
        }

        const table = this.renderTable();
        const assertionsTable = this.renderAssertions();

        let generatorAdder;
        if (this.state.addingGenerator) {
            generatorAdder = <GeneratorAdder
                enableDeleteKey={this.props.enableDeleteKey}
                disableDeleteKey={this.props.disableDeleteKey}
                onAdd={this.handleAddGeneratorDialog}
                onCancel={this.handleCancelGeneratorDialog}
                generator={this.state.activeGenerator}
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
            assertionAdder = <AssertionAdder
                enableDeleteKey={this.props.enableDeleteKey}
                disableDeleteKey={this.props.disableDeleteKey}
                onAdd={this.handleAddAssertionDialog}
                onCancel={this.handleCancelAssertionDialog}
                assertion={this.state.activeAssertion}
            />;
        }

        return (
            <div className="inspector">
                <h3>Inspector</h3>
                <div className="inputs-container">
                    {inputs}
                </div>
                {table}
                {assertionsTable}
                {generatorAdder}
                {authAdder}
                {assertionAdder}
            </div>
        );
    }
}
