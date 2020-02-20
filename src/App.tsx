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
    currentView: Views,
    currentStory: string | null,
    readonly stories: Set<string>
}

class App extends React.Component<{}, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            currentView: Views.UserStories,
            currentStory: null,
            stories: new Set<string>()
        };
        this.state.stories.add("default");
    }

    public changeView = (view: Views, story: string | null) => {
        if(story) {
            this.state.stories.add(story);
        }
        this.setState({currentView: view, currentStory: story});

    };
    public export = ():string => {
        const stories:any[] = [];
        this.graphViews.forEach(graphView => stories.push(graphView.exportNodes(null)));
        console.log(JSON.stringify(stories));
        return "";
    };

    private readonly graphViews: Set<GraphView> = new Set<GraphView>();

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
                    {Array.from(this.state.stories).map(story => <div style={this.state.currentStory === story? {visibility: "visible"}:{visibility: "hidden"}}><GraphView key={story} story={story} ref={ref => {if(ref){this.graphViews.add(ref)}}}/></div>)}
                </div>;
                break;
            default:
                view = <ApisEditor/>;
        }



        return (
            <div className="App">
                <header className="App-header">
                    <h1>TDGT Configuration</h1><button onClick={this.export}>Export</button>
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
