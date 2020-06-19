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
    _keyhandler: {
        disableDeleteKey: () => void,
        enableDeleteKey: () => void,
    };
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
            case "pdgf":
                nextView = Views.PDGFOutput;
                break;
            case "evaluation":
                nextView = Views.Evaluation;
                break;
            case "existing":
                nextView = Views.Existing;
                break;
            default:
                nextView = Views.Apis;
                break;
        }
        this.props.changeView(nextView, this.state.activeStory);
    }

    public renameStory = (event: React.FormEvent<HTMLInputElement>) => {
        const oldIndex = Number(event.currentTarget.name);
        const oldName = this.state.stories[oldIndex];
        const newName = event.currentTarget.value;
        // empty names are reserved for deleted stories, so disallow entering them
        if (newName === "") {
            alert("Empty story names are forbidden!");
        } else {
            this.doRename(oldName, newName, oldIndex);
        }
    }

    public addStory = (story?: string) => {
        let storyName: string;
        if (story) {
            storyName = story;
        } else {
            let storyNumber = this.state.stories.length;
            do {
                storyName = "Story #" + storyNumber.toString();
                storyNumber++;
            } while (this.state.stories.indexOf(storyName) !== -1);
        }
        this.state.stories.push(storyName);
        this.setState({stories: this.state.stories});
    }

    public deleteStory = (event: React.MouseEvent<HTMLButtonElement>) => {
        const story = event.currentTarget.getAttribute("data-key");
        if (!story) {
            return;
        }
        const storyIndex = this.state.stories.indexOf(story);
        if (storyIndex > -1) {
            this.doRename(story, "", storyIndex);
        }
    }

    public renderStoryListItem(story: string): JSX.Element {
        // do not show deleted story
        if (story === "") {
            return <div/>;
        }
        let content = <button
            className={story === this.state.activeStory ? "active" : ""}
            onClick={(event) => this.changeActiveStory(story)}
        >{story}</button>;
        if (story === this.state.activeStory) {
            // do not delete any selected node if backspace is pressed by disabling delete key during editing
            // also, this does not apply to other views like test config
            content = <input
                name={this.state.stories.indexOf(story).toString()}
                type="text"
                value={story}
                onChange={this.renameStory}
                onBlur={this.props.currentView === Views.UserStories ?
                    this.props._keyhandler.enableDeleteKey : () => {}}
                onFocus={this.props.currentView === Views.UserStories ?
                    this.props._keyhandler.disableDeleteKey : () => {}}
                ref={(reference) => {
                    if (reference) {
                        reference.focus();
                    }
                }}
            />;
        }

        return <li key={story}>
           {content}
           <button
                        className="delete-data-btn"
                        data-key={story}
                        onClick={this.deleteStory}
                    >&times;</button>
        </li>;
    }

    public render() {
        const cv = this.props.currentView;

        return (
            <div className="sidebar">
                <button
                    name="evaluation"
                    className={cv === Views.Evaluation ? "active" : ""}
                    onClick={this.changeView}
                >Recent Tests</button>
                <button
                    name="testconfig"
                    className={cv === Views.Testconfig ? "active" : ""}
                    onClick={this.changeView}
                >Test Configuration</button>
                <button
                    name="apis"
                    className={cv === Views.Apis ? "active" : ""}
                    onClick={this.changeView}
                >Edit APIs</button><button
                    name="existing"
                    className={cv === Views.Existing ? "active" : ""}
                    onClick={this.changeView}
                >Edit PDGF Configurations</button>
                <button
                    name="pdgf"
                    className={cv === Views.PDGFOutput ? "active" : ""}
                    onClick={this.changeView}
                >Last PDGF Output</button>
                <button
                    name="userstories"
                    className={cv === Views.UserStories ? "active stories-btn" : "stories-btn"}
                    onClick={this.changeView}
                >User Stories</button>
                <button
                    className="add-story-btn"
                    onClick={(event) => this.addStory()}
                >+</button>
                <ul className="stories-list" >
                    { this.state.stories.map((story) => this.renderStoryListItem(story)) }
                </ul>
            </div>
        );
    }

    private doRename = (oldName: string, newName: string, oldIndex: number) => {
        this.props.renameStory(oldName, newName);

        // eslint-disable-next-line
        this.state.stories[oldIndex] = newName;
        this.setState({stories: this.state.stories, activeStory: newName});

        this.forceUpdate();
    }

    private changeActiveStory(newStory: string) {
        this.setState({activeStory: newStory});
        this.props.changeView(Views.UserStories, newStory);
    }
}
