import React from 'react'
import './GeneratorAdder.css'
import { GeneratorConfig } from './GeneratorConfig';

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
            genConfig: new GeneratorConfig(),
        }
    }

    inputChanged = (event: React.FormEvent<HTMLInputElement>) => {
        
        switch (event.currentTarget.name) {
            case "name":
                this.setState({name: event.currentTarget.value});
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