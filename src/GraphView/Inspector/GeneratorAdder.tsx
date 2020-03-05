import React from "react";
import "./GeneratorAdder.css";
import { GeneratorConfig } from "./GeneratorConfig";
import { RandomStringGeneratorConfig } from "./GeneratorConfig";
import { EMailGeneratorConfig } from "./GeneratorConfig";
import { ExistingDataConfig } from "./GeneratorConfig";

interface IProps {
    onAdd: (key: string, genConfig: GeneratorConfig) => void;
    onCancel: () => void;
    disableDeleteKey: () => void;
    enableDeleteKey: () => void;
    generator: {key: string, genConfig: GeneratorConfig} | null;
}

interface IState {
    key: string;
    genConfig: GeneratorConfig;
}

export class GeneratorAdder extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props);

        let genConfig = new RandomStringGeneratorConfig(this.props.disableDeleteKey, this.props.enableDeleteKey);
        let key = "";

        if (this.props.generator) {
            genConfig = this.props.generator.genConfig;
            key = this.props.generator.key;
        }

        this.state = {
            genConfig: genConfig,
            key: key,
        };
    }

    public inputChanged = (event: any) => {

        switch (event.currentTarget.name) {
            case "key":
                this.setState({key: event.currentTarget.value});
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

    public generatorChanged = (event: React.FormEvent<HTMLInputElement>) => {

        const genConfig = this.state.genConfig;
        genConfig.setAttribute(event.currentTarget.name, event.currentTarget.value)
        this.setState({
            genConfig: genConfig
        });

    }

    public doneButtonClicked = () => {
        this.props.onAdd(this.state.key, this.state.genConfig);
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
                    <div className="generator-meta">
                        <div>
                            <label>Key</label>
                            <input
                                type="text"
                                name="key"
                                onChange={this.inputChanged}
                                onFocus={this.props.disableDeleteKey} onBlur={this.props.enableDeleteKey}
                                value={this.state.key}
                            />
                        </div>
                        <div>
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
                        </div>
                    </div>
                    {this.state.genConfig.render(this.generatorChanged)}
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
