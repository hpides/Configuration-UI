import { Point } from "@projectstorm/geometry";
import {DefaultNodeModelOptions} from "@projectstorm/react-diagrams";
import { LinkModel} from "@projectstorm/react-diagrams-core";
import { DefaultPortModel } from "@projectstorm/react-diagrams-defaults";
import { fragment } from "xmlbuilder2";
import { XMLBuilder } from "xmlbuilder2/lib/builder/interfaces";
import { GeneratorConfig } from "../Inspector/GeneratorConfig";
import {DataGenerationNode} from "../Nodes/DataGenerationNode";
import {DelayNode} from "../Nodes/DelayNode";
import {RequestNode} from "../Nodes/RequestNode";
import {WarmupEndNode} from "../Nodes/WarmupEndNode";
import { Node } from "./../Nodes/Node";
import { Node as BaseNode } from "./../Nodes/Node";
import { StartNode } from "./../Nodes/StartNode";
import IDictionary from "./IDictionary";

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
    x: number;
    y: number;
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
/* tslint:disable:no-console ... */
/* tslint:disable:max-line-length ... */
export function ConvertGraphToStory(name: string, scalePercentage: number, startNode: StartNode): {pdgfTables: XMLBuilder[], story: IStory} {
    const atoms: IBaseAtom[] = [];
    const closedNodeIds: Set<string> = new Set();
    const nodesToProcess: BaseNode[] = [];
    const idMap = new IdMap();

    const pdgfTables: XMLBuilder[] = [];

    let node: BaseNode | undefined = startNode;
    closedNodeIds.add(startNode.getID());
    while (node) {
        const baseAtoms = ConvertNode(idMap, node);
        for (const atom of baseAtoms.atoms) {
            atoms.push(atom);
        }
        if (baseAtoms.pdgfTable) {
            pdgfTables.push(baseAtoms.pdgfTable);
        }
        for (const port of node.getOutPorts()) {
            if (port) {
                for (const linkID in port.getLinks()) {
                    if (linkID) {
                        const link = port.getLinks()[linkID];
                        const targetPort = link.getTargetPort();
                        const otherNode = targetPort.getNode() as BaseNode;
                        if (otherNode && !closedNodeIds.has(otherNode.getID())) {
                            nodesToProcess.push(otherNode);
                            closedNodeIds.add(otherNode.getID());
                        }
                    }
                }
            }
        }
        node = nodesToProcess.pop();
    }

    return {pdgfTables,
        story: {
            atoms,
            name,
            scalePercentage,
        },
    };
}

export function ConvertStoryToGraph(deserializedStory: any): {nodes: Node[], startNode: StartNode | null, links: LinkModel[]} {
    const ret: Node[] = [];
    const links: LinkModel[] = [];
    let startNode: StartNode|null = null;
    for (const currentAtom of deserializedStory.atoms) {

        const type = currentAtom.type;
        let node: Node;
        const nodeOptions: DefaultNodeModelOptions = {
            color: "rgb(0,192,255)",
            name: type.toString(),
        };
        switch (type) {
            case "START":
                node = new StartNode(nodeOptions);
                // one can assume there is maximum one
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
        node.setPosition({x: currentAtom.x, y: currentAtom.y} as Point);
        applyAttributes(node, currentAtom);
        ret.push(node);
    }

    // need to deserialize all nodes, else a successor might not have been deserialized yet
    for (let i = 0; i < ret.length; i++) {
        const serializedAtom = deserializedStory.atoms[i];
        const constructedNode = ret[i];
        for (const successorID of serializedAtom.successors) {
            let targetNode: Node|null = null;
            for (const currentAtom of ret) {
                if (currentAtom.getAttribute("id") === successorID) {
                    targetNode = currentAtom;
                }
            }
            if (!targetNode) {
                console.error("Target node not found: " + successorID);
                return {nodes: [], links: [], startNode: null};
            }
            const link = (constructedNode!.getPort("Out")! as DefaultPortModel).link
                ((targetNode.getPort("In")! as DefaultPortModel));
            links.push(link!);
        }
    }

    return {nodes: ret, links, startNode};
}

function applyAttributes(target: Node, source: any) {
    for (const property in source) {
        if (property) {
            if (property === "requestParams" || property  === "responseJSONObject") {
                const value = source[property];
                let actual = "";
                let first = false;

                // frontend represents arrays comma-separated
                for (const part of value) {
                    if (!first) {
                        first = true;
                    } else {
                        actual += ", ";
                    }
                    // there might be whitespaces
                    actual += part.trim();
                }

                target.setAttribute(property, actual);
            } else {
                target.setAttribute(property, source[property]);
            }
        }
    }
}

function generatorToXml(genConfig: GeneratorConfig): XMLBuilder {
    const frag = fragment();
    switch (genConfig.getTypeString()) {
        case "RANDOM_STRING":
            frag.ele("gen_RandomString").ele("max").txt(genConfig.getAttribute("maxChars"));
            break;
        case "E_MAIL":
            frag.ele("gen_Email");
            break;
        default:
            console.log(genConfig.getTypeString() + " unknown generator");
            break;
    }
    return frag;
}

function ConvertDataGenerationNode(idMap: IdMap, baseAtomObj: IBaseAtom, node: DataGenerationNode): {atoms: IDataGenerationAtom[], pdgfTable?: XMLBuilder} {
    const atoms: IDataGenerationAtom[] = [];

    const pdgfFields: XMLBuilder[] = [];

    const dataToGenerate = node.dataToGenerate;
    if (Array.from(node.dataToGenerate.value.keys()).length === 0) {
        return {atoms: [{
            ...baseAtomObj,
            data: [],
            dataToGenerate: node.getAttribute("dataToGenerate"),
            name: node.getAttribute("name"),
            table: "",
        }]};
    }

    /*
     * Create Atom for new data
     */
    const keys: string[] = [];
    for (const key of Array.from(node.dataToGenerate.value.keys())) {
        const genConfig = dataToGenerate.value.get(key)!;

        if (genConfig.getTypeString() === "EXISTING") {
            continue;
        }

        keys.push(key);
        const field = fragment().ele("field", {name: key, type: "VARCHAR"});
        field.import(generatorToXml(genConfig));
        pdgfFields.push(field);
    }
    // Generate a pseudo random unique tablename
    // https://gist.github.com/gordonbrander/2230317
    const tableName: string = "_" + Math.random().toString(36).substr(2, 9);
    if (keys.length > 0) {
        atoms.push({
            ...baseAtomObj,
            data: keys,
            dataToGenerate: node.getAttribute("dataToGenerate"),
            name: node.getAttribute("name"),
            table: tableName,
        });
    }

    const pdgfTable = fragment().ele("table", {name: tableName});
    for (const field of pdgfFields) {
        pdgfTable.import(field);
    }

    /*
     * Create Atoms for data
     * to be read from existing XML
     */
    for (const key of Array.from(node.dataToGenerate.value.keys())) {
        const genConfig = dataToGenerate.value.get(key)!;
        if (genConfig.getTypeString() !== "EXISTING") {
            continue;
        }

        const newAtom = {
            ...baseAtomObj,
            data: [key],
            dataToGenerate: node.getAttribute("dataToGenerate"),
            name: node.getAttribute("name"),
            table: genConfig.getAttribute("table"),
        };

        if (atoms.length > 0) {
            const id = idMap.mapId(node.getID() + key);
            atoms[atoms.length - 1].successors = [id];

            newAtom.id = id;
        }
        atoms.push(newAtom);
    }
    // in case there are no data yet, this will throw exception
    if (atoms.length > 1) {
        atoms[atoms.length - 1].successors = baseAtomObj.successors;
    }
    return {atoms, pdgfTable};
}

function ConvertNode(idMap: IdMap, node: BaseNode): {atoms: IBaseAtom[], pdgfTable?: XMLBuilder} {
    const type = node.getAtomType();

    const successors: number[] = [];
    for (const port of node.getOutPorts()) {
        if (port) {
            for (const linkID in port.getLinks()) {
                if (linkID) {
                    const link = port.getLinks()[linkID];
                    const targetPort = link.getTargetPort();
                    const otherNode = targetPort.getNode();

                    successors.push(idMap.mapId(otherNode.getID()));
                }
            }
        }
    }

    const baseAtomObj = {
        id: idMap.mapId(node.getID()),
        name: node.getAttribute("name"),
        repeat: 1,
        successors,
        type,
        x: node.getX(),
        y: node.getY(),
    } as IBaseAtom;

    // insert additional data
    switch (type) {
        case "DATA_GENERATION":
            const ret = ConvertDataGenerationNode(idMap, baseAtomObj, node as DataGenerationNode);
            return ret;
        case "DELAY":
            return {atoms: [{
                ...baseAtomObj,
                delay: node.getAttribute("delay"),
                name: node.getAttribute("name"),
            } as IDelayAtom]};
        case "REQUEST":
            const request = {
                ...baseAtomObj,
                addr: node.getAttribute("addr"),
                verb: node.getAttribute("verb"),

            } as IRequestAtom;
            let attr = node.getAttribute("requestJSONObject");
            if (attr) {
                request.requestJSONObject = attr;
            }
            attr = node.getAttribute("responseJSONObject");
            if ((typeof attr === "string" || attr instanceof String) && attr.trim() !== "") {
                request.responseJSONObject = attr.split(",");
            }
            attr = node.getAttribute("requestParams");
            if ((typeof attr === "string" || attr instanceof String) && attr.trim() !== "") {
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
            return {atoms: [request]};
    }
    return {atoms: [baseAtomObj]};
}

class IdMap {
    private idMapping: IDictionary<number> = {};
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
