import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route } from "react-router-dom";
import App from "./App";
import {Evaluation as EvaluationApp} from "./evaluation/Evaluation";
import "./index.css";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(<Router>
    <Route path="/" exact component={App}/>
    <Route path="/evaluation/:id" exact component={EvaluationApp}/>
    <Route path="/evaluation" exact component={EvaluationApp}/>
</Router>, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
