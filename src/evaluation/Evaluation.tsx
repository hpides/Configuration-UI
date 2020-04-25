import axios from "axios";
import React, {Component} from "react";
import {Alert} from "reactstrap";
import "./Evaluation.css";
import { ChartDrawer } from "./ChartDrawer";
import { EvaluationDetail } from "./EvaluationDetail/EvaluationDetail";

interface IProps {
    importTestConfigFunc: (testConfig: any) => void;
}

interface IAppState {
    runningTests: string[];
    finishedTests: string[];
    currentId: string | null;
    currentIdIsRunning: boolean;
    pdsIsUp: boolean;
}
/*tslint:disable:no-console*/
export class Evaluation extends Component<IProps, IAppState> {

    public constructor(props: IProps) {
        super(props);
        this.state = {currentId: null, currentIdIsRunning: false, finishedTests: [], runningTests: [], pdsIsUp: false};
    }

    public render() {
        return (<EvaluationDetail testId={1587773779428} />);
    }

    private isIncluded(id: string, ids: string[]): boolean {
        for (const current of ids) {
            if (current.toString() === id) {
                return true;
            }
        }
        return false;
    }
}

export default Evaluation;
