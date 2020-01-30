import React from 'react'
import './GeneratorAdder.css'
import { GeneratorConfig } from './GeneratorConfig';
import { RandomStringGeneratorConfig } from './RandomStringGeneratorConfig';
import { EMailGeneratorConfig } from './EMailGeneratorConfig';

interface Props {
    onAdd: (name: string, genConfig: GeneratorConfig) => void,
    onCancel: () => void,
}

interface State {
    name: string,
    genConfig: GeneratorConfig
}

export class GeneratorAdder extends React.Component<Props, State> {
    constructor(props: any) {
        super(props);

        this.state = {
            name: "",
            genConfig: new RandomStringGeneratorConfig(),
        }
    }

    inputChanged = (event: any) => {
        
        switch (event.currentTarget.name) {
            case "name":
                this.setState({name: event.currentTarget.value});
                break;
            case "generator":
                switch (event.currentTarget.value) {
                    case "RANDOM_STRING":
                        this.setState({genConfig: new RandomStringGeneratorConfig()});
                        break;
                    case "E_MAIL":
                        this.setState({genConfig: new EMailGeneratorConfig()});
                        break;
                }
                break;
        }

    }

    doneButtonClicked = () => {
        this.props.onAdd(this.state.name, this.state.genConfig);
    }

    cancelButtonClicked = () => {
        this.props.onCancel();
    }

    render() {
        
        return (
            <div className="generator-adder-container">
                <div className="generator-adder-background"></div>
                <div className="generator-adder">
                    <label>Name</label>
                    <input
                        type="text"
                        name="name"
                        onChange={this.inputChanged}
                    />
                    <select
                        name="generator"
                        value={this.state.genConfig.getTypeString()}
                        onChange={this.inputChanged}
                    >
                        <option value="RANDOM_STRING">Random String</option>
                        <option value="E_MAIL">E-Mail</option>
                    </select>
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