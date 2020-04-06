import {plainToClassFromExist} from "class-transformer";
import React from "react";
import ReactTooltip from "react-tooltip";
import "./Testconfig.css";

interface IState {
    activeInstancesPerSecond: string;
    maximumConcurrentRequests: string;
    noSession: boolean;
    repeat: string;
    scaleFactor: string;
}
/*tslint:disable:no-console*/
export class Testconfig extends React.Component<{}, IState> {
    constructor(props: any) {
        super(props);

        this.state = {
            activeInstancesPerSecond : localStorage.getItem("activeInstancesPerSecond") || "",
            maximumConcurrentRequests : localStorage.getItem("maximumConcurrentRequests") || "",
            noSession: localStorage.getItem("maximumConcurrentRequests") === "true",
            repeat : localStorage.getItem("repeat") || "",
            scaleFactor : localStorage.getItem("scaleFactor") || "",
        };
    }

    public inputChanged = (event: React.FormEvent<HTMLInputElement>) => {
        console.log(event.currentTarget.name + " is " + event.currentTarget.value);
        localStorage.setItem(event.currentTarget.name, event.currentTarget.value + "");
        this.setState({
            activeInstancesPerSecond : localStorage.getItem("activeInstancesPerSecond") || "",
            maximumConcurrentRequests : localStorage.getItem("maximumConcurrentRequests") || "",
            noSession : localStorage.getItem("noSession") === "true",
            repeat : localStorage.getItem("repeat") || "",
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
                <h1>Testconfig</h1>
                <div className="row">
                    <div className="col-25">
                        <label htmlFor="repeat">Repeat</label>
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
                        <label htmlFor="scaleFactor">Scale Factor</label>
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
                        <label data-tip="Number of simulated users per second" htmlFor="activeInstancesPerSecond">Active users per second</label>
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
                        <label htmlFor="maximumConcurrentRequests">Maximum Concurrent Requests</label>
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
                        <label htmlFor="noSession">Global session pooling disabled</label>
                    </div>
                    <div className="col-75">
                        <input
                            onChange={this.toggleNoSession}
                            type="checkbox"
                            id="noSession"
                            name="noSession"
                            checked={this.state.noSession}
                        />
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
