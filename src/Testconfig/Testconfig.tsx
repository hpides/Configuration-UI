import React from "react";
import "./Testconfig.css";

interface IState {
    repeat: string;
    sfactor: string;
    rpsec: string;
}
/*tslint:disable:no-console*/
export class Testconfig extends React.Component<{}, IState> {
    constructor(props: any) {
        super(props);

        this.state = {
            repeat : localStorage.getItem("repeat") || "",
            rpsec : localStorage.getItem("rpsec") || "",
            sfactor : localStorage.getItem("sfactor") || "",
        };
    }

    public inputChanged = (event: React.FormEvent<HTMLInputElement>) => {
        localStorage.setItem(event.currentTarget.name, event.currentTarget.value);
        this.setState({
            repeat : localStorage.getItem("repeat") || "",
            rpsec : localStorage.getItem("rpsec") || "",
            sfactor : localStorage.getItem("sfactor") || "",
        });
    }
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
                        <label htmlFor="sfactor">Scale Factor</label>
                    </div>
                    <div className="col-75">
                        <input
                            onChange={this.inputChanged}
                            type="text"
                            id="sfactor"
                            name="sfactor"
                            value={this.state.sfactor}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-25">
                        <label htmlFor="rpsec">Requests per second</label>
                    </div>
                    <div className="col-75">
                        <input
                            onChange={this.inputChanged}
                            type="text"
                            id="rpsec"
                            name="rpsec"
                            value={this.state.rpsec}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
