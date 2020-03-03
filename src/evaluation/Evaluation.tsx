import axios from "axios";
import React, {Component} from "react";
import "./Evaluation.css";
import {MqttWorker} from "./mqtt_worker";

interface IProps {
    id?: string;
    importTestConfig: (testConfig: any) => void;
}

interface IAppState {
    runningTests: string[];
    finishedTests: string[];
    currentId: string | null;
    currentIdIsRunning: boolean;
}
/*tslint:disable:no-console*/
export class Evaluation extends Component<IProps, IAppState> {
    private interval: any = null;

    private currentId?: string = undefined;

    private performanceDataStorageHost: string | null;

    public constructor(props: IProps) {
        super(props);
        this.performanceDataStorageHost = null;
    }

    public componentDidMount() {
        this.performanceDataStorageHost = process.env.REACT_APP_PDS_HOST || window.location + "/pds";
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
            // re-renders when key is changed
            ret = <div className={"text-center"}>
                <button style={{display: "inline"}} onClick={(event: any) => this.back()}>Back to overview</button>
                <button style={{display: "inline"}} onClick={(event: any) => this.import()}
                >Import config of test</button>
                <MqttWorker testId={this.state.currentId} isRunning={this.state.currentIdIsRunning}
                            key={this.state.currentId}/>
            </div>;
        } else {
            ret = <div className="Evaluation multiColumnDiv">
                <h2>Running tests</h2>
                <ul className={"multiColumnDiv"}>
                    {this.state && this.state.runningTests && this.state.runningTests.map((id, index) => {
                        const date = new Date(0);
                        date.setUTCMilliseconds(+id);
                        return <li className={"list-group-item list-group-item-action"} key={id}>
                            <button onClick={(event: any) => {
                                this.renderMqttWorker(id, true);
                            }}
                                    className={"btn"}>Test {date.toLocaleString()}</button>
                        </li>;
                    })}
                </ul>
                <h2 className={"display-4"}>Finished tests</h2>
                <ul className={"list-group text-center"}>
                    {this.state && this.state.finishedTests && this.state.finishedTests.map((id, index) => {
                        const date = new Date(0);
                        date.setUTCMilliseconds(+id);
                        return <li className={"list-group-item list-group-item-action"} key={id}>
                            <button onClick={(event: any) => {
                                this.renderMqttWorker(id, false);
                            }}
                                    className={"btn"}>Test {date.toLocaleString()}</button>
                        </li>;
                    })}
                </ul>
            </div>;
        }
        return ret;
    }

    private loadTests() {
        // user might not have prefixed host with http://
        if (this.performanceDataStorageHost && !this.performanceDataStorageHost.startsWith("http://")) {
            this.performanceDataStorageHost = "http://" + this.performanceDataStorageHost;
        }

        axios.request<string[]>({
            url: this.performanceDataStorageHost + "/tests/running",
        }).then((response) => {
            this.setState({runningTests: response.data});
        }).catch((error) => {
                console.error("Error: " + error + " for url: " + this.performanceDataStorageHost + "/tests/running");
            },
        );
        axios.request<string[]>({
            url: this.performanceDataStorageHost + "/tests/finished",
        }).then((response) => {
            this.setState({finishedTests: response.data});
            if (this.props.id) {
                // make sure we do not keep loading the same ID
                if (!this.currentId || this.currentId !== this.props.id) {
                    this.currentId = this.props.id;
                    this.renderMqttWorker(this.props.id.toString(), !this.isIncluded(this.props.id, response.data));
                    // mqttworker needs to be re-created
                    this.forceUpdate();
                }
            }
        }).catch((error) => {
                console.error("Error: " + error + " for url: " + this.performanceDataStorageHost + "/tests/finished");
            },
        );
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

    private import() {
        axios.get<any>(this.performanceDataStorageHost
            + "/test/" + this.state.currentId).then((response) => {
            this.props.importTestConfig(JSON.parse(response.data.testConfig));
        }).catch((e) => alert(e));

    }
}

export default Evaluation;
