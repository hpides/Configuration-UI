import axios from "axios";
import "./Evaluation.css"
import React, {Component} from "react";
import {MqttWorker} from "./mqtt_worker";

interface IProps {
    id?: string
}

interface IAppState {
    runningTests: string[];
    finishedTests: string[];
    currentId: string | null;
    currentIdIsRunning: boolean;
}


export class Evaluation extends Component<IProps, IAppState> {
    private interval: any = null;

    private currentId?:string = undefined;

    public componentDidMount() {
        this.setState({runningTests: [], finishedTests: []});
        this.loadTests();
        this.interval = setInterval(() => this.loadTests(), 2000);
    }

    public componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    public render() {
        let ret: any;
        if (this.state && this.state.currentId) {
            ret = <div className={"text-center"}>
                <h1 className={"display-4"}>Evaluation UI - Test in progress</h1>
                <button style={{display:"inline"}} onClick={(event: any) => this.back()}>Back to overview</button>
                <MqttWorker testId={this.state.currentId} isRunning={this.state.currentIdIsRunning}/>
            </div>;
        } else {
            ret = <div className="Evaluation multiColumnDiv">
                <h2>Running tests</h2>
                <ul className={"multiColumnDiv"}>
                    {this.state && this.state.runningTests && this.state.runningTests.map((id, index) => {
                        return <li className={"list-group-item list-group-item-action"} key={id}>
                            <button onClick={(event: any) => {
                                this.renderMqttWorker(id, true);
                            }}
                                    className={"btn"}>Test {id}</button>
                        </li>;
                    })}
                </ul>
                <h2 className={"display-4"}>Finished tests</h2>
                <ul className={"list-group text-center"}>
                    {this.state && this.state.finishedTests && this.state.finishedTests.map((id, index) => {
                        return <li className={"list-group-item list-group-item-action"} key={id}>
                            <button onClick={(event: any) => {
                                this.renderMqttWorker(id, false);
                            }}
                                    className={"btn"}>Test {id}</button>
                        </li>;
                    })}
                </ul>
            </div>;
        }
        return ret;
    }

    private loadTests() {
        axios.request<string[]>({
            url: "http://users:8080/tests/running",
        }).then((response) => {
            this.setState({runningTests: response.data});
        });
        axios.request<string[]>({
            url: "http://users:8080/tests/finished",
        }).then((response) => {
            this.setState({finishedTests: response.data});
            if(this.props.id){
                //make sure we do not keep loading the same ID
                if(!this.currentId || this.currentId !== this.props.id) {
                    this.currentId = this.props.id;
                    this.renderMqttWorker(this.props.id.toString(), !this.isIncluded(this.props.id, response.data));
                    this.forceUpdate()
                }
            }
        });
    }

    private isIncluded(id: string, ids: string[]): boolean {
        for (const current of ids) {
            if (current.toString() === id) {
                return true;
            }
        }
        return false;
    }

    private renderMqttWorker(id: string, isRunning: boolean) {
        this.setState({currentId: id, currentIdIsRunning: isRunning});
    }

    private back() {
        this.setState({currentId: null});
    }
}

export default Evaluation;