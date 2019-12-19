import React from 'react';
import logo from './logo.svg';
import Sidebar from './Sidebar/Sidebar'
import './App.css';
import GraphView from './GraphView/GraphView';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>TDGT Configuration</h1>
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <div className="content">
        <Sidebar />
        <div className="main">
          <GraphView />
        </div>
      </div>
    </div>
  );
}

export default App;
