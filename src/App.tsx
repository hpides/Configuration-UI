import React from "react";
import "reflect-metadata";
import { create } from "xmlbuilder2";
import { XMLBuilder } from "xmlbuilder2/lib/builder/interfaces";
import {ApisEditor} from "./ApisEditor/ApisEditor";
import "./App.css";
import {GraphView} from "./GraphView/GraphView";
import logo from "./logo.svg";
import {Sidebar} from "./Sidebar/Sidebar";
import {Testconfig} from "./Testconfig/Testconfig";
import {Views} from "./Views";
import axios, {AxiosRequestConfig} from "axios";
import ClipLoader from "react-spinners/ClipLoader";

interface IState {
    currentView: Views;
    currentStory: string | null;
    readonly stories: Set<string>;
    pdgfRunning: boolean
}

/*tslint:disable:no-console*/

/*tslint:disable:max-line-length*/
class App extends React.Component<{}, IState> {

    private readonly graphViews: Set<GraphView> = new Set<GraphView>();

    private sidebar: Sidebar | null = null;

    private testConfig: Testconfig | null = null;

    constructor(props: any) {
        super(props);
        this.state = {
            currentStory: null,
            currentView: Views.UserStories,
            stories: new Set<string>(),
            pdgfRunning: false
        };
    }

    public changeView = (view: Views, story: string | null) => {
        if (story) {
            this.state.stories.add(story);
        }
        this.setState({currentView: view, currentStory: story});

    }
    public export = (): {json:string, xml:string, id: number} => {
        const stories: any[] = [];
        const pdgfTables: XMLBuilder[] = [];
        this.graphViews.forEach((graphView) => {
            const story = graphView.exportNodes(null);
            stories.push(story.story);
            for (const table of story.pdgfTables) {
                pdgfTables.push(table);
            }
        });
        const testConfigJSON: any = {};
        if (this.testConfig) {
            const testConfigState = this.testConfig.export();
            testConfigJSON.repeat = testConfigState.repeat;
            testConfigJSON.scaleFactor = testConfigState.scaleFactor;
            testConfigJSON.activeInstancesPerSecond = testConfigState.activeInstancesPerSecond;
            testConfigJSON.maximumConcurrentRequests = testConfigState.maximumConcurrentRequests;
        }
        testConfigJSON.stories  = stories;
        console.log(JSON.stringify(testConfigJSON));

        const root = create().ele("schema", {"name": "demo", "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance", "xsi:noNamespaceSchemaLocation": "structure/pdgfSchema.xsd"});
        root.ele("seed").txt("1234567890");
        root.ele("property", {name: "SF", type: "double"}).txt("1");
        for (const table of pdgfTables) {
            table.ele("size").txt(testConfigJSON.scaleFactor); // To-Do multiply with stories scalefactor
            root.import(table);
        }
        console.log(root.end({prettyPrint: true}));

        return {json: JSON.stringify(testConfigJSON), xml: root.end({prettyPrint: true}).toString(), id: Date.now()};
    };

    public import = (testConfig: any): void => {
        const stories: any[] = testConfig.stories;
        for (const story of stories) {
            // this creates the respective graph view
            this.state.stories.add(story.name);
            // this creates the sidebar button
            if (this.sidebar) {
                this.sidebar.addStory(story.name);
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
    };

    public startTest = ():void => {
        const config = this.export();
        this.setState({pdgfRunning: true});
        const axiosParams = {headers: {
            "Content-Type": "application/xml"
            }} as AxiosRequestConfig;
        axios.post("http://localhost:8080/uploadPDGF", config.xml, axiosParams).then(r => {
                console.log(r.status);
                if(r.status === 200){
                    alert("PDGF finished, press \"OK\" to start actual test!");
                    this.setState({pdgfRunning: false});
                    axiosParams.headers = {
                        "Content-Type": "application/json"
                    };
                    axios.post("http://localhost:8080/upload/"+config.id, config.json, axiosParams).then(r=> alert("Test "+config.id+" finished!")).catch(e => alert(e))
                }
        }
            ).catch(e => alert(e))
    };

    public render() {
        this.graphViews.forEach((view) => {
            view.setVisibility(this.state.currentView === Views.UserStories && this.state.currentStory !== null && view.getStory() === this.state.currentStory);
        });
        return (
            <div className="App">
                <header className="App-header">
                    <h1>TDGT Configuration</h1>
                    <button onClick={this.export}>Export</button>
                    <button
                        onClick={(event) => this.import(JSON.parse(prompt("Array of stories JSON please:") || "[]"))}>Import
                    </button>

                    <button onClick={this.startTest}>Start test</button>
                    <img src={logo} className="App-logo" alt="logo"/>
                    <div style={this.state.pdgfRunning ? {visibility: "visible"} : {visibility: "hidden"}}>
                        PDGF running
                    </div>
                    <ClipLoader loading={this.state.pdgfRunning}/>
                </header>
                <div className="content">
                    <Sidebar currentView={this.state.currentView} changeView={this.changeView}
                             ref={(ref) => this.sidebar = ref}/>
                    {// We need to render all elements at all time so their state does not get recycled
                    }
                    <div className="main">
                        <div
                            style={this.state.currentView === Views.Apis ? {visibility: "visible"} : {visibility: "hidden"}}>
                            <ApisEditor/></div>
                        <div
                            style={this.state.currentView === Views.Testconfig ? {visibility: "visible"} : {visibility: "hidden"}}>
                            <Testconfig ref={(ref) => this.testConfig = ref}/>
                        </div>
                        <div
                            style={this.state.currentView === Views.UserStories ? {visibility: "visible"} : {visibility: "hidden"}}>
                            {Array.from(this.state.stories).map((story) => <div key={story}
                                                                                style={this.state.currentStory === story ? {visibility: "visible"} : {visibility: "hidden"}}>
                                <GraphView story={story} ref={(ref) => {
                                    if (ref) {
                                        this.graphViews.add(ref);
                                    }
                                }}/></div>)}
                        </div>
                    </div>
                </div>

            </div>
        );
    }
}

export default App;
