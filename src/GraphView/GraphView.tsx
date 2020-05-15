import createEngine, {
    DefaultNodeModelOptions,
    DiagramEngine,
    DiagramModel,
} from "@projectstorm/react-diagrams";
import React from "react";
import "./GraphView.css";
import NodeAdder from "./NodeAdder";

import { Point } from "@projectstorm/geometry";
import {
    BaseEvent,
    CanvasWidget,
    DeleteItemsAction,
} from "@projectstorm/react-canvas-core";
import { LinkModel} from "@projectstorm/react-diagrams-core";
import { DefaultPortModel } from "@projectstorm/react-diagrams-defaults";
import { ApisEditor } from "../ApisEditor/ApisEditor";
import {ExistingConfigComponent} from "../ExistingConfig/existingConfigComponent";
import { ConvertGraphToStory, ConvertStoryToGraph } from "./ConfigJson";
import { Inspector } from "./Inspector";
import {AssignmentNode} from "./Nodes/AssignmentNode";
import { DataGenerationNode } from "./Nodes/DataGenerationNode";
import { DelayNode } from "./Nodes/DelayNode";
import { Node } from "./Nodes/Node";
import { RequestNode } from "./Nodes/RequestNode";
import { StartNode } from "./Nodes/StartNode";
import { WarmupEndNode } from "./Nodes/WarmupEndNode";
interface IStory {
    nodes: Node[];
    startNode?: StartNode;
    selectedNode?: Node;
}

export interface IState extends IStory {
    visible: boolean[];
    scalePercentage: number;
}

export interface IProps {
    existingConfig: ExistingConfigComponent;
    existingApi: ApisEditor;
}

/* tslint:disable:no-console ... */
/* tslint:disable:max-line-length ... */
export class GraphView extends React.Component<IProps, IState> {
    public engine: DiagramEngine;
    public model: DiagramModel;
    private readonly deleteAction = new DeleteItemsAction({ keyCodes: [8]});
    private storyName: string;

    private allowDeletingStartNode = false;

    private waitingForSetState = false;
    constructor(props: IProps) {
        super(props);

        this.state = {
            nodes: [],
            scalePercentage: 1,
            visible: [true],
        };

        this.engine = createEngine({registerDefaultDeleteItemsAction: false});

        this.model = new DiagramModel();
        this.engine.setModel(this.model);

        this.engine.getActionEventBus().registerAction(this.deleteAction);
        // will be set in a second by parent
        this.storyName = "";
    }

    public componentDidMount() {
        const start = this.addNode("START");
        this.waitingForSetState = true;
        this.setState({ startNode: start as StartNode }, () => {this.waitingForSetState = false; });

    }

    public handleSelectionChanged = (event: BaseEvent) => {
        // user might have clicked away from the inspector --> re-enable backspace
        this.enableDeleteKey();
        const nodes = this.state.nodes;

        this.setState({selectedNode: undefined});
        // else the tooltips are gone for some reason
        setTimeout(()=>{
            nodes.forEach((node: Node) => {
                if (node.isSelected()) {
                    this.setState({selectedNode: node});
                    return;
                }
            });
        }, 100)
    }

    public addNode = (type: string, point?: Point) => {

        let node: Node;

        const nodeOptions: DefaultNodeModelOptions = {
            color: "rgb(0,192,255)",
            name: type.toString(),
        };

        switch (type) {
            case "START":
                node = new StartNode(nodeOptions);
                break;
            case "DATA_GENERATION":
                node = new DataGenerationNode( this.disableDeleteKey, this.enableDeleteKey, this.props.existingConfig, nodeOptions);
                break;
            case "REQUEST":
                node = new RequestNode(nodeOptions);
                break;
            case "DELAY":
                node = new DelayNode(nodeOptions);
                break;
            case "ASSIGNMENT":
                node = new AssignmentNode(nodeOptions);
                break;
            case "WARMUP_END":
                node = new WarmupEndNode(nodeOptions);
                break;
            default:
                console.error("Error adding node: unknown type ", type);
                return;
        }

        node.registerListener({
            entityRemoved: this.handleEntityRemoved,
            selectionChanged: this.handleSelectionChanged,
        });

        if (point) {
            node.setPosition(point.x, point.y);
        } else {
            node.setPosition(10, 10);
        }

        const nodes = this.state.nodes;
        nodes.push(node);
        this.setState({nodes});

        this.model.addNode(node);

        this.forceUpdate();

        return node;
    }

    public handleInspectorValueChanged = (key: string, value: string) => {
        const node = this.state.selectedNode;

        node!.setAttribute(key, value);

        this.setState({selectedNode: node});
    }

    public handleDrop = (event: React.DragEvent) => {
        const point = this.engine.getRelativeMousePoint(event);

        this.addNode(event.dataTransfer.getData("tdgt-node-type"), point);
    }

    public exportNodes = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>|null): any => {
        const startNode = this.state.startNode;
        if (startNode) {
            const story = ConvertGraphToStory("Rail", 1, startNode, this.state.nodes, this.props.existingConfig);
            story.story.name = this.storyName;
            story.story.scalePercentage = this.state.scalePercentage;

            return story;
        }
        return {};

    }

    public getStory = (): string => {
        return this.storyName;
    }

    public setStory = (story: string) => {
        this.storyName = story;
    }

    public importNodes = (story: any): void => {
        // import might delete start node
        this.allowDeletingStartNode = true;
        // direct mutation of state in componentDidMount crashes export later on, state cannot be set in constructor because graph view is not initialized, so we have to wait for setState...
        const startAsync = async (callback: any) => {
            while (this.waitingForSetState) {
                await new Promise((res) => setTimeout(res, 100));
            }
            console.log(JSON.stringify(story, null, 4));
            const nodes: { nodes: Node[], startNode: StartNode | null, links: LinkModel[] } = ConvertStoryToGraph(this.disableDeleteKey, this.enableDeleteKey, this.props.existingConfig, story);
            this.setState({nodes: [], scalePercentage: story.scalePercentage});

            for (const node of nodes.nodes) {
                node.registerListener({
                    entityRemoved: this.handleEntityRemoved,
                    selectionChanged: this.handleSelectionChanged,
                });
                this.model.addNode(node);
                this.state.nodes.push(node);

            }

            for (const link of nodes.links) {
                this.model.addLink(link);
            }

            if (nodes.startNode) {
                if (this.state.startNode) {
                    this.state.startNode.remove();
                }
                this.setState({startNode: nodes.startNode});
            }
            this.setState({nodes: this.state.nodes});
            this.forceUpdate();
            // re-enable hook
            this.allowDeletingStartNode = false;
        };
        startAsync({});
    }

    public setVisibility(visible: boolean): void {
        // can not use setState here since this method is called during render. So use the array as wrapper and mutate it
        // eslint-disable-next-line
        this.state.visible[0] = visible;
    }

    // used by inspector to disable and re-enable backspace key when typing

    public disableDeleteKey = (): void => {
        this.engine.getActionEventBus().deregisterAction(this.deleteAction);
    }

    public enableDeleteKey = (): void => {
        this.engine.getActionEventBus().registerAction(this.deleteAction);
    }

    public render() {
        let inspector;
        if (this.state.selectedNode) {
            inspector = <Inspector
                disableDeleteKey={this.disableDeleteKey}
                enableDeleteKey={this.enableDeleteKey}
                model={this.model}
                onValueChanged={this.handleInspectorValueChanged}
                node={this.state.selectedNode}
                existingConfig={this.props.existingConfig}
                existingApi={this.props.existingApi}
            />;
        }
        return (
            <div style={this.state.visible[0] ? {visibility: "visible"} : {visibility: "hidden"}}>
                <div>
                <div id="graphview">

                    <div className="container"
                         onDrop={this.handleDrop}
                         onDragOver={(event) => {
                             event.preventDefault();
                         }}
                    >
                        <CanvasWidget engine={this.engine}/>
                    </div>
                    <NodeAdder onAddNode={this.addNode}/>
                    <div className="scale-percentage-container">
                        <label>Scale Percentage:</label>
                        <input
                            type="number"
                            value={this.state.scalePercentage}
                            onChange={this.handleScalePercentageChanged}
                            onFocus={this.disableDeleteKey}
                            onBlur={this.enableDeleteKey}/>
                    </div>
                    {inspector}
                </div>
                </div>
            </div>
        );
    }

    private handleScalePercentageChanged = (event: React.FormEvent<HTMLInputElement>): void => {
        this.setState({scalePercentage: +event.currentTarget.value});
    }

    private handleEntityRemoved = (event: BaseEvent): void => {
        if ("entity" in (event as any)) {
            // event is an unknown subclass of BaseEvent with field entity, so we need to go this route
            const nodes = [];
            const nodeToDelete = (event as any).entity as Node;
            // can not delete start nodes --> immediately re-add
            // disable this if e.g. import
            if (nodeToDelete instanceof StartNode && !this.allowDeletingStartNode) {
                // can not add the same object again (there seems to be a hidden attribute that marks it as destroyed), so create a new start node and copy relevant attributes
                const startNode = this.addNode("START", nodeToDelete.getPosition())!;
                for (const port of nodeToDelete.getOutPorts()) {
                    if (port) {
                        for (const linkID in port.getLinks()) {
                            if (linkID) {
                                const link = port.getLinks()[linkID];
                                const targetPort = link.getTargetPort();
                                const otherNode = targetPort.getNode();
                                // links to nowhere can be removed
                                if (otherNode) {
                                    // all nodes have In and Out ports, we can assume they exist
                                    const createdLink = (startNode!.getPort("Out")! as DefaultPortModel).link
                                    ((otherNode.getPort("In")! as DefaultPortModel));
                                    // for some reason, else the target point is (0,0)
                                    createdLink.setPoints([createdLink.getFirstPoint(), link.getPoints()[1]]);
                                    this.model.removeLink(link);
                                    this.model.addLink(createdLink);
                                }
                            }
                        }
                    }
                    // user should notice this is not allowed
                    const snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
                    snd.play();
                }
                this.setState({startNode});
            }
            for (const node of this.state.nodes) {
                // start nodes can not be removed
                if (node !== nodeToDelete) {
                    nodes.push(node);
                }
            }
            this.setState({nodes});
        }
    }
}
