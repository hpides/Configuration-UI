import React from 'react';
import logo from './logo.svg';
import { Sidebar } from './Sidebar/Sidebar'
import './App.css';
import { Views } from './Views';
import { GraphView } from './GraphView/GraphView';
import { ApisEditor } from './ApisEditor/ApisEditor';
import { Testconfig } from './Testconfig/Testconfig';

interface Props {}

interface State {
  currentView: Views
}

class App extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      currentView: Views.Testconfig
    }
  }
  changeView = (view: Views) => {
    this.setState({currentView: view});
  }
  render() {
    let view;
    switch (this.state.currentView) {
      case Views.Apis:
        view = <ApisEditor />
        break;
      case Views.Testconfig:
        view = <Testconfig />
        break;
      case Views.UserStories:
        view = <GraphView />
        break;
      default:
        view = <ApisEditor />
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