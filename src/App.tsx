import axios, {AxiosRequestConfig} from "axios";
import {classToPlain} from "class-transformer";
import React from "react";
import ClipLoader from "react-spinners/ClipLoader";
import {Alert} from "reactstrap";
import "reflect-metadata";
import { create } from "xmlbuilder2";
import {fragment} from "xmlbuilder2/lib";
import { XMLBuilder } from "xmlbuilder2/lib/builder/interfaces";
import {ApisEditor, IUploadedFile as IUploadedFileAPI} from "./ApisEditor/ApisEditor";
import "./App.css";
import {Evaluation} from "./evaluation/Evaluation";
// has classes for alerts
import "./evaluation/Evaluation.css";
import {ExistingConfigComponent, IUploadedFile} from "./ExistingConfig/existingConfigComponent";
import {GraphView} from "./GraphView/GraphView";
import logo from "./logo.svg";
import {Sidebar} from "./Sidebar/Sidebar";
import {ITestConfigState , Testconfig} from "./Testconfig/Testconfig";
import {Views} from "./Views";
export interface IState {
    currentView: Views;
    currentStory: string | null;
    stories: string[];
    pdgfRunning: boolean;
    currentTestId: string | undefined;
    existingConfigComponent: ExistingConfigComponent | null;
    apisEditor: ApisEditor | null;
    pdgfOutput: string[]| null;
}

/*tslint:disable:no-console*/

/*tslint:disable:max-line-length*/
class App extends React.Component<{}, IState> {

    public testConfig: Testconfig | null = null;

    public readonly requiredTestAttributes = ["repeat", "scaleFactor"];

    private graphViews: GraphView[] = [];

    private sidebar: Sidebar | null = null;
    private  requestGeneratorHost: string | null;

    private readonly keyhandler: {
        readonly disableDeleteKey: () => void,
        readonly enableDeleteKey: () => void,
    };

    private lastExport: any = {};

    private unloadHandler: () => void;

    // used to import PDGF configs after reload
    private lastConfig?: any = null;
    private lastConfigAPI?: any = null;

    private readonly inputUploadJSONRef: React.RefObject<HTMLInputElement>;

    constructor(props: any) {
        super(props);
        this.state = {
            apisEditor: null,
            currentStory: null,
            currentTestId: undefined,
            currentView: Views.UserStories,
            existingConfigComponent: null,
            pdgfOutput: null,
            pdgfRunning: false,
            stories: [],
        };
        this.requestGeneratorHost = null;
        // since this is an async function, we can not use the typical lambda way
        this.startTest = this.startTest.bind(this);
        // disable and re-enable delete keys for all graph views makes updating these methods unnecessary (which would be complicated)
        this.keyhandler = {disableDeleteKey: () => {
            this.graphViews.forEach((view) => {
                view.disableDeleteKey();
            });
            }, enableDeleteKey: () => {this.graphViews.forEach((view) => {
                view.enableDeleteKey();
            });
        }};
        this.unloadHandler = () => {
            this.export();
            localStorage.setItem("lastConfig", this.lastExport.json);
        };
        this.inputUploadJSONRef = React.createRef();
    }

    public componentDidMount() {
        const lastConfig = window.localStorage.getItem("lastConfig");
        if (lastConfig) {
            this.import(JSON.parse(lastConfig));
        }
        this.requestGeneratorHost = process.env.REACT_APP_REQGEN_HOST || window.location + "/reqgen";
        window.addEventListener("beforeunload", this.unloadHandler);
    }

    public changeView = (view: Views, story: string | null) => {
        if (story) {
            let found = false;
            for (const existingStory of this.state.stories) {
                if (existingStory === story) {
                    found = true;
                }
            }
            if (!found) {this.state.stories.push(story); }
        }
        this.setState({currentView: view, currentStory: story, stories: this.state.stories});

    }
    public renameStory = (oldName: string, newName: string) => {

        this.graphViews.forEach((view) => {
            if (view.getStory() === oldName) {
                view.setStory(newName);
            }
        });

        const stories = this.state.stories;

        this.state.stories.forEach((value, index) => {
            if (value === oldName) {
                // eslint-disable-next-line
                this.state.stories[index] = newName;
            }
        });

        let currentStory = this.state.currentStory;
        if (currentStory === oldName) {
            currentStory = newName;
        }

        this.setState({stories, currentStory});

    }

    public downloadJSON = (): void => {
        this.export();
        const config = this.lastExport.json;
        const element = document.createElement("a");
        const file = new Blob([config], {type: "application/json"});
        element.href = URL.createObjectURL(file);
        element.download = ("TDGT_Configuration.json");
        document.body.appendChild(element);
        element.click();
    }
    /**
     * Prepares test configuration and the implicit PDGF schema. Warns the user if test attributes are not sufficient.
     * @attribute failureMessageSuffix additional last line for the warning dialog
     * Returns true if this succeeds, false in cases of error.
     */
    public export = (failureMessageSuffix = ""): boolean => {
        const stories: any[] = [];
        const pdgfTables: XMLBuilder[] = [];
        console.log("Exporting");
        this.graphViews.forEach((graphView) => {
            const story = graphView.exportNodes(null);
            // stories with empty names count as deleted
            if (story.story.name !== "") {
                stories.push(story.story);
                for (const table of story.pdgfTables) {
                    pdgfTables.push(table);
                }
            }
        });
        const testConfigJSON: any = {};
        if (this.testConfig) {
            const testConfigState = this.testConfig.export();
            console.log("Hallo");
            console.log(testConfigState.repeat);
            testConfigJSON.repeat = testConfigState.repeat;
            testConfigJSON.scaleFactor = testConfigState.scaleFactor;
            testConfigJSON.activeInstancesPerSecond = testConfigState.activeInstancesPerSecond;
            testConfigJSON.maximumConcurrentRequests = testConfigState.maximumConcurrentRequests;
            testConfigJSON.noSession = testConfigState.noSession;
            testConfigJSON.requestDurationThreshold = testConfigState.requestDurationThreshold;
            testConfigJSON.name = testConfigState.name;
        }
        let requiredAttributesSet = true;
        let failureMessage = "Warning: the following required test attributes are not set or invalid:\n";
        for (const attribute of this.requiredTestAttributes) {
            const value = testConfigJSON[attribute];
            if (value === undefined || value === null || value === "" || value < 0) {
                failureMessage = failureMessage.concat(attribute).concat(" (should be a positive integer)\n");
                requiredAttributesSet = false;
            }
        }
        testConfigJSON.stories  = stories;

        testConfigJSON.existingXMLs = this.state.existingConfigComponent ? this.state.existingConfigComponent.state : {};
        testConfigJSON.apis = this.state.apisEditor ? this.state.apisEditor.state : {};

        // make sure to remove excluded attributes before export
        // also, pretty-print
        console.log(JSON.stringify(classToPlain(testConfigJSON), null, 4));

        const root = create().ele("schema", {"name": "demo", "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance", "xsi:noNamespaceSchemaLocation": "structure/pdgfSchema.xsd"});
        root.ele("seed").txt("1234567890");
        root.ele("property", {name: "SF", type: "double"}).txt("1");
        let importedAnything = false;
        for (const table of pdgfTables) {
            importedAnything = true;
            table.ele("size").txt(testConfigJSON.scaleFactor); // To-Do multiply with stories scalefactor
            root.import(table);
        }
        // PDGF will fail if no tables at all exist, so create one in case
        if (!importedAnything) {
            console.log("Imported table");
            const defaultTable = fragment().ele("table", {name: "defaultTable"});
            defaultTable.ele("size").txt("1");
            const defaultField = defaultTable.ele("field", {name: "default", type: "VARCHAR"});
            const defaultGenerator = defaultField.ele("gen_RandomString");
            defaultGenerator.ele("max").txt("1");
            root.import(defaultTable);
        }
        console.log(root.end({prettyPrint: true}));

        // make sure to remove excluded attributes before export
        this.lastExport = {json: JSON.stringify(classToPlain(testConfigJSON)), xml: root.end({prettyPrint: true}).toString(), id: Date.now()};
        if (!requiredAttributesSet) {
            alert(failureMessage.concat(failureMessageSuffix === "" ? "" : "\n".concat(failureMessageSuffix)));
        }
        return requiredAttributesSet;
    }

    public uploadJSON = (event: any): void => {

        event.preventDefault();
        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result?.toString();
            console.log("improting");
            console.log(text);
            if (text) {
                this.import(JSON.parse(text));
            }
        };
        reader.readAsText(event.target.files[0]);
    }

    public import = (testConfig: any): void => {
        const stories: any[] = testConfig.stories;
        for (const story of stories) {
            // this creates the respective graph view
            this.state.stories.push(story.name);
            // this creates the sidebar button
            if (this.sidebar) {
                this.sidebar.addStory(story.name);
            }

        }
        if (this.testConfig) {
            this.testConfig.import(testConfig);
        }
        if (this.state.existingConfigComponent && testConfig.existingXMLs) {
            this.importUploadedPDGFConfigs(testConfig);
        } else {
            // can not (yet) import PDGF config since component has not yet rendered. Defer until ref available
            if (!this.state.existingConfigComponent && testConfig.existingXMLs !== {} && testConfig.existingXMLs) {
                this.lastConfig = testConfig;
            }
        }
        if (this.state.apisEditor && testConfig.apis) {
            this.importUploadedAPIConfigs(testConfig);
        } else {
            // can not (yet) import API config since component has not yet rendered. Defer until ref available
            if (!this.state.apisEditor && testConfig.apis !== {} && testConfig.apis) {
                this.lastConfigAPI = testConfig;
            }
        }
        // need to re-render to create respective views before we can call the update
        this.forceUpdate(() => {
            // enough graph views have been created
            const views = Array.from(this.graphViews);
            for (let i = 0; i < views.length; i++) {
                views[i].importNodes(stories[i]);
                // else all nodes are visible for a moment
                views[i].setVisibility(false);
            }
        });
    }

    public async startTest() {
        // user might not have prefixed host with http://
        if (this.requestGeneratorHost && !this.requestGeneratorHost.startsWith("http://")) {
            this.requestGeneratorHost = "http://" + this.requestGeneratorHost;
        }
        if (!this.export("Not starting test since required attributes are not set!")) {
            return;
        }
        const config = this.lastExport;
        this.setState({pdgfRunning: true});
        const axiosParams = {headers: {
                "Content-Type": "application/xml",
            }} as AxiosRequestConfig;

        // they all need to be re-generated since they might be new or PDGF data have been deleted
        let pdgfOutput: string[] = [];
        if (this.state.existingConfigComponent) {
            for (const fileName of Array.from(this.state.existingConfigComponent.state.uploadedFiles.keys())) {
                const file = this.state.existingConfigComponent.state.uploadedFiles.get(fileName)!;
                pdgfOutput.push("<b>Generating data for imported schema " + fileName + "</b>");
                const existingConfigResponse = await axios.post(this.requestGeneratorHost + "/uploadPDGF/distributed", file.fileContent, axiosParams);
                pdgfOutput = pdgfOutput.concat(existingConfigResponse.data.replace(/</g, "&lt;").replace(/>/g, "&gt;").split("\n"));
                // do not start test if PDGF failed
                if (existingConfigResponse.status !== 200) {
                    alert("PDGF return status: " + existingConfigResponse.status);
                    // so users can see the error
                    this.setState({pdgfOutput, pdgfRunning: false, currentView: Views.PDGFOutput});
                    return;
                }
            }
        }
        const response = await axios.post(this.requestGeneratorHost + "/uploadPDGF/distributed", config.xml, axiosParams);
        pdgfOutput.push("<b>Generating data for self-generated schema</b>");
        pdgfOutput = pdgfOutput.concat(response.data.replace(/</g, "&lt;").replace(/>/g, "&gt;").split("\n"));
        if (response.status === 200) {
            this.setState({pdgfOutput, currentView: Views.PDGFOutput, pdgfRunning: false});
        } else {
            alert("PDGF return status: " + response.status);
            this.setState({pdgfOutput, currentView: Views.PDGFOutput, pdgfRunning: false});
        }
    }

    public render() {
        this.graphViews.forEach((view) => {
            const active = this.state.currentView === Views.UserStories && this.state.currentStory !== null && view.getStory() === this.state.currentStory;
            view.setVisibility(active);
            if (active) {
                view.enableDeleteKey();
            } else {
                view.disableDeleteKey();
            }
        });
        let pdgfOutput = <div/>;
        // allow switching away from PDGFOutput
        if (this.state.currentView === Views.PDGFOutput) {
            pdgfOutput = <Alert> <h2>PDGF output: </h2><br/>{(this.state.pdgfOutput || ["No PDGF output so far"]).map((value, index) => <div key={index} style={{textAlign: "left"}} dangerouslySetInnerHTML={{__html: value}}/>)}<br/><button style={this.state.pdgfOutput ? {visibility: "visible"} : {visibility: "hidden"}} onClick={this.startTestInBackend}>Start test</button></Alert>;
        }
        return (
            <div className="App">
                <header className="App-header">
                    <h1>WALT Configuration</h1>
                    <input type="file" ref={this.inputUploadJSONRef} accept="application/json" onChange={this.uploadJSON} style={{display: "none"}}/>
                    <button onClick={this.downloadJSON}>Export</button>
                    <button
                        onClick={(event) => this.inputUploadJSONRef.current?.click()}>Import
                    </button>

                    <button onClick={this.startTest}>Start Test</button>
                    <button onClick={() => {
                        // else the handler would immediately re-add the export to localstorage
                        window.removeEventListener("beforeunload", this.unloadHandler);
                        window.localStorage.removeItem("lastConfig");
                        window.location.reload();
                    }}>Discard Current Configuration</button>
                    <img src={logo} className="App-logo" alt="logo"/>
                    <div style={this.state.pdgfRunning ? {visibility: "visible"} : {visibility: "hidden"}}>
                        PDGF running
                    </div>
                    <ClipLoader loading={this.state.pdgfRunning}/>
                </header>
                <div className="content">
                    <Sidebar currentView={this.state.currentView}
                             changeView={this.changeView}
                             renameStory={this.renameStory}
                             _keyhandler={this.keyhandler}
                             ref={(ref) => this.sidebar = ref}
                    />
                    {// We need to render all elements at all time so their state does not get recycled; also, all views except UserStories profit from srolling
                    }
                    <div className="main" style={this.state.currentView === Views.UserStories ? {overflow: "hidden"} : {overflow: "auto"}}>

                        {pdgfOutput}
                        <div
                            style={this.state.currentView === Views.Evaluation ? {visibility: "visible"} : {visibility: "hidden", height: 0}}>
                            <Evaluation id={this.state.currentTestId} importTestConfig={this.import} ref={ (ref) => {if (ref) {ref.update(); }}}/>
                        </div>
                        <div
                            style={this.state.currentView === Views.Apis ? {visibility: "visible"} : {visibility: "hidden", height: 0}}>
                            <ApisEditor ref={(ref) => {if (!this.state.apisEditor) {
                                // see ExistingConfigComponent for details
                                this.setState({apisEditor: ref}, () => {
                                    if (this.lastConfigAPI) {
                                        this.importUploadedAPIConfigs(this.lastConfigAPI);
                                        this.lastConfigAPI = null;
                                    }
                                });
                                }}}
                            /></div>
                        <div
                            style={this.state.currentView === Views.Testconfig ? {visibility: "visible"} : {visibility: "hidden", height: 0}}>
                            <Testconfig ref={(ref) => this.testConfig = ref}/>
                        </div>
                        <div
                            style={this.state.currentView === Views.Existing ? {visibility: "visible"} : {visibility: "hidden", height: 0}}>
                            <ExistingConfigComponent ref={(ref) => {if (!this.state.existingConfigComponent) {
                                // the import might happen before the setState is executed (!!!), so use the callback to process the unimported last config
                                this.setState({existingConfigComponent: ref}, () => {
                                    // load PDGF config that could not be restored because this component has not yet been rendered
                                    if (this.lastConfig) {
                                        this.importUploadedPDGFConfigs(this.lastConfig);
                                        // make sure not to re-import
                                        this.lastConfig = null;
                                    }
                                });
                            }}}/>
                        </div>
                        <div
                            style={this.state.currentView === Views.UserStories ? {visibility: "visible"} : {visibility: "hidden", height: 0}}>
                            {
                                // this makes sure that even when a story is renamed it is not re-created by mapping GraphViews to the indices instead of the names
                                [...Array(this.state.stories.length)].map((story, index) => <div key={story}
                                                                                style={this.graphViews[index] && this.state.currentStory === this.graphViews[index].getStory() ? {visibility: "visible"} : {visibility: "hidden"}}>
                                <GraphView existingConfig={this.state.existingConfigComponent || new ExistingConfigComponent({})} existingApi={this.state.apisEditor || new ApisEditor({})} ref={(ref) => {
                                    // story names can change at any time. Using them as props will destroy the graph view, so set it here instead
                                    if (ref) {
                                        ref.setStory(this.state.stories[index]);
                                        let exists = false;
                                        // we do not want the same reference twice
                                        for (const view of this.graphViews) {
                                            if (view === ref) {
                                                exists = true;
                                            }
                                        }
                                        if (!exists) {
                                        this.graphViews.push(ref);
                                        }
                                    }
                                }}/></div>)}
                        </div>
                    </div>
                </div>

            </div>
        );
    }

    private importUploadedAPIConfigs = (testConfig: any) => {
        const existing = testConfig.apis;
        const allEndpoints = new Set<string>();
        for (const endpoint of existing.allEndpoints) {
            allEndpoints.add(endpoint);
        }
        const uploadedFiles = new Map<string, IUploadedFileAPI>();

        for (const member in existing.uploadedFiles) {
            if (member) {
                const uploadedFile = existing.uploadedFiles[member];
                const fileRepr = {} as IUploadedFileAPI;
                fileRepr.existingEndpoints = uploadedFile.existingEndpoints;
                fileRepr.fileContent = uploadedFile.fileContent;
                fileRepr.server = uploadedFile.server;
                uploadedFiles.set(member, fileRepr);
            }
        }

        this.state.apisEditor?.setState({allEndpoints, uploadedFiles});
    }

    private importUploadedPDGFConfigs = (testConfig: any) => {
// class-transformer is too stupid to map this to an IState, si we do it manually...
        const existing = testConfig.existingXMLs;
        const allTables = new Set<string>();
        for (const table of existing.allTables) {
            allTables.add(table);
        }
        const uploadedFiles = new Map<string, IUploadedFile>();

        for (const member in existing.uploadedFiles) {
            if (member) {
                const uploadedFile = existing.uploadedFiles[member];
                const fileRepr = {} as IUploadedFile;
                fileRepr.existingTables = uploadedFile.existingTables;
                fileRepr.fileContent = uploadedFile.fileContent;
                fileRepr.tableMapping = new Map<string, string[]>();
                for (const innerMember in uploadedFile.tableMapping) {
                    if (innerMember) {
                        const fields = uploadedFile.tableMapping[innerMember];
                        fileRepr.tableMapping.set(innerMember, fields);
                    }
                }
                uploadedFiles.set(member, fileRepr);
            }
        }

        this.state.existingConfigComponent?.setState({allTables, uploadedFiles});
    }

    private startTestInBackend = () => {
        const config = this.lastExport;
        const date = new Date(0);
        date.setUTCMilliseconds(+config.id);
        const dateString = date.toLocaleString();
        this.setState({pdgfOutput: null, currentTestId: "" + config.id});
        const axiosParams = {headers: {
                "Content-Type": "application/json",
            }} as AxiosRequestConfig;
        axios.post(this.requestGeneratorHost + "/upload/" + config.id + "/distributed", config.json, axiosParams).then((r) => alert("Test " + dateString + " started with response code " + r.status + " on " + r.data + " nodes.")).catch((e) => alert(e));
        this.setState({currentView: Views.Evaluation, currentTestId: config.id.toString()});
        this.forceUpdate();
    }
}
export default App;
