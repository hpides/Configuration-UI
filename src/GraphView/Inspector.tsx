import {DiagramModel} from "@projectstorm/react-diagrams";
import React from "react";
import ReactTooltip from "react-tooltip";
import { ApisEditor } from "../ApisEditor/ApisEditor";
import {ExistingConfigComponent} from "../ExistingConfig/existingConfigComponent";
import "./Inspector.css";
import "./accordion.css";
import {AssertionAdder} from "./Inspector/AssertionAdder";
import {
    ContentNotEmptyAssertion,
    ContentTypeAssertion,
    JSONPATHAssertion,
    ResponseCodeAssertion,
    XPATHAssertion,
} from "./Inspector/AssertionConfig";
import {AssertionConfig} from "./Inspector/AssertionConfig";
import {AuthAdder} from "./Inspector/AuthAdder";
import {GeneratorAdder} from "./Inspector/GeneratorAdder";
import {ExistingDataConfig, GeneratorConfig} from "./Inspector/GeneratorConfig";
import {DataGenerationNode} from "./Nodes/DataGenerationNode";
import {Node} from "./Nodes/Node";
import {RequestNode} from "./Nodes/RequestNode";
import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel,
} from 'react-accessible-accordion';

interface IProps {
    onValueChanged: (key: string, value: string) => void;
    node: Node;
    model: DiagramModel;
    disableDeleteKey: () => void;
    enableDeleteKey: () => void;
    existingConfig: ExistingConfigComponent;
    existingApi: ApisEditor;
}

interface IState {
    addingGenerator: boolean;
    addingAuth: boolean;
    addingAssertion: boolean;
    activeGenerator: {key: string, genConfig: GeneratorConfig} | null;
    activeAssertion: AssertionConfig | null;
    assertionDoesNotHaveToBeAdded: boolean;
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
    private staticValueNames: HTMLInputElement[] = [];
    private staticValues: HTMLInputElement[] = [];
    private sendHeaderExpressions: HTMLInputElement[] = [];
    private sendHeaderNames: HTMLInputElement[] = [];
    private receiveHeaderNames: HTMLInputElement[] = [];
    private receiveHeaderValues: HTMLInputElement[] = [];

    private assignmentSources: HTMLInputElement[] = [];
    private assignmentValues: HTMLInputElement[] = [];
    constructor(props: any) {
        super(props);

        this.state = {
            activeAssertion: null,
            activeGenerator: null,
            addingAssertion: false,
            addingAuth: false,
            addingGenerator: false,
            assertionDoesNotHaveToBeAdded: false,
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
        if (!this.state.assertionDoesNotHaveToBeAdded) {
            node.addAssertion(config);
        }

        this.setState({addingAssertion: false, assertionDoesNotHaveToBeAdded: false});
    }

    public handleCancelAssertionDialog = () => {
        this.setState({
            activeAssertion: null,
            addingAssertion: false,
            assertionDoesNotHaveToBeAdded: false,
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

        const assertion = node.getAttribute("assertions")[Number(index)] as AssertionConfig;
        // both the following attributes might be changed / invalid here. Re-set them.
        assertion.keyhandler = {disableDeleteKey : this.props.disableDeleteKey,
            enableDeleteKey: this.props.enableDeleteKey};
        // forceUpdate is wrapped in lambda, since else the "this" context would be different
        assertion.redraw = () => this.forceUpdate();
        this.setState({
            activeAssertion: assertion,
            addingAssertion: true,
            // assertion is already known, editing values will propagate
            assertionDoesNotHaveToBeAdded: true,
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
                    <td>
                    <button
                        className="delete-data-btn"
                        data-key={keys[i]}
                        onClick={this.deleteGenerator}
                    >&times;</button>
                    </td>
                </tr>,
            );
        }
        let isExistingConfig = false;
        for (const datum of Array.from(node.dataToGenerate.value.values())) {
            if (datum.getTypeString() === "EXISTING") {
                isExistingConfig = true;
            }
        }
        let locked = "";
        // after reload / import also data generations that are not existing data config have (generated) table names
        // --> make sure they are not locked away
        if (node.getAttribute("table") !== null && isExistingConfig) {
            locked = " locked";
        }

        return (
            <AccordionItem>
                <AccordionItemHeading>
                    <AccordionItemButton>
                        Data
                    </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
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
                </AccordionItemPanel>
            </AccordionItem>
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
                assertionText = "Response Content Type is " + assertion.contentType;
            } else if (assertion instanceof XPATHAssertion) {
                assertionText = "Response has result for XPATH " + assertion.xpath;
            } else if (assertion instanceof ContentNotEmptyAssertion) {
                assertionText = "Response is not empty";
            } else if (assertion instanceof JSONPATHAssertion) {
                assertionText = "Response has result for JSONPATH";
            }
            rows.push(
                <tr key={i} data-index={i} onClick={this.editAssertion}>
                    <td>{assertion.name}</td>
                    <td>{assertionText}</td>
                    <td>
                    <button
                        className="delete-data-btn"
                        data-index={i}
                        onClick={this.deleteAssertion}
                    >&times;</button>
                    </td>
                </tr>,
            );
        }

        return(
            <AccordionItem>
                <AccordionItemHeading>
                    <AccordionItemButton>
                        Assertions
                    </AccordionItemButton>
                </AccordionItemHeading>
                <AccordionItemPanel>
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
                </AccordionItemPanel>
            </AccordionItem>
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
            const label = <AccordionItemHeading>
                <AccordionItemButton>
                    {key + note}
                </AccordionItemButton>
            </AccordionItemHeading>;

            if (key === "basicAuth") {

                let buttonString = "Add Auth";
                const authObject = node.getAttribute(key);
                if (authObject) {
                    buttonString = authObject.user + ":" + authObject.password;
                }
                const authButton = <button key={i}
                                           onClick={this.addAuth}
                >{buttonString}</button>;
                inputs.push(<AccordionItem>
                    {label}
                    <AccordionItemPanel>
                        {authButton}
                    </AccordionItemPanel>
                </AccordionItem>)

            } else if (key === "receiveCookies" || key === "sendCookies") {
                const description = (key === "receiveCookies") ? "Cookies to extract" : "Cookies to send";
                const cookies: any = node.getAttribute(key);

                const cookieTable =
                <table key={key + "table"}>
                    <tbody>
                    <tr><td>{(key === "receiveCookies") ? "Response Cookie" : "Token key"}</td><td>{(key === "receiveCookies") ? "Token key" : "Request Cookie"}</td></tr>
                        {Object.keys(cookies).map((cookie) =>
                            <tr key={cookie}>
                                <td>
                                    <input key={cookie + "left"} type="text" ref={(ref) => {
                                        if (ref) {
                                            if ((key === "receiveCookies")) {
                                                this.receiveCookieKeys.push(ref);
                                            } else {
                                                this.sendCookieKeys.push(ref);
                                            }
                                            ref.value = cookie;
                                        }
                                    }} onBlur={(e) => (key === "receiveCookies") ?
                                        this.updateReceiveCookies() : this.processInspectorBlur()}
                                       onFocus={this.props.disableDeleteKey}/>
                                </td>
                                <td>
                                    <input key={cookie + "right"} type="text" ref={(ref) => {
                                        if (ref) {
                                            if ((key === "receiveCookies")) {
                                                this.receiveCookieValues.push(ref);
                                            } else {
                                                this.sendCookieValues.push(ref);
                                            }
                                            ref.value = node.getAttribute(key)[cookie];
                                        }
                                    }} onBlur={(e) => (key === "receiveCookies") ?
                                        this.updateReceiveCookies() : this.processInspectorBlur()}
                                    onFocus={this.props.disableDeleteKey}/>
                                </td>
                            </tr>,
                        )}
                    </tbody>
                </table>;
                inputs.push(<AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton data-tip={((key === "receiveCookies") ? "Cookies from the result which will be stored in the Token. Entered cookie name can be a Regex, in which case the first cookie from the result in arbitrary order that matches the expression will be chosen."
                : "Cookies from the token to send in the request. Entered token name can be a Regex, in which case the first cookie from the token in arbitrary order that matches the expression will be chosen.")}>
                            {description}
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        {cookieTable}
                        <button key={key + "button"} onClick={() => {
                            node.getAttribute(key)[""] = "";
                            // the above action does not trigger React to re-render although we need to here
                            this.forceUpdate();
                        }}>Add Cookie</button>
                    </AccordionItemPanel>
                </AccordionItem>);
            } else if (key === "tokenNames") {
                const tokens: any = node.getAttribute(key);

                const cookieTable =
                <table key={key + "table"}>
                    <tbody>
                    <tr><td>Field name</td><td>Token key</td></tr>
                        {Object.keys(tokens).map((token) =>
                            <tr key={token}>
                                <td>
                                    <input type="text" ref={(ref) => {
                                        if (ref) {
                                            this.tokenNames.push(ref);
                                            ref.value = token;
                                        }
                                    }} onBlur={(e) => this.processInspectorBlur()}
                                       onFocus={this.props.disableDeleteKey}/>
                                </td>
                                <td>
                                    <input type="text" ref={(ref) => {
                                        if (ref) {
                                            this.tokenTargets.push(ref);
                                            ref.value = node.getAttribute(key)[token];
                                        }
                                    }} onBlur={(e) => this.processInspectorBlur()}
                                       onFocus={this.props.disableDeleteKey}/>
                                </td>
                            </tr>,
                        )}
                    </tbody>
                </table>;
                inputs.push(<AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton data-tip="Convenience wrapper for custom xpath. E.g. if '_csrf' is entered, the XPATH expression '//input[@type = 'hidden'][@name = 'csrf']/@value' will be evaluated as described below.">
                            Hidden fields to extract
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        {cookieTable}
                        <button key={key + "button"} onClick={() => {
                            node.getAttribute(key)[""] = "";
                            // the above action does not trigger React to re-render although we need to here
                            this.forceUpdate();
                        }}>Add hidden field</button>
                    </AccordionItemPanel>
                </AccordionItem>);
            } else if (key === "xpaths") {
                const xpaths: any = node.getAttribute(key);

                const xpathTable =
                <table key={key + "table"}>
                    <tbody>
                    <tr><td>XPATH statement</td><td>Token key</td></tr>
                        {Object.keys(xpaths).map((xpath) =>
                            <tr key={xpath}>
                                <td>
                                    <input type="text" ref={(ref) => {
                                        if (ref) {
                                            this.xpathStatements.push(ref);
                                            ref.value = xpath;
                                        }
                                    }} onBlur={(e) => this.processInspectorBlur()}
                                       onFocus={this.props.disableDeleteKey}/>
                                </td>
                                <td>
                                    <input type="text" ref={(ref) => {
                                        if (ref) {
                                            this.xpathTargets.push(ref);
                                            ref.value = node.getAttribute(key)[xpath];
                                        }
                                    }} onBlur={(e) => this.processInspectorBlur()}
                                       onFocus={this.props.disableDeleteKey}/>
                                </td>
                            </tr>,
                        )}
                    </tbody>
                </table>;
                inputs.push(<AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton data-tip="XPATH expressions on the left will be evaluated for the returned page. The extracted string (first hit) will be stored in the token under the key on the right.">
                            Custom values from the page (XPATH)
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        {xpathTable}
                        <button key={key + "button"} onClick={() => {
                            node.getAttribute(key)[""] = "";
                            // the above action does not trigger React to re-render although we need to here
                            this.forceUpdate();
                        }}>Add XPath expression</button>
                    </AccordionItemPanel>
                </AccordionItem>);
            } else if (key === "staticValues") {
                const values: any = node.getAttribute(key);

                const valueTable =
                <table key={key + "table"}>
                    <tbody>
                    <tr><td>Token key</td><td>Value</td></tr>
                        {Object.keys(values).map((value) =>
                            <tr key={value}>
                                <td>
                                    <input type="text" ref={(ref) => {
                                        if (ref) {
                                            this.staticValueNames.push(ref);
                                            ref.value = value;
                                        }
                                    }} onBlur={(e) => this.processInspectorBlur()}
                                       onFocus={this.props.disableDeleteKey}/>
                                </td>
                                <td>
                                    <input type="text" ref={(ref) => {
                                        if (ref) {
                                            this.staticValues.push(ref);
                                            ref.value = node.getAttribute(key)[value];
                                        }
                                    }} onBlur={(e) => this.processInspectorBlur()}
                                       onFocus={this.props.disableDeleteKey}/>
                                </td>
                            </tr>,
                        )}
                    </tbody>
                </table>;
                inputs.push(<AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton data-tip="Values to put into the token for every run">
                            Static values for every run
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        {valueTable}
                        <button key={key + "button"} onClick={() => {
                            node.getAttribute(key)[""] = "";
                            // the above action does not trigger React to re-render although we need to here
                            this.forceUpdate();
                        }}>Add static value</button>
                    </AccordionItemPanel>
                </AccordionItem>);
            } else if (key === "sendHeaders") {
                const values: any = node.getAttribute(key);

                const valueTable =
                <table key={key + "table"}>
                    <tbody>
                    <tr><td>Expression</td><td>Header names</td></tr>
                        {Object.keys(values).map((value) =>
                            <tr key={value}>
                                <td>
                                    <input type="text" ref={(ref) => {
                                        if (ref) {
                                            this.sendHeaderExpressions.push(ref);
                                            ref.value = value;
                                        }
                                    }} onBlur={(e) => this.processInspectorBlur()}
                                       onFocus={this.props.disableDeleteKey}/>
                                </td>
                                <td>
                                    <input type="text" ref={(ref) => {
                                        if (ref) {
                                            this.sendHeaderNames.push(ref);
                                            ref.value = node.getAttribute(key)[value];
                                        }
                                    }} onBlur={(e) => this.processInspectorBlur()}
                                       onFocus={this.props.disableDeleteKey}/>
                                </td>
                            </tr>,
                        )}
                    </tbody>
                </table>;
                inputs.push(<AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton data-tip="Left input fields require the text for the header and might use variable expansion. Right side is respective Header name.">
                            Headers to send
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        {valueTable}
                                <button key={key + "button"} onClick={() => {
                            node.getAttribute(key)[""] = "";
                            // the above action does not trigger React to re-render although we need to here
                            this.forceUpdate();
                        }}>Add header to send</button>
                    </AccordionItemPanel>
                </AccordionItem>)
            } else if (key === "receiveHeaders") {
                const values: any = node.getAttribute(key);

                const valueTable =
                <table key={key + "table"}>
                    <tbody>
                    <tr><td>Header name</td><td>Name in token</td></tr>
                        {Object.keys(values).map((value) =>
                            <tr key={value}>
                                <td>
                                    <input type="text" ref={(ref) => {
                                        if (ref) {
                                            this.receiveHeaderNames.push(ref);
                                            ref.value = value;
                                        }
                                    }} onBlur={(e) => this.processInspectorBlur()}
                                       onFocus={this.props.disableDeleteKey}/>
                                </td>
                                <td>
                                    <input type="text" ref={(ref) => {
                                        if (ref) {
                                            this.receiveHeaderValues.push(ref);
                                            ref.value = node.getAttribute(key)[value];
                                        }
                                    }} onBlur={(e) => this.processInspectorBlur()}
                                       onFocus={this.props.disableDeleteKey}/>
                                </td>
                            </tr>,
                        )}
                    </tbody>
                </table>;
                inputs.push(<AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton data-tip="Names to be extracted from the response and stored into the token. Left is the response name, right is the target name in the token.">
                            Headers to receive
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        {valueTable}
                        <button key={key + "button"} onClick={() => {
                            node.getAttribute(key)[""] = "";
                            // the above action does not trigger React to re-render although we need to here
                            this.forceUpdate();
                        }}>Add header to receive</button>
                    </AccordionItemPanel>
                </AccordionItem>)
            } else if (key === "assignments") {
                const values: any = node.getAttribute(key);

                const valueTable =
                <table key={key + "table"}>
                    <tbody>
                    <tr><td>Source</td><td>Target</td></tr>
                        {Object.keys(values).map((value) =>
                            <tr key={value}>
                                <td>
                                    <input type="text" ref={(ref) => {
                                        if (ref) {
                                            this.assignmentSources.push(ref);
                                            ref.value = value;
                                        }
                                    }} onBlur={(e) => this.processInspectorBlur()}
                                       onFocus={this.props.disableDeleteKey}/>
                                </td>
                                <td>
                                    <input type="text" ref={(ref) => {
                                        if (ref) {
                                            this.assignmentValues.push(ref);
                                            ref.value = node.getAttribute(key)[value];
                                        }
                                    }} onBlur={(e) => this.processInspectorBlur()}
                                       onFocus={this.props.disableDeleteKey}/>
                                </td>
                            </tr>,
                        )}
                    </tbody>
                </table>;
                inputs.push(<AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton data-tip="Names to obe copied into a new key in the token. Left is the source key, right is the target key in the token.">
                            Assignments
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>
                        {valueTable}
                        <button key={key + "button"} onClick={() => {
                            node.getAttribute(key)[""] = "";
                            // the above action does not trigger React to re-render although we need to here
                            this.forceUpdate();
                        }}>Add assignment</button>
                    </AccordionItemPanel>
                </AccordionItem>)
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
            } else if (key === "addr") {
                let addrInputRef: any;
                const input = <input onFocus={this.props.disableDeleteKey} onBlur={this.props.enableDeleteKey} key={i}
                                     type="text"
                                     data-tip="Token expansion is supported. E.g. addr='http://example.com/$deleteURL' with deleteURL='1/delete' will be expanded to 'http://example.com/1/delete'."
                                     name={key}
                                     value={node.getAttribute(key)}
                                     onChange={this.inputChanged}
                                     ref={(ref) => addrInputRef = ref}
                />;
                const endpointOptions: JSX.Element[] = [];
                for (const endpoint of this.props.existingApi.state.allEndpoints) {
                    endpointOptions.push(
                        <option value={endpoint}>{endpoint}</option>,
                    );
                }
                const preset = <div className="preset-select">
                    <select value="EMPTY" name="addrPreset"
                        onChange={(event) => {
                            addrInputRef.value = event.currentTarget.value;
                        }}
                    >
                        <option value="EMPTY" disabled>Choose Preset</option>
                        {endpointOptions}
                    </select>
                </div>;
                inputs.push(<AccordionItem>
                    {label}
                    <AccordionItemPanel>
                        {input}
                        {preset}
                    </AccordionItemPanel>
                </AccordionItem>)

            } else if (key === "requestParams") {
                const input = <input onFocus={this.props.disableDeleteKey} onBlur={this.props.enableDeleteKey} key={i}
                                     type="text"
                                     data-tip="Given comma-separated parameters will be extracted from the Token and sent to the target via HTTP Form Parameters."
                                     name={key}
                                     value={node.getAttribute(key)}
                                     onChange={this.inputChanged}
                />;
                inputs.push(<AccordionItem>
                    {label}
                    <AccordionItemPanel>
                        {input}
                    </AccordionItemPanel>
                </AccordionItem>)

            } else if (key === "delay") {
                const input = <input onFocus={this.props.disableDeleteKey} onBlur={this.props.enableDeleteKey} key={i}
                                     type="text"
                                     data-tip="Delay processing of the user story for the given amount of milliseconds. Variable expansion is supported, so waiting times can e.g. be generated by PDGF. Result after expansion must be an integer."
                                     name={key}
                                     value={node.getAttribute(key)}
                                     onChange={this.inputChanged}
                />;
                inputs.push(<AccordionItem>
                    {label}
                    <AccordionItemPanel>
                        {input}
                    </AccordionItemPanel>
                </AccordionItem>)

            } else if (key === "requestJSONObject") {
                const input = <input onFocus={this.props.disableDeleteKey} onBlur={this.props.enableDeleteKey} key={i}
                                     type="text"
                                     data-tip='Given text will be sent in the request body to the target with ContentType application/JSON. Token expansion is supported. E.g. {"key":$key, "value":$value} with key="abc" and value="def" will be expanded to {"key":"abc", "value":"def"}".'
                                     name={key}
                                     value={node.getAttribute(key)}
                                     onChange={this.inputChanged}
                />;
                inputs.push(<AccordionItem>
                    {label}
                    <AccordionItemPanel>
                        {input}
                    </AccordionItemPanel>
                </AccordionItem>)

            } else if (key === "responseJSONObject") {
                const input = <input onFocus={this.props.disableDeleteKey} onBlur={this.props.enableDeleteKey} key={i}
                                     type="text"
                                     data-tip="Response will be parsed, and given keys will be extracted and stored under their name in the token."
                                     name={key}
                                     value={node.getAttribute(key)}
                                     onChange={this.inputChanged}
                />;
                inputs.push(<AccordionItem>
                    {label}
                    <AccordionItemPanel>
                        {input}
                    </AccordionItemPanel>
                </AccordionItem>)
            } else if (key === "timeAggregation") {
                const box = <label>Aggregate recorded times:
                    <input key={key + "box"} type="checkbox" checked={node.getAttribute(key) !== false}
                           onChange={this.toggleTimeAggregation} />
                </label>;
                inputs.push(<label key={key} data-tip={"If checked, recorded times for third endpoint are shown under their  unescaped name. You might want to disable this for debugging to see the replaced URLs."}>{box}</label>);
            } else if (!(key === "id" || key === "dataToGenerate" || key === "assertions" || key === "data")) {
                const input = <input onFocus={this.props.disableDeleteKey} onBlur={this.props.enableDeleteKey} key={i}
                                     type="text"
                                     name={key}
                                     value={node.getAttribute(key)}
                                     onChange={this.inputChanged}
                />;
                inputs.push(<AccordionItem>
                    {label}
                    <AccordionItemPanel>
                        {input}
                    </AccordionItemPanel>
                </AccordionItem>)
            }
        }

        const table = this.renderTable();
        if (table) inputs.push(table);
        const assertionsTable = this.renderAssertions();
        if (assertionsTable) inputs.push(assertionsTable);

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
                <ReactTooltip />
                <h3>Inspector</h3>
                <div className="inputs-container">
                    <Accordion allowMultipleExpanded={true} allowZeroExpanded={true}>
                        {inputs}
                    </Accordion>
                </div>
                {generatorAdder}
                {authAdder}
                {assertionAdder}
            </div>
        );
    }

    public componentWillUnmount() {
        // There might be changes in some text field whose onBlur Method did not trigger.
        // Flush all of their changes before recycling the component.
        this.processInspectorBlur();
    }

    private processInspectorBlur() {
        this.updateXPaths();
        this.updateTokens();
        this.updateSendCookies();
        this.updateReceiveCookies();
        this.updateStaticValues();
        this.updateSendHeaders();
        this.updateReceiveHeaders();
        this.updateAssignments();
    }

    private toggleTimeAggregation = (): void => {
        this.props.node.setAttribute("timeAggregation",
            !(this.props.node.getAttribute("timeAggregation") as boolean));
        this.forceUpdate();
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

    private updateStaticValues(): void {
        const staticValues: any = {};
        for (let i = 0; i < this.staticValueNames.length; i++) {
            staticValues[this.staticValueNames[i].value] = this.staticValues[i].value;
        }
        this.props.node.setAttribute("staticValues", staticValues);
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

    private updateSendHeaders(): void {
        const headers: any = {};
        for (let i = 0; i < this.sendHeaderExpressions.length; i++) {
            headers[this.sendHeaderExpressions[i].value] = this.sendHeaderNames[i].value;
        }
        this.props.node.setAttribute("sendHeaders", headers);
        // called in onBlur
        this.props.enableDeleteKey();
    }

    private updateReceiveHeaders(): void {
        const headers: any = {};
        for (let i = 0; i < this.receiveHeaderNames.length; i++) {
            headers[this.receiveHeaderNames[i].value] = this.receiveHeaderValues[i].value;
        }
        this.props.node.setAttribute("receiveHeaders", headers);
        // called in onBlur
        this.props.enableDeleteKey();
    }

    private updateAssignments(): void {
        const assignments: any = {};
        for (let i = 0; i < this.assignmentSources.length; i++) {
            assignments[this.assignmentSources[i].value] = this.assignmentValues[i].value;
        }
        this.props.node.setAttribute("assignments", assignments);
        // called in onBlur
        this.props.enableDeleteKey();
    }

}
