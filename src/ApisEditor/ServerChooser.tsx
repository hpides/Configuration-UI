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
            selectedServer
        };
    }

    public inputChanged = (event: any) => {

        /*switch (event.currentTarget.name) {
            case "other_textfield":
                this.setState({key: event.currentTarget.value});
                break;
            case "generator":
                switch (event.currentTarget.value) {
                    case "RANDOM_STRING":
                        this.setState({genConfig: new RandomStringGeneratorConfig(this.props.disableDeleteKey,
                                this.props.enableDeleteKey)});
                        break;
                    case "RANDOM_SENTENCE":
                        this.setState({genConfig: new RandomSentence(this.props.disableDeleteKey,
                                this.props.enableDeleteKey)});
                        break;
                    case "EXISTING":
                        const config = new ExistingDataConfig(this.props.disableDeleteKey,
                            this.props.enableDeleteKey);
                        this.setState({genConfig: config});
                        break;
                }
                break;
        }*/

    }

    public keyPressed = (event: React.KeyboardEvent) => {
        if (event.key === "Enter") {
            this.doneButtonClicked();
        }
    }

    public doneButtonClicked = () => {
        this.props.onAdd("");
    }

    public cancelButtonClicked = () => {
        this.props.onCancel();
    }

    public render() {
        let servers: JSX.Element[] = [];
        for (const server of this.props.servers) {
            servers.push(<label><input
                type="radio"
                name="SERVER"
                value={server}
            />{server}</label>);
        }
        return (
            <div className="generator-adder-container">
                <div className="generator-adder-background"/>
                <div className="generator-adder">
                    <fieldset>
                        {servers}
                        <input
                            type="radio"
                            name="SERVER"
                            value="OTHER"
                        />
                            <input type="text"
                                name="key"
                                onChange={this.inputChanged}
                                onKeyPress={this.keyPressed}
                                value={this.state.selectedServer}
                            />
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
