import React, {FormEvent} from "react";
import { Views } from "../Views";
import "./Sidebar.css";

interface IState {
    stories: string[];
    activeStory: string | null;
    currentlyAddStory: string;
}

interface IProps {
    currentView: Views;
    changeView: (view: Views, story: string | null) => void;
}

export class Sidebar extends React.Component<IProps, IState> {

    public constructor(props: IProps) {
        super(props);
        this.state = {
            activeStory: null,
            currentlyAddStory: "enter story name",
            stories: [],
        };
    }

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
        this.props.changeView(nextView, this.state.activeStory);
    }

    public addStory = (story: string) => {
        this.state.stories.push(story);
        this.setState({stories: this.state.stories});
    }

    public handleInput = (event: React.FormEvent<HTMLInputElement>): void => {
        this.setState({currentlyAddStory: event.currentTarget.value});
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
                {
                    this.state.stories.map((story) =>
                        <div key={story}>
                            <button  className={story === this.state.activeStory ? "active story-button" : "story-button"} onClick={(event) => this.changeActiveStory(story)}>{story}</button>
                            <br/>
                            <br/>
                            <br/>
                            <br/>
                        </div>
                    )
                }
                <input type="text" value={this.state.currentlyAddStory} onChange={this.handleInput} className="newStoryTextField"/> <button onClick={(event) => this.addStory(this.state.currentlyAddStory)}>Add story</button>
            </div>
        );
    }

    private changeActiveStory(newStory: string) {
        this.setState({activeStory: newStory});
        this.props.changeView(Views.UserStories, newStory);
    }
}
