import React, {FormEvent} from "react";
import { Views } from "../Views";
import "./Sidebar.css";

interface IState {
    stories: string[];
    activeStory: string | null;
}

interface IProps {
    currentView: Views;
    changeView: (view: Views, story: string | null) => void;
    renameStory: (oldName: string, newName: string) => void;
}

export class Sidebar extends React.Component<IProps, IState> {

    public constructor(props: IProps) {
        super(props);
        this.state = {
            activeStory: null,
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
            case "evaluation":
                nextView = Views.Evaluation;
                break;
            default:
                nextView = Views.Apis;
                break;
        }
        this.props.changeView(nextView, this.state.activeStory);
    }

    public renameStory = (event: React.FormEvent<HTMLInputElement>) => {
        let oldIndex = Number(event.currentTarget.name);
        let oldName = this.state.stories[oldIndex];
        let newName = event.currentTarget.value;

        this.props.renameStory(oldName, newName);

        this.state.stories[oldIndex] = newName;
        this.setState({stories: this.state.stories, activeStory: newName});
    }

    public addStory = (story?: string) => {
        let storyName: string = (story) ? story: "Story #" + this.state.stories.length.toString();
        this.state.stories.push(storyName);
        this.setState({stories: this.state.stories});
    }

    public renderStoryListItem(story: string): JSX.Element {
        let content = <button
            className={story === this.state.activeStory ? "active" : ""}
            onClick={(event) => this.changeActiveStory(story)}
        >{story}</button>;

        if (story === this.state.activeStory) {
            content = <input
                name={this.state.stories.indexOf(story).toString()}
                type="text"
                value={story}
                onChange={this.renameStory}
            />
        }

        return <li key={story}>
           {content}
        </li>
    }

    public render() {
        const cv = this.props.currentView;

        return (
            <div className="sidebar">
                <button
                    name="evaluation"
                    className={cv === Views.Evaluation ? "active" : ""}
                    onClick={this.changeView}
                >Running and finished tests</button>
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
                    className={cv === Views.UserStories ? "active stories-btn" : "stories-btn"}
                    onClick={this.changeView}
                >UserStories</button>
                <button
                    className="add-story-btn"
                    onClick={(event) => this.addStory()}
                >+</button>
                <ul className="stories-list" >
                    { this.state.stories.map((story) => this.renderStoryListItem(story)) }
                </ul>
                {/*<input
                    type="text"
                    value={this.state.currentlyAddStory}
                    onChange={this.handleInput}
                    className="newStoryTextField"/>*/}
            </div>
        );
    }

    private changeActiveStory(newStory: string) {
        this.setState({activeStory: newStory});
        this.props.changeView(Views.UserStories, newStory);
    }
}
