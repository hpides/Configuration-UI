import React from "react";
import "./GeneratorAdder.css";
import { GeneratorConfig } from "./GeneratorConfig";
import { RandomStringGeneratorConfig } from "./GeneratorConfig";
import { EMailGeneratorConfig } from "./GeneratorConfig";
import { ExistingDataConfig } from "./GeneratorConfig";

interface IProps {
    onAdd: (name: string, genConfig: GeneratorConfig) => void;
    onCancel: () => void;
    disableDeleteKey: () => void;
    enableDeleteKey: () => void;
}

interface IState {
    name: string;
    genConfig: GeneratorConfig;
}

export class GeneratorAdder extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props);

        this.state = {
            genConfig: new RandomStringGeneratorConfig(this.props.disableDeleteKey, this.props.enableDeleteKey),
            name: "",
        };
    }

    public inputChanged = (event: any) => {

        switch (event.currentTarget.name) {
            case "name":
                this.setState({name: event.currentTarget.value});
                break;
            case "generator":
                switch (event.currentTarget.value) {
                    case "RANDOM_STRING":
                        this.setState({genConfig: new RandomStringGeneratorConfig(this.props.disableDeleteKey,
                                this.props.enableDeleteKey)});
                        break;
                    case "E_MAIL":
                        this.setState({genConfig: new EMailGeneratorConfig(this.props.disableDeleteKey,
                                this.props.enableDeleteKey)});
                        break;
                    case "EXISTING":
                        this.setState({genConfig: new ExistingDataConfig(this.props.disableDeleteKey,
                                this.props.enableDeleteKey)});
                        break;
                }
                break;
        }

    }

    public doneButtonClicked = () => {
        this.props.onAdd(this.state.name, this.state.genConfig);
        // left menu --> should be allowed to delete again
        this.props.enableDeleteKey();
    }

    public cancelButtonClicked = () => {
        // left menu --> should be allowed to delete again
        this.props.enableDeleteKey();
        this.props.onCancel();
    }

    public render() {

        return (
            <div className="generator-adder-container">
                <div className="generator-adder-background"></div>
                <div className="generator-adder">
                    <label>Name</label>
                    <input
                        type="text"
                        name="name"
                        onChange={this.inputChanged}
                        onFocus={this.props.disableDeleteKey} onBlur={this.props.enableDeleteKey}
                    />
                    <div className="select-wrapper">
                        <select
                            name="generator"
                            value={this.state.genConfig.getTypeString()}
                            onChange={this.inputChanged}
                        >
                            <option value="RANDOM_STRING">Random String</option>
                            <option value="E_MAIL">E-Mail</option>
                            <option value="EXISTING">Existing Data</option>
                        </select>
                    </div>
                    {this.state.genConfig.render()}
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
