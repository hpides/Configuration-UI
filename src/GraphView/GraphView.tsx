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
import { ConvertGraphToStory, ConvertStoryToGraph } from "./ConfigJson";
import { Inspector } from "./Inspector";
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

interface IState extends IStory{
    readonly stories: Map<string, IStory>,
    currentStory: string
}

interface IProps {
    story:string
}

/* tslint:disable:no-console ... */
/* tslint:disable:max-line-length ... */
export class GraphView extends React.Component<IProps, IState> {
    public engine: DiagramEngine;
    public model: DiagramModel;

    constructor(props: IProps) {
        super(props);

        this.state = {
            nodes: [],
            stories: new Map<string, IStory>(),
            currentStory: "default"
        };

        this.engine = createEngine({registerDefaultDeleteItemsAction: false});

        this.model = new DiagramModel();
        this.engine.setModel(this.model);

        this.engine.getActionEventBus().registerAction(new DeleteItemsAction({ keyCodes: [46]}));
    }

    public componentDidMount() {
        const start = this.addNode("START");
        this.setState({ startNode: start as StartNode });

    }

    public handleSelectionChanged = (event: BaseEvent) => {
        const nodes = this.state.nodes;

        this.setState({selectedNode: undefined});

        nodes.forEach((node: Node) => {
            if (node.isSelected()) {
                this.setState({selectedNode: node});
                return;
            }
        });
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
                node = new DataGenerationNode(nodeOptions);
                break;
            case "REQUEST":
                node = new RequestNode(nodeOptions);
                break;
            case "DELAY":
                node = new DelayNode(nodeOptions);
                break;
            case "WARMUP_END":
                node = new WarmupEndNode(nodeOptions);
                break;
            default:
                console.error("Error adding node: unknown type ", type);
                return;
        }

        node.registerListener({
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

    public exportNodes = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>|null):any => {
        const startNode = this.state.startNode;
        if (startNode) {
            return ConvertGraphToStory("Rail", 1, startNode)
        }
        return {}

    }

    public importNodes = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
        const json = prompt("JSON please: ", "{}");
        const deserializedStory = JSON.parse(json ||  "{}");
        const nodes: {nodes: Node[], startNode: StartNode | null, links: LinkModel[]} = ConvertStoryToGraph(deserializedStory);
        this.setState({nodes: []});

        for (const node of nodes.nodes) {
            node.registerListener({
                selectionChanged: this.handleSelectionChanged,
            });
            this.model.addNode(node);
            this.state.nodes.push(node);
        }

        for (const link of nodes.links) {
            this.model.addLink(link);
        }

        if (this.state.startNode) {
            this.model.removeNode(this.state.startNode);
        }
        if (nodes.startNode) {
            this.setState({startNode: nodes.startNode});
        }
        this.setState({nodes: this.state.nodes});
        this.forceUpdate();
    }

    public render() {
        let inspector;
        if (this.state.selectedNode) {
            inspector = <Inspector
                onValueChanged={this.handleInspectorValueChanged}
                node={this.state.selectedNode}
            />;
        }
        return (
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
                <button className="exportButton" onClick={this.exportNodes}>Export</button>
                <button className="importButton" onClick={this.importNodes}>Import</button>
                {inspector}

            </div>
        );
    }
}
