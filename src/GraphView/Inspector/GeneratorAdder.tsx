import React from "react";
import "./GeneratorAdder.css";
import { GeneratorConfig } from "./GeneratorConfig";
import { RandomStringGeneratorConfig } from "./GeneratorConfig";
import { RandomSentence } from "./GeneratorConfig";
import { ExistingDataConfig } from "./GeneratorConfig";
import {ExistingConfigComponent} from "../../ExistingConfig/existingConfigComponent";

interface IProps {
    onAdd: (key: string[], genConfig: GeneratorConfig) => void;
    onCancel: () => void;
    disableDeleteKey: () => void;
    enableDeleteKey: () => void;
    generator: {key: string, genConfig: GeneratorConfig} | null;
    existingConfig: ExistingConfigComponent
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
            genConfig,
            key,
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
        }

    }

    public generatorChanged = (event: React.FormEvent<HTMLInputElement>) => {

        const genConfig = this.state.genConfig;
        genConfig.setAttribute(event.currentTarget.name, event.currentTarget.value);
        this.setState({
            genConfig,
        });

    }

    public doneButtonClicked = () => {
        if(this.state.genConfig.getTypeString()!=="EXISTING") {
            this.props.onAdd([this.state.key], this.state.genConfig);
            // left menu --> should be allowed to delete again
            this.props.enableDeleteKey();
        }
        else{
            const config = (this.state.genConfig as ExistingDataConfig);
            const wantedTable = config.getAttribute("table");
            let wantedFields:string[] = [];
            if(this.props.existingConfig.state.allTables.has(wantedTable)) {
                this.props.existingConfig.state.uploadedFiles.forEach((file)=> {
                    file.tableMapping.forEach((fields, table) => {
                        console.log(table);
                        if(table === wantedTable){
                            wantedFields = fields
                        }
                    })
                });
                this.props.onAdd(wantedFields, this.state.genConfig);

                // left menu --> should be allowed to delete again
                this.props.enableDeleteKey();
            }
            else{
                alert("Table \""+wantedTable+"\" not known!");
            }
        }
    };

    public cancelButtonClicked = () => {
        // left menu --> should be allowed to delete again
        this.props.enableDeleteKey();
        this.props.onCancel();
    }

    public render() {
        let nameInput = <div/>;
        if(this.state.genConfig.getTypeString() !== "EXISTING"){
            nameInput = <input
                type="text"
                name="key"
                onChange={this.inputChanged}
                onFocus={this.props.disableDeleteKey} onBlur={this.props.enableDeleteKey}
                value={this.state.key}
            />;
        }
        return (
            <div className="generator-adder-container">
                <div className="generator-adder-background"/>
                <div className="generator-adder">
                    <div className="generator-meta">
                        <div>
                            <label>Key</label>
                            {nameInput}
                        </div>
                        <div>
                            <div className="select-wrapper">
                                <select
                                    name="generator"
                                    className={"generator-adder-select"}
                                    value={this.state.genConfig.getTypeString()}
                                    onChange={this.inputChanged}
                                >
                                    <option value="RANDOM_STRING">Random String</option>
                                    <option value="RANDOM_SENTENCE">Random Sentence</option>
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
