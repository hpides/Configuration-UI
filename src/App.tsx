import React from "react";
import "reflect-metadata";
import { ApisEditor } from "./ApisEditor/ApisEditor";
import "./App.css";
import { GraphView } from "./GraphView/GraphView";
import logo from "./logo.svg";
import { Sidebar } from "./Sidebar/Sidebar";
import { Testconfig } from "./Testconfig/Testconfig";
import { Views } from "./Views";

interface IState {
  currentView: Views;
}

class App extends React.Component<{}, IState> {
  constructor(props: any) {
    super(props);
    this.state = {
      currentView: Views.UserStories,
    };
  }
  public changeView = (view: Views) => {
    this.setState({currentView: view});
  }
  public render() {
    let view;
    switch (this.state.currentView) {
      case Views.Apis:
        view = <ApisEditor />;
        break;
      case Views.Testconfig:
        view = <Testconfig />;
        break;
      case Views.UserStories:
        view = <GraphView />;
        break;
      default:
        view = <ApisEditor />;
    }

    return (
      <div className="App">
        <header className="App-header">
          <h1>TDGT Configuration</h1>
          <img src={logo} className="App-logo" alt="logo" />
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
