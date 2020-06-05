import axios from "axios";
import React, {Component} from "react";
import {Alert} from "reactstrap";
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
    pdsIsUp: boolean;
}
/*tslint:disable:no-console*/
export class Evaluation extends Component<IProps, IAppState> {
    private interval: any = null;

    private currentId?: string = undefined;

    private performanceDataStorageHost: string | null;
    
    private alreadyLoadingTests: number = 0;
    
    public constructor(props: IProps) {
        super(props);
        this.performanceDataStorageHost = null;
        this.state = {currentId: null, currentIdIsRunning: false, finishedTests: [], runningTests: [], pdsIsUp: false};
    }

    public componentDidMount() {
        this.performanceDataStorageHost = process.env.REACT_APP_PDS_HOST || window.location + "/pds";
        this.loadTests();
        this.interval = setInterval(() => this.loadTests(), 2000);
    }

    public componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    public update() {
        // if this component was started with this ID, we can assume that the corresponding test is still running
        if (this.props.id) {
            this.renderMqttWorker(this.props.id, true);
        } else {
            this.setState({runningTests: [], finishedTests: []});
        }
    }

    public render() {
        let pdsIsDown = <div/>;
        if (!this.state.pdsIsUp) {
            pdsIsDown = <Alert className={"alert alert-danger"}>
                Warning: performance data storage is down.
                Recorded times and configurations will be lost as soon as "Back to overview" is clicked,
                make sure to download created reports.
            </Alert>;
        }
        let ret: any;
        if (this.state && this.state.currentId) {
            // re-renders when key is changed
            ret = <div className={"text-center"}>
                {pdsIsDown}
                <button style={{display: "inline"}} onClick={(event: any) => this.back()}>Back to overview</button>
                <button style={{display: "inline"}} onClick={(event: any) => this.import()}
                >Import config of test</button>
                <MqttWorker testId={this.state.currentId} isRunning={this.state.currentIdIsRunning}
                            key={this.state.currentId}/>
            </div>;
        } else {
            ret = <div className="Evaluation multiColumnDiv">
                {pdsIsDown}
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
        // make sure not to start processing this method when responses are still outstanding. Else one would
        // effectively stresstest performance data storage
        if (this.alreadyLoadingTests > 0) {
            return;
        }
        this.alreadyLoadingTests = 2;
        // user might not have prefixed host with http://
        if (this.performanceDataStorageHost && !this.performanceDataStorageHost.startsWith("http://")) {
            this.performanceDataStorageHost = "http://" + this.performanceDataStorageHost;
        }

        axios.request<string[]>({
            url: this.performanceDataStorageHost + "/tests/running",
        }).then((response) => {
            this.setState({runningTests: response.data, pdsIsUp: true});
        }).catch((error) => {
                console.error("Error: " + error + " for url: " + this.performanceDataStorageHost + "/tests/running");
                this.setState({pdsIsUp: false});
            },
        ).finally(() => {
            // no need to synchronise, since no parallel threads are used
            this.alreadyLoadingTests--;
        });
        axios.request<string[]>({
            url: this.performanceDataStorageHost + "/tests/finished",
        }).then((response) => {
            this.setState({finishedTests: response.data, pdsIsUp: true});
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
                this.setState({pdsIsUp: false});
            },
        ).finally(() => {
            // no need to synchronise, since no parallel threads are used
            this.alreadyLoadingTests--;
        });;
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
