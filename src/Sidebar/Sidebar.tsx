import React from "react";
import { Views } from "../Views";
import "./Sidebar.css";

interface IProps {
    currentView: Views;
    changeView: (view: Views) => void;
}

export class Sidebar extends React.Component<IProps, {}> {
    public changeView = (event: React.MouseEvent<HTMLButtonElement>) => {
        let nextView;
        switch (event.currentTarget.getAttribute("name")) {
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
    public render() {
        const cv = this.props.currentView;
        return (
            <div className="sidebar">
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
        );
    }
}
