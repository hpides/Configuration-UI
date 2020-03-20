import {DiagramModel} from "@projectstorm/react-diagrams";
import React from "react";
import {ExistingConfigComponent} from "../ExistingConfig/existingConfigComponent";
import "./Inspector.css";
import {AssertionAdder} from "./Inspector/AssertionAdder";
import {ContentNotEmptyAssertion, ContentTypeAssertion, ResponseCodeAssertion} from "./Inspector/AssertionConfig";
import {AssertionConfig} from "./Inspector/AssertionConfig";
import {AuthAdder} from "./Inspector/AuthAdder";
import {GeneratorAdder} from "./Inspector/GeneratorAdder";
import {ExistingDataConfig, GeneratorConfig} from "./Inspector/GeneratorConfig";
import {DataGenerationNode} from "./Nodes/DataGenerationNode";
import {Node} from "./Nodes/Node";
import {RequestNode} from "./Nodes/RequestNode";

interface IProps {
    onValueChanged: (key: string, value: string) => void;
    node: Node;
    model: DiagramModel;
    disableDeleteKey: () => void;
    enableDeleteKey: () => void;
    existingConfig: ExistingConfigComponent;
}

interface IState {
    addingGenerator: boolean;
    addingAuth: boolean;
    addingAssertion: boolean;
    activeGenerator: {key: string, genConfig: GeneratorConfig} | null;
    activeAssertion: AssertionConfig | null;
    receiveCookies: any;
    sendCookies: any;
}

interface IBasicAuth {
    user: string;
    password: string;
}

export class Inspector extends React.Component<IProps, IState> {

    private receiveCookieKeys: HTMLInputElement[] = [];
    private receiveCookieValues: HTMLInputElement[] = [];
    private sendCookieKeys: HTMLInputElement[] = [];
    private sendCookieValues: HTMLInputElement[] = [];

    private tokenNames: HTMLInputElement[] = [];
    private tokenTargets: HTMLInputElement[] = [];
    private xpathStatements: HTMLInputElement[] = [];
    private xpathTargets: HTMLInputElement[] = [];
    constructor(props: any) {
        super(props);

        this.state = {
            activeAssertion: null,
            activeGenerator: null,
            addingAssertion: false,
            addingAuth: false,
            addingGenerator: false,
            receiveCookies: {},
            sendCookies: {},
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

    /**
     * Add the given generator to the generators for the specified node.
     * The current backend implementation allows only one table per Data Generation,
     * so this method makes sure that only one existing data generator and no
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
        if (genConfig.getTypeString() === "EXISTING") {
            if (node.dataToGenerate.value.size !== 0) {
                alert("A Data Generation node can ONLY have ONE existing data generator and no other generator!");
            } else {
                for (const key of keys) {
                    node.addData(key, genConfig);
                }
                // so the correct table name is used by the backend instead of a random one generated later on
                node.setAttribute("table", (genConfig as ExistingDataConfig).getAttribute("table"));
            }
        } else {
            if (!this.hasExistingGeneratorConfig()) {
                for (const key of keys) {
                    node.addData(key, genConfig);
                }
                // there might have been an ExistingDataConfig here before
                node.setAttribute("table", null);
            } else {
                alert("A Data Generation node can ONLY have ONE existing data generator and no other generator!");
            }
        }
        if (this.state.activeGenerator) {
            for (const key of keys) {
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

    public tableSelectionChanged = (event: React.FormEvent<HTMLSelectElement>) => {
        if (!(this.props.node instanceof DataGenerationNode)) {
            return;
        }
        const node: DataGenerationNode = this.props.node;

        const oldTable = node.getAttribute("table");
        const newTable: string = event.currentTarget.value;

        if (newTable === (oldTable || "GENERATE_NEW")) {
            return;
        } else if (newTable === "GENERATE_NEW") {
            node.clearData();
            node.setAttribute("table", null);
        } else {
            node.clearData();
            node.setAttribute("table", newTable);

            let wantedFields: string[] = [];
            this.props.existingConfig.state.uploadedFiles.forEach((file) => {
                file.tableMapping.forEach((fields, table) => {
                    if (table === newTable) {
                        wantedFields = fields;
                    }
                });
            });
            const exGenConfig = new ExistingDataConfig(this.props.disableDeleteKey, this.props.enableDeleteKey);
            exGenConfig.setAttribute("table", newTable);

            for (const field of wantedFields) {
                node.addData(field, exGenConfig);
            }
        }

        this.forceUpdate();
    }

    public handleAddAssertionDialog = (config: AssertionConfig) => {
        if (!(this.props.node instanceof RequestNode)) {
            return;
        }

        const node: RequestNode = this.props.node;

        node.addAssertion(config);

        this.setState({addingAssertion: false});
    }

    public handleCancelAssertionDialog = () => {
        this.setState({
            activeAssertion: null,
            addingAssertion: false,
        });
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

        const assertion = node.getAttribute("assertions")[Number(index)];
        this.setState({
            activeAssertion: assertion,
            addingAssertion: true,
        });
    }

    // tslint:disable-next-line
    public deleteAssertion = (event: React.MouseEvent<HTMLButtonElement>) => {};

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

        // show in order that is determined by data attribute
        const keys = node.getAttribute("data");

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

        let locked = "";
        if (node.getAttribute("table") !== null) {
            locked = " locked";
        }

        return (
            <div className={"data-generation-table" + locked}>
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
                assertionText = "Response Conent Type is " + assertion.contentType;
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

            } else if (key === "receiveCookies" || key === "sendCookies") {
                const description = (key === "receiveCookies") ? "Cookies to extract" : "Cookies to send";
                inputs.push(<label>{description}</label>);
                const cookies: any = node.getAttribute(key);

                const cookieTable =
                <table>
                    <tbody>
                    <tr><td>{(key === "receiveCookies") ? "Response Cookie" : "Token key"}</td><td>{(key === "receiveCookies") ? "Token key" : "Request Cookie"}</td></tr>
                        {Object.keys(cookies).map((cookie) =>
                            <tr id={cookie}>
                                <td>
                                    <input type="text" ref={(ref) => {
                                        if (ref) {
                                            if ((key === "receiveCookies")) {
                                                this.receiveCookieKeys.push(ref);
                                            } else {
                                                this.sendCookieKeys.push(ref);
                                            }
                                            ref.value = cookie;
                                        }
                                    }} onBlur={(e) => (key === "receiveCookies") ?
                                        this.updateReceiveCookies() : this.updateSendCookies()}
                                       onFocus={this.props.disableDeleteKey}/>
                                </td>
                                <td>
                                    <input type="text" ref={(ref) => {
                                        if (ref) {
                                            if ((key === "receiveCookies")) {
                                                this.receiveCookieValues.push(ref);
                                            } else {
                                                this.sendCookieValues.push(ref);
                                            }
                                            ref.value = node.getAttribute(key)[cookie];
                                        }
                                    }} onBlur={(e) => (key === "receiveCookies") ?
                                        this.updateReceiveCookies() : this.updateSendCookies()}
                                    onFocus={this.props.disableDeleteKey}/>
                                </td>
                            </tr>,
                        )}
                    </tbody>
                </table>;
                inputs.push(cookieTable);
                inputs.push(<button onClick={() => {
                    node.getAttribute(key)[""] = "";
                    // the above action does not trigger React to re-render although we need to here
                    this.forceUpdate();
                }}>Add Cookie</button>);
            } else if (key === "tokenNames") {
                inputs.push(<label>Hidden fields to extract</label>);
                const tokens: any = node.getAttribute(key);

                const cookieTable =
                <table>
                    <tbody>
                    <tr><td>Field name</td><td>Token key</td></tr>
                        {Object.keys(tokens).map((token) =>
                            <tr id={token}>
                                <td>
                                    <input type="text" ref={(ref) => {
                                        if (ref) {
                                            this.tokenNames.push(ref);
                                            ref.value = token;
                                        }
                                    }} onBlur={(e) => this.updateTokens()}
                                       onFocus={this.props.disableDeleteKey}/>
                                </td>
                                <td>
                                    <input type="text" ref={(ref) => {
                                        if (ref) {
                                            this.tokenTargets.push(ref);
                                            ref.value = node.getAttribute(key)[token];
                                        }
                                    }} onBlur={(e) => this.updateTokens()}
                                       onFocus={this.props.disableDeleteKey}/>
                                </td>
                            </tr>,
                        )}
                    </tbody>
                </table>;
                inputs.push(cookieTable);
                inputs.push(<button onClick={() => {
                    node.getAttribute(key)[""] = "";
                    // the above action does not trigger React to re-render although we need to here
                    this.forceUpdate();
                }}>Add hidden field</button>);
            } else if (key === "xpaths") {
                inputs.push(<label>Custom values from the page (XPATH)</label>);
                const xpaths: any = node.getAttribute(key);

                const xpathTable =
                <table>
                    <tbody>
                    <tr><td>XPATH statement</td><td>Token key</td></tr>
                        {Object.keys(xpaths).map((xpath) =>
                            <tr id={xpath}>
                                <td>
                                    <input type="text" ref={(ref) => {
                                        if (ref) {
                                            this.xpathStatements.push(ref);
                                            ref.value = xpath;
                                        }
                                    }} onBlur={(e) => this.updateXPaths()}
                                       onFocus={this.props.disableDeleteKey}/>
                                </td>
                                <td>
                                    <input type="text" ref={(ref) => {
                                        if (ref) {
                                            this.xpathTargets.push(ref);
                                            ref.value = node.getAttribute(key)[xpath];
                                        }
                                    }} onBlur={(e) => this.updateXPaths()}
                                       onFocus={this.props.disableDeleteKey}/>
                                </td>
                            </tr>,
                        )}
                    </tbody>
                </table>;
                inputs.push(xpathTable);
                inputs.push(<button onClick={() => {
                    node.getAttribute(key)[""] = "";
                    // the above action does not trigger React to re-render although we need to here
                    this.forceUpdate();
                }}>Add XPath expression</button>);
            } else if (key === "table") {
                // tablename has to be a selection box

                if (this.props.existingConfig.state.allTables.size === 0) {
                    continue;
                }

                const activeTable: string = node.getAttribute("table") || "GENERATE_NEW";

                const tables: JSX.Element[] = [];
                this.props.existingConfig.state.allTables.forEach((tableName) => {
                    tables.push(<option value={tableName}>{tableName}</option>);
                });

                const input = <select
                    name="table-select"
                    value={activeTable}
                    onChange={this.tableSelectionChanged}
                >
                    <option value="GENERATE_NEW">Generate New</option>
                    {tables}
                </select>;

                inputs.push(input);

                // users should not enter IDs or dataToGenerate, this is handled in the background
            } else if (!(key === "id" || key === "dataToGenerate" || key === "assertions" || key === "data")) {
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

    private updateReceiveCookies(): void {
        const cookies: any = {};
        for (let i = 0; i < this.receiveCookieKeys.length; i++) {
            cookies[this.receiveCookieKeys[i].value as string] = this.receiveCookieValues[i].value;
        }
        this.props.node.setAttribute("receiveCookies", cookies);
        // called in onBlur
        this.props.enableDeleteKey();
    }

    private updateSendCookies(): void {
        const cookies: any = {};
        for (let i = 0; i < this.sendCookieKeys.length; i++) {
            cookies[this.sendCookieKeys[i].value as string] = this.sendCookieValues[i].value;
        }
        this.props.node.setAttribute("sendCookies", cookies);
        // called in onBlur
        this.props.enableDeleteKey();
    }

    private updateTokens(): void {
        const tokens: any = {};
        for (let i = 0; i < this.tokenNames.length; i++) {
            tokens[this.tokenNames[i].value] = this.tokenTargets[i].value;
        }
        this.props.node.setAttribute("tokenNames", tokens);
        // called in onBlur
        this.props.enableDeleteKey();
    }

    private updateXPaths(): void {
        const xpaths: any = {};
        for (let i = 0; i < this.xpathStatements.length; i++) {
            xpaths[this.xpathStatements[i].value] = this.xpathTargets[i].value;
        }
        this.props.node.setAttribute("xpaths", xpaths);
        // called in onBlur
        this.props.enableDeleteKey();
    }

    private hasExistingGeneratorConfig(): boolean {
        let ret = false;
        (this.props.node as DataGenerationNode).dataToGenerate.value.forEach((value) => {
            if (value.getTypeString() === "EXISTING") {
                ret = true;
            }
        });
        return ret;
    }
}
