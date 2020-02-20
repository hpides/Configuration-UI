import React from "react";
import "./Testconfig.css";
import {plainToClass, plainToClassFromExist} from "class-transformer";

interface IState {
    activeInstancesPerSecond: string;
    maximumConcurrentRequests: string;
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
            repeat : localStorage.getItem("repeat") || "",
            scaleFactor : localStorage.getItem("scaleFactor") || "",
        };
    }

    public inputChanged = (event: React.FormEvent<HTMLInputElement>) => {
        localStorage.setItem(event.currentTarget.name, event.currentTarget.value);
        this.setState({
            activeInstancesPerSecond : localStorage.getItem("activeInstancesPerSecond") || "",
            maximumConcurrentRequests : localStorage.getItem("maximumConcurrentRequests") || "",
            repeat : localStorage.getItem("repeat") || "",
            scaleFactor : localStorage.getItem("scaleFactor") || "",
        });
    };

    public import(state: any){
        this.setState(plainToClassFromExist(this.state, state))
    }

    public export= ():IState =>{
        return this.state
    };

    public render() {
        return (
            <div className="testconfig">
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
                        <label htmlFor="activeInstancesPerSecond">Requests per second</label>
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
            </div>
        );
    }
}
