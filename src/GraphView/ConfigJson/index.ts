import { StartNode } from "./../Nodes/StartNode";
import { Node } from "./../Nodes/Node";
import { Node as BaseNode } from "./../Nodes/Node";
import Dictionary from "./Dictionary";
import {DataGenerationNode, dataToGenerateClass} from "../Nodes/DataGenerationNode";
import { Point } from '@projectstorm/geometry';
import { DefaultPortModel } from '@projectstorm/react-diagrams-defaults';
import { LinkModel} from '@projectstorm/react-diagrams-core';
import {DefaultNodeModelOptions} from "@projectstorm/react-diagrams";
import {RequestNode} from "../Nodes/RequestNode";
import {WarmupEndNode} from "../Nodes/WarmupEndNode";
import {DelayNode} from "../Nodes/DelayNode";
export interface ITest {
    repeat: number;
    scaleFactor: number;
    requests_per_second: number;
    stories: IStory[];
}
interface IStory {
    scalePercentage: number;
    name: string;
    atoms: IBaseAtom[];
}

export type AtomType = "DATA_GENERATION" | "REQUEST" | "WARMUP_END" | "START" | "DELAY";

interface IBaseAtom {
    name: string;
    id: number;
    repeat: number;
    successors: number[];
    type: AtomType;
    x: number,
    y: number

}

interface IDataGenerationAtom extends IBaseAtom {
    name: string;
    table: string;
    data: string[];
    dataToGenerate: string;
}

type HTTPVerb = "POST" | "GET";
interface IRequestAtom extends IBaseAtom {
    verb: HTTPVerb;
    addr: string;
    requestJSONObject?: string;
    responseJSONObject?: string[];
    requestParams?: string[];
    basicAuth?: IBasicAuth;
    responseParams?: string[];
    assertions?: IAssertion[];
}

interface IDelayAtom extends IBaseAtom {
    name: string;
    delay: number;
}

interface IAssertion {
    type: string;
    name: string;
    contentType?: string;
    responseCode?: number;
}

interface IBasicAuth {
    user: string;
    password: string;
}

export function ConvertGraphToStory(name: string, scalePercentage: number, startNode: StartNode): IStory {
    const atoms: IBaseAtom[] = new Array();
    const closedNodeIds: Set<string> = new Set();
    const nodesToProcess: BaseNode[] = [];
    const idMap = new IdMap();

    let node: BaseNode | undefined = startNode;
    closedNodeIds.add(startNode.getID());
    while (node) {
        let baseAtoms = ConvertNode(idMap, node);
        for (const atom of baseAtoms) {
            atoms.push(atom);
        }
        for (const port of node.getOutPorts()) {
            for (const linkID in port.getLinks()) {
                const link = port.getLinks()[linkID];
                const targetPort = link.getTargetPort();
                const otherNode = targetPort.getNode() as BaseNode;
                if (otherNode && !closedNodeIds.has(otherNode.getID())) {
                    nodesToProcess.push(otherNode);
                    closedNodeIds.add(otherNode.getID());
                }
            }
        }
        node = nodesToProcess.pop();
    }

    return {
        name: name,
        scalePercentage: scalePercentage,
        atoms: atoms
    } as IStory;
}

export function ConvertStoryToGraph(deserializedStory:any) : {nodes: Node[], startNode: StartNode | null, links: LinkModel[]}{
    const ret:Node[] = [];
    const links : LinkModel[] = [];
    let startNode: StartNode|null = null;
    for(let currentAtom of deserializedStory.atoms){

        const type = currentAtom.type;
        let node:Node;
        const nodeOptions: DefaultNodeModelOptions = {
            name: type.toString(),
            color: 'rgb(0,192,255)',
        };
        switch(type) {
            case "START":
                node = new StartNode(nodeOptions);
                //one can assume there is maximum one
                startNode = node;
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
                return {nodes: [], links: [], startNode: null};
        }
        node.setPosition({x: currentAtom.x, y: currentAtom.y} as Point)
        applyAttributes(node, currentAtom);
        ret.push(node);
    }

    //need to deserialize all nodes, else a successor might not have been deserialized yet
    for(let i = 0; i < ret.length; i++){
        const serializedAtom = deserializedStory.atoms[i];
        const constructedNode = ret[i];
        for(let successorID of serializedAtom.successors){
            let targetNode:Node|null = null;
            for(let currentAtom of ret){
                if(currentAtom.getAttribute("id") === successorID){
                    targetNode = currentAtom;
                }
            }
            if(!targetNode){
                console.error("Target node not found: "+successorID);
                return {nodes: [], links: [], startNode: null};
            }
            const link = (constructedNode!.getPort("Out")! as DefaultPortModel).link((targetNode.getPort("In")! as DefaultPortModel));
            links.push(link!);
        }
    }


    return {nodes: ret, links: links, startNode: startNode};
}

function applyAttributes(target: Node, source: any){
    for(let property in source){
        target.setAttribute(property, source[property])
    }
}


function ConvertDataGenerationNode(idMap: IdMap, baseAtomObj: IBaseAtom, node: DataGenerationNode): IDataGenerationAtom[] {
    let atoms: IDataGenerationAtom[] = [];

    const dataToGenerate = node.dataToGenerate;
    if (Array.from(node.dataToGenerate.value.keys()).length === 0) {
        return [{
            ...baseAtomObj,
            name: node.getAttribute("name"),
            table: "",
            data: [],
            dataToGenerate: node.getAttribute("dataToGenerate")
        }];
    }

    /*
     * Create Atom for new data
     */
    let keys: string[] = [];
    for (const key of Array.from(node.dataToGenerate.value.keys())) {
        let genConfig = dataToGenerate.value.get(key)!;

        if (genConfig.getTypeString() === "EXISTING") {
            continue;
        }

        keys.push(key);
    }
    // To-Do : generate unique table name
    let tableName: string = "abcdef";
    if (keys.length > 0) {
        atoms.push({
            ...baseAtomObj,
            name: node.getAttribute("name"),
            table: tableName,
            data: keys,
            dataToGenerate: node.getAttribute("dataToGenerate")
        });
    }

    /*
     * Create Atoms for data
     * to be read from existing XML
     */
    for (const key of Array.from(node.dataToGenerate.value.keys())) {
        let genConfig = dataToGenerate.value.get(key)!;
        if (genConfig.getTypeString() !== "EXISTING") {
            continue;
        }

        let newAtom = {
            ...baseAtomObj,
            name: node.getAttribute("name"),
            table: genConfig.getAttribute("table"),
            data: [key],
            dataToGenerate: node.getAttribute("dataToGenerate")
        };

        if (atoms.length > 0) {
            let id = idMap.mapId(node.getID() + key);
            atoms[atoms.length-1].successors = [id];

            newAtom.id = id;
        }
        atoms.push(newAtom);
    }
    // in case there are no data yet, this will throw exception
    if(atoms.length > 1) {
        atoms[atoms.length - 1].successors = baseAtomObj.successors;
    }
    return atoms;
}

function ConvertNode(idMap: IdMap, node: BaseNode): IBaseAtom[] {
    const type = node.getAtomType();

    const successors: number[] = [];
    for (const port of node.getOutPorts()) {
        if (port) {
            for (const linkID in port.getLinks()) {
                const link = port.getLinks()[linkID];
                const targetPort = link.getTargetPort();
                const otherNode = targetPort.getNode();

                successors.push(idMap.mapId(otherNode.getID()));
            }
        }
    }

    const baseAtomObj = {
        name: node.getAttribute("name"),
        id: idMap.mapId(node.getID()),
        repeat: 1,
        successors: successors,
        type: type,
        x: node.getX(),
        y: node.getY()
    } as IBaseAtom

    // insert additional data
    switch (type) {
        case "DATA_GENERATION":
            const ret = ConvertDataGenerationNode(idMap, baseAtomObj, node as DataGenerationNode);
            return ret;
        case "DELAY":
            return [{
                ...baseAtomObj,
                name: node.getAttribute("name"),
                delay: node.getAttribute("delay"),
            } as IDelayAtom];
        case "REQUEST":
            const request = {
                ...baseAtomObj,
                verb: node.getAttribute("verb"),
                addr: node.getAttribute("addr"),

            } as IRequestAtom;
            let attr = node.getAttribute("requestJSONObject");
            if (attr) {
                request.requestJSONObject = attr;
            }
            attr = node.getAttribute("responseJSONObject");
            if ((typeof attr === 'string' || attr instanceof String) && attr.trim() !== "") {
                request.responseJSONObject = attr.split(",");
            }
            attr = node.getAttribute("requestParams");
            if ((typeof attr === 'string' || attr instanceof String) && attr.trim() !== "") {
                request.requestParams = attr.split(",");
            }
            attr = node.getAttribute("basicAuth");
            if (attr) {
                request.basicAuth = attr;
            }
            attr = node.getAttribute("responseParams");
            if (attr) {
                request.responseParams = attr;
            }
            attr = node.getAttribute("assertions");
            if (attr) {
                request.assertions = attr;
            }
            return [request];
    }
    return [baseAtomObj];
}

class IdMap {
    private idMapping: Dictionary<number> = {};
    private nextId: number = 0;

    public mapId(strId: string): number {
        let mappedId = this.idMapping[strId];
        if (mappedId === undefined) {
            mappedId = this.nextId++;
            this.idMapping[strId] = mappedId;
        }
        return mappedId;
    }
}

