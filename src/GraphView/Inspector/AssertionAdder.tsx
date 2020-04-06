import React from "react";
import {
    AssertionConfig,
    ContentNotEmptyAssertion,
    ContentTypeAssertion,
    JSONPATHAssertion, ResponseCodeAssertion,
    XPATHAssertion} from "./AssertionConfig";
import "./GeneratorAdder.css";

interface IProps {
    onAdd: (assertionConfig: AssertionConfig) => void;
    onCancel: () => void;
    disableDeleteKey: () => void;
    enableDeleteKey: () => void;
    assertion: AssertionConfig | null;
}

interface IState {
    name: string;
    assertionConfig: AssertionConfig;
}

export class AssertionAdder extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props);

        let assertionConfig: AssertionConfig = new ResponseCodeAssertion(
            this.props.disableDeleteKey,
            this.props.enableDeleteKey,
            "",
            () => this.forceUpdate(),
            this.assertionChanged,
        );
        let name = "";

        if (this.props.assertion) {
            assertionConfig = this.props.assertion;
            name = this.props.assertion.name;
        }

        this.state = {
            assertionConfig,
            name,
        };
    }

    public assertionChanged = (assertion: AssertionConfig) => {
        this.setState({assertionConfig: assertion});
    }

    public inputChanged = (event: any) => {

        switch (event.currentTarget.name) {
            case "name":
                this.setState({name: event.currentTarget.value});
                const assertionConfig = this.state.assertionConfig;
                assertionConfig.setAttribute(event.currentTarget.name, event.currentTarget.value);
                this.setState({assertionConfig});
                break;
            // forceUpdate is wrapped in lambda, since else the "this" context would be different
            case "generator":
                switch (event.currentTarget.value) {
                    case "RESPONSE_CODE":
                        this.setState({assertionConfig: new ResponseCodeAssertion(
                            this.props.disableDeleteKey,
                            this.props.enableDeleteKey,
                            this.state.name,
                            () => this.forceUpdate(),
                            this.assertionChanged,
                        )});
                        break;
                    case "CONTENT_NOT_EMPTY":
                        this.setState({assertionConfig: new ContentNotEmptyAssertion(
                            this.props.disableDeleteKey,
                            this.props.enableDeleteKey,
                            this.state.name,
                            () => this.forceUpdate(),
                            this.assertionChanged,
                        )});
                        break;
                    case "CONTENT_TYPE":
                        this.setState({assertionConfig: new ContentTypeAssertion(
                            this.props.disableDeleteKey,
                            this.props.enableDeleteKey,
                            this.state.name,
                            () => this.forceUpdate(),
                            this.assertionChanged,
                        )});
                        break;
                    case "XPATH":
                        this.setState({assertionConfig: new XPATHAssertion(
                            this.props.disableDeleteKey,
                            this.props.enableDeleteKey,
                            this.state.name,
                            () => this.forceUpdate(),
                            this.assertionChanged,
                        )});
                        break;
                    case "JSONPATH":
                        this.setState({assertionConfig: new JSONPATHAssertion(
                            this.props.disableDeleteKey,
                            this.props.enableDeleteKey,
                            this.state.name,
                            () => this.forceUpdate(),
                            this.assertionChanged,
                        )});
                        break;
                }
                break;
        }
    }

    public keyPressed = (event: React.KeyboardEvent) => {
        if (event.key === "Enter") {
            this.doneButtonClicked();
        }
    }

    public doneButtonClicked = () => {
        this.props.onAdd(this.state.assertionConfig);
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
                <div className="generator-adder-background"/>
                <div className="generator-adder">
                    <div className="generator-meta">
                        <div>
                            <label>Name</label>
                            <input
                                onFocus={this.props.disableDeleteKey}
                                onBlur={this.props.enableDeleteKey}
                                type="text"
                                name="name"
                                onChange={this.inputChanged}
                                onKeyPress={this.keyPressed}
                                value={this.state.name}/>
                        </div>
                        <div>
                            <div className="select-wrapper">
                                <select
                                    name="generator"
                                    value={this.state.assertionConfig.type}
                                    className="generator-adder-select"
                                    onChange={this.inputChanged}
                                >
                                    <option value="RESPONSE_CODE">Response Code</option>
                                    <option value="CONTENT_NOT_EMPTY">Content not empty</option>
                                    <option value="CONTENT_TYPE">Content type</option>
                                    <option value="XPATH">XPATH</option>
                                    <option value="JSONPATH">JSONPATH</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <br/>
                    {this.state.assertionConfig.render(this.keyPressed)}
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
