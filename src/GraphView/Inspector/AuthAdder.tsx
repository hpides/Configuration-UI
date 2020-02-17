import React from 'react'
import './AuthAdder.css'

interface IBasicAuth {
    user: string;
    password: string;
}

interface Props {
    onAdd: (user: string, password: string) => void,
    onCancel: () => void,
    auth: IBasicAuth,
}

interface State {
    user: string,
    password: string,
}

export class AuthAdder extends React.Component<Props, State> {
    constructor(props: any) {
        super(props);

        if (this.props.auth) {
            this.state = {
                user: this.props.auth.user,
                password: this.props.auth.password
            }
        } else {
            this.state = {
                user: "",
                password: ""
            }
        }
    }

    inputChanged = (event: any) => {
        
        switch (event.currentTarget.name) {
            case "user":
                this.setState({user: event.currentTarget.value});
                break;
            case "password":
                this.setState({password: event.currentTarget.value});
                break;
        }

    }

    doneButtonClicked = () => {
        this.props.onAdd(this.state.user, this.state.password);
    }

    cancelButtonClicked = () => {
        this.props.onCancel();
    }

    render() {
        
        return (
            <div className="auth-adder-container">
                <div className="auth-adder-background"></div>
                <div className="auth-adder">
                    <label>User</label>
                    <input
                        type="text"
                        name="user"
                        onChange={this.inputChanged}
                        value={this.state.user}
                    />
                    <label>Password</label>
                    <input
                        type="text"
                        name="password"
                        onChange={this.inputChanged}
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