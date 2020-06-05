import {plainToClassFromExist} from "class-transformer";
import React from "react";
import ReactTooltip from "react-tooltip";
import "./Testconfig.css";

interface IState {
    activeInstancesPerSecond: string;
    maximumConcurrentRequests: string;
    name: string;
    noSession: boolean;
    repeat: string;
    scaleFactor: string;
    requestDurationThreshold: number;
}
/*tslint:disable:no-console*/
export class Testconfig extends React.Component<{}, IState> {
    constructor(props: any) {
        super(props);

        this.state = {
            activeInstancesPerSecond : localStorage.getItem("activeInstancesPerSecond") || "",
            maximumConcurrentRequests : localStorage.getItem("maximumConcurrentRequests") || "",
            name : localStorage.getItem("name") || "",
            noSession: localStorage.getItem("maximumConcurrentRequests") === "true",
            repeat : localStorage.getItem("repeat") || "",
            requestDurationThreshold : +(localStorage.getItem("requestDurationThreshold") || "-1"),
            scaleFactor : localStorage.getItem("scaleFactor") || "",
        };
    }

    public inputChanged = (event: React.FormEvent<HTMLInputElement>) => {
        console.log(event.currentTarget.name + " is " + event.currentTarget.value);
        localStorage.setItem(event.currentTarget.name, event.currentTarget.value + "");
        this.setState({
            activeInstancesPerSecond : localStorage.getItem("activeInstancesPerSecond") || "",
            maximumConcurrentRequests : localStorage.getItem("maximumConcurrentRequests") || "",
            name : localStorage.getItem("name") || "",
            noSession : localStorage.getItem("noSession") === "true",
            repeat : localStorage.getItem("repeat") || "",
            requestDurationThreshold : +(localStorage.getItem("requestDurationThreshold") || "-1"),
            scaleFactor : localStorage.getItem("scaleFactor") || "",
        });
    }

    public import(state: any) {
        this.setState(plainToClassFromExist(this.state, state));
    }

    public export = (): IState => {
        return this.state;
    }

    public render() {
        return (
            <div className="testconfig">
                <ReactTooltip />
                <h1>Test Configuration</h1>
                <div className="row">
                    <div className="col-25">
                        <label data-tip="How often the test is repeated"
                            htmlFor="repeat">Repeat</label>
                    </div>
                    <div className="col-75">
                        <input
                            onChange={this.inputChanged}
                            type="text"
                            id="repeat"
                            name="repeat"
                            value={this.state.repeat}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-25">
                        <label data-tip="Scale the whole test load by a factor"
                            htmlFor="scaleFactor">Scale Factor</label>
                    </div>
                    <div className="col-75">
                        <input
                            onChange={this.inputChanged}
                            type="text"
                            id="scaleFactor"
                            name="scaleFactor"
                            value={this.state.scaleFactor}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-25">
                        <label data-tip="Number of simulated users per second"
                               htmlFor="activeInstancesPerSecond">Active Users per Second</label>
                    </div>
                    <div className="col-75">
                        <input
                            onChange={this.inputChanged}
                            type="text"
                            id="activeInstancesPerSecond"
                            name="activeInstancesPerSecond"
                            value={this.state.activeInstancesPerSecond}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-25">
                        <label data-tip="Maximum number of requests which are sent at the same time"
                            htmlFor="maximumConcurrentRequests">Maximum Concurrent Requests</label>
                    </div>
                    <div className="col-75">
                        <input
                            onChange={this.inputChanged}
                            type="text"
                            id="maximumConcurrentRequests"
                            name="maximumConcurrentRequests"
                            value={this.state.maximumConcurrentRequests}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-25">
                        <label data-tip="Requests which take longer than this in milliseconds fail an implicit assertion. Also, if this test is used in CLI mode, this influences the return code. Set to -1 to never apply."
                            htmlFor="requestDurationThreshold">Maximum request duration</label>
                    </div>
                    <div className="col-75">
                        <input
                            onChange={this.inputChanged}
                            type="text"
                            id="requestDurationThreshold"
                            name="requestDurationThreshold"
                            value={this.state.requestDurationThreshold}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-25">
                        <label data-tip="(Optional) name for this test. Will be shown in the evaluation view when test is running or finished."
                            htmlFor="name">Test name</label>
                    </div>
                    <div className="col-75">
                        <input
                            onChange={this.inputChanged}
                            type="text"
                            id="name"
                            name="name"
                            value={this.state.name}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col-25">
                        <label htmlFor="noSession">Global Session Pooling enabled</label>
                    </div>
                    <div className="col-75">
                        <input
                            onChange={this.toggleNoSession}
                            type="checkbox"
                            id="noSession"
                            name="noSession"
                            checked={this.state.noSession}
                        />
                        <label htmlFor="noSession"></label>
                    </div>
                </div>
            </div>
        );
    }

    private toggleNoSession = (): void => {
        const oldValue = this.state.noSession;
        this.setState({noSession: !this.state.noSession});
        localStorage.setItem("noSession", "" + !oldValue);
    }
}
