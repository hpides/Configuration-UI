import React from 'react';
import './Sidebar.css';
import { Views } from '../Views';

interface Props {
    currentView: Views,
    changeView: (view: Views) => void
}

interface State {}

export class Sidebar extends React.Component<Props, State> {
    changeView = (event: React.MouseEvent<HTMLButtonElement>) => {
        let nextView;
        switch(event.currentTarget.getAttribute("name")) {
            case "apis":
                nextView = Views.Apis;
                break;
            case "testconfig":
                nextView = Views.Testconfig;
                break;
            case "userstories":
                nextView = Views.UserStories;
                break;
            default:
                nextView = Views.Apis;
                break;
        }
        this.props.changeView(nextView);
    }

    startTest = () => {

    }

    render() {
        let cv = this.props.currentView;
        return (
            <div className="sidebar">
                <div className="view-select">
                    <button
                        name="apis"
                        className={cv === Views.Apis ? "active" : ""}
                        onClick={this.changeView}
                    >Apis</button>
                    <button
                        name="testconfig"
                        className={cv === Views.Testconfig ? "active" : ""}
                        onClick={this.changeView}
                    >Testconfig</button>
                    <button
                        name="userstories"
                        className={cv === Views.UserStories ? "active" : ""}
                        onClick={this.changeView}
                    >UserStories</button>
                </div>

                <div id="start-test-button">
                    <button
                        onClick={this.startTest}
                    >Start Test</button>
                </div>
            </div>
        );
    }
}