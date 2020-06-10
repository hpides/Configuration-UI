import React from "react";
import "./ServerChooser.css";

interface IProps {
    servers: string[];
    selectedServer: string | null;
    onAdd: (server: string) => void;
    onCancel: () => void;
}

interface IState {
    selectedServer: string;
}

export class ServerChooser extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props);

        let selectedServer = "";

        if (this.props.selectedServer) {
            selectedServer = this.props.selectedServer;
        }

        this.state = {
            selectedServer,
        };
    }

    public radioChanged = (event: React.FormEvent<HTMLInputElement>) => {
        if (event.currentTarget.value === "OTHER") {
            this.setState({selectedServer: ""});
        } else {
            this.setState({selectedServer: event.currentTarget.value});
        }
    }

    public inputChanged = (event: any) => {

        this.setState({selectedServer: event.currentTarget.value});

    }

    public keyPressed = (event: React.KeyboardEvent) => {
        if (event.key === "Enter") {
            this.doneButtonClicked();
        }
    }

    public doneButtonClicked = () => {
        this.props.onAdd(this.state.selectedServer);
    }

    public cancelButtonClicked = () => {
        this.props.onCancel();
    }

    public render() {
        const servers: JSX.Element[] = [];
        for (const server of this.props.servers) {
            servers.push(<li><input
                type="radio"
                name="SERVER"
                value={server}
                id={"radio-" + server}
                onChange={this.radioChanged}
            /><label htmlFor={"radio-" + server}>{server}</label></li>);
        }
        return (
            <div className="generator-adder-container">
                <div className="generator-adder-background"/>
                <div className="generator-adder">
                    <h3>Choose Server</h3>
                    <p>Choose which server to use for this API or enter a URL</p>
                    <fieldset className="server-list">
                        <ul>
                            {servers}

                        <li><input
                            type="radio"
                            name="SERVER"
                            value="OTHER"
                            checked={!this.props.servers.includes(this.state.selectedServer)}
                            onChange={this.radioChanged}
                        />
                            <input type="text"
                                name="key"
                                onChange={this.inputChanged}
                                onKeyPress={this.keyPressed}
                                placeholder="Custom..."
                                value={
                                    !this.props.servers.includes(this.state.selectedServer)
                                        ? this.state.selectedServer
                                        : ""
                                }
                            /></li>
                        </ul>
                    </fieldset>
                    <button
                        onClick={this.doneButtonClicked}
                    >Add</button>
                    <button
                        onClick={this.cancelButtonClicked}
                    >Cancel</button>
                </div>
            </div>
        );
    }
}
