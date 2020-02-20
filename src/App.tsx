import React from "react";
import "reflect-metadata";
import {ApisEditor} from "./ApisEditor/ApisEditor";
import "./App.css";
import {GraphView} from "./GraphView/GraphView";
import logo from "./logo.svg";
import {Sidebar} from "./Sidebar/Sidebar";
import {Testconfig} from "./Testconfig/Testconfig";
import {Views} from "./Views";

interface IState {
    currentView: Views;
    currentStory: string | null;
    readonly stories: Set<string>;
}
/*tslint:disable:no-console*/
/*tslint:disable:max-line-length*/
class App extends React.Component<{}, IState> {

    private readonly graphViews: Set<GraphView> = new Set<GraphView>();
    constructor(props: any) {
        super(props);
        this.state = {
            currentStory: null,
            currentView: Views.UserStories,
            stories: new Set<string>(),
        };
        this.state.stories.add("default");
        this.state.stories.add("story 1");
        this.state.stories.add("story 2");
    }

    public changeView = (view: Views, story: string | null) => {
        if (story) {
            this.state.stories.add(story);
        }
        this.setState({currentView: view, currentStory: story});

    }
    public export = (): string => {
        const stories: any[] = [];
        this.graphViews.forEach((graphView) => stories.push(graphView.exportNodes(null)));
        console.log(JSON.stringify(stories));
        return "";
    }

    public import = (stories: any[]): void => {
        for (const story of stories) {
            this.state.stories.add(story.name);

        }
        this.setState({});
        this.render();
        const views = Array.from(this.graphViews);
        for (let i = 0; i < views.length; i++) {
            views[i].importNodes(stories[i]);
        }

    }

    public render() {
        let view;
        switch (this.state.currentView) {
            case Views.Apis:
                view = <ApisEditor/>;
                break;
            case Views.Testconfig:
                view = <Testconfig/>;
                break;
            case Views.UserStories:
                view = <div>
                    {Array.from(this.state.stories).map((story) => <div key={story} style={this.state.currentStory === story ? {visibility: "visible"} : {visibility: "hidden"}}><GraphView story={story} ref={(ref) => {if (ref) {this.graphViews.add(ref); }}}/></div>)}
                </div>;
                break;
            default:
                view = <ApisEditor/>;
        }

        return (
            <div className="App">
                <header className="App-header">
                    <h1>TDGT Configuration</h1><button onClick={this.export}>Export</button>
                    <button onClick={(event) => this.import(JSON.parse(prompt("Array of stories JSON please:") || "[]"))}>Import</button>
                    <img src={logo} className="App-logo" alt="logo"/>
                </header>
                <div className="content">
                    <Sidebar currentView={this.state.currentView} changeView={this.changeView}/>
                    <div className="main">
                        {view}
                    </div>
                </div>

            </div>
        );
    }
}

export default App;
