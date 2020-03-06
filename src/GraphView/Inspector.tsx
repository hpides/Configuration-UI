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
import {ExistingConfigComponent} from "../ExistingConfig/existingConfigComponent";

interface IProps {
    onValueChanged: (key: string, value: string) => void;
    node: Node;
    model: DiagramModel;
    disableDeleteKey: () => void;
    enableDeleteKey: () => void;
    existingConfig: ExistingConfigComponent
}

interface IState {
    addingGenerator: boolean;
    addingAuth: boolean;
    addingAssertion: boolean;
    activeGenerator: {key: string, genConfig: GeneratorConfig} | null;
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

    private hasExistingGeneratorConfig():boolean {
        let ret = false;
        (this.props.node as DataGenerationNode).dataToGenerate.value.forEach((value) => {
            if(value.getTypeString() === "EXISTING"){
                ret = true;
            }
        });
        return ret;
    }

    /**
     * Add the given generator to the generators for the specified node.
     * The current backend implementation allows only one table per Data Generation, so this method makes sure that only one existing data generator and no
     * other data generators or only generators other than existing data generators are contained by this node.
     * Also, the ordering of the keys is preserved.
     * @param {string[]} keys keys to be associated with this generator
     * @param {GeneratorConfig} genConfig config that represents this generator
     */
    public handleAddGeneratorDialog = (keys: string[], genConfig: GeneratorConfig) => {
        if (!(this.props.node instanceof DataGenerationNode)) {
            return;
        }

        const node: DataGenerationNode = this.props.node;
        if(genConfig.getTypeString() === "EXISTING"){
            if(node.dataToGenerate.value.size !== 0){
                alert("A Data Generation node can ONLY have ONE existing data generator and no other generator!")
            }
            else{
                for(let key of keys) {
                    node.addData(key, genConfig)
                }
            }
        }
        else {
            if(!this.hasExistingGeneratorConfig()) {
                for (let key of keys) {
                    node.addData(key, genConfig)
                }
            }
            else{
                alert("A Data Generation node can ONLY have ONE existing data generator and no other generator!")
            }
        }
        if (this.state.activeGenerator) {
            for(let key of keys) {
                if (this.state.activeGenerator.key !== key) {
                    node.removeData(this.state.activeGenerator.key);
                }
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
                <tr key={i} data-key={keys[i]} onClick={this.editGenerator}>
                    <td>{keys[i]}</td>
                    <td>{node.dataToGenerate.value.get(keys[i])!.getTypeString()}</td>
                    <td style={{width: "6vw"}}><button
                        className="delete-data-btn"
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();

                        }}
                    >&times;</button>
                    </td>
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

            } else if (key === "assertions") {
                const buttonString = "Add Assertion";
                const assertionButton = <button key={i}
                                                onClick={this.addAssertion}
                >{buttonString}</button>;
                inputs.push(<div key={i + " label"}>{label} <br/></div>);
                if (node instanceof RequestNode) {
                    const request: RequestNode = node;
                    for (const assertion of request.getAttribute("assertions")) {
                        // one can assume assertion names are unique for a request
                        if (assertion instanceof ResponseCodeAssertion) {
                            inputs.push(
                                <div key={assertion.name}>
                                    <br/>
                                    <div>Response Code is {assertion.responseCode} ({assertion.name})</div>
                                </div>);
                        }
                        if (assertion instanceof ContentTypeAssertion) {
                            inputs.push(
                                <div key={assertion.name}>
                                    <br/>
                                    <div>Response Content Type is {assertion.contentType} ({assertion.name})</div>
                                </div>);
                        }
                        if (assertion instanceof ContentNotEmptyAssertion) {
                            inputs.push(
                                <div key={assertion.name}>
                                    <br/>
                                    <div>Response is not empty ({assertion.name})</div>
                                </div>);
                        }
                    }
                }
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
                generator={this.state.activeGenerator}
                existingConfig={this.props.existingConfig}
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
