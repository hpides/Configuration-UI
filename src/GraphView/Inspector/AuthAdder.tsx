import React from "react";
import "./AuthAdder.css";

interface IBasicAuth {
    user: string;
    password: string;
}

interface IProps {
    onAdd: (user: string, password: string) => void;
    onCancel: () => void;
    auth: IBasicAuth;
    disableDeleteKey: () => void;
    enableDeleteKey: () => void;
}

interface IState {
    user: string;
    password: string;
}

export class AuthAdder extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props);

        if (this.props.auth) {
            this.state = {
                password: this.props.auth.password,
                user: this.props.auth.user,
            };
        } else {
            this.state = {
                password: "",
                user: "",
            };
        }
    }

    public inputChanged = (event: any) => {

        switch (event.currentTarget.name) {
            case "user":
                this.setState({user: event.currentTarget.value});
                break;
            case "password":
                this.setState({password: event.currentTarget.value});
                break;
        }

    }

    public keyPressed = (event: React.KeyboardEvent) => {
        if (event.key === "Enter") {
            this.doneButtonClicked();
        }
    }

    public doneButtonClicked = () => {
        this.props.onAdd(this.state.user, this.state.password);
    }

    public cancelButtonClicked = () => {
        this.props.onCancel();
    }

    public render() {

        return (
            <div className="auth-adder-container">
                <div className="auth-adder-background"></div>
                <div className="auth-adder">
                    <label>User</label>
                    <input
                        type="text"
                        name="user"
                        onChange={this.inputChanged}
                        onKeyPress={this.keyPressed}
                        onFocus={this.props.disableDeleteKey} onBlur={this.props.enableDeleteKey}
                        value={this.state.user}
                    />
                    <label>Password</label>
                    <input
                        type="text"
                        name="password"
                        onChange={this.inputChanged}
                        onKeyPress={this.keyPressed}
                        onFocus={this.props.disableDeleteKey} onBlur={this.props.enableDeleteKey}
                        value={this.state.password}
                    />
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
