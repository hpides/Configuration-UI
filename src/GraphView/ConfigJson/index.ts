import { Point } from "@projectstorm/geometry";
import {DefaultNodeModelOptions} from "@projectstorm/react-diagrams";
import { LinkModel} from "@projectstorm/react-diagrams-core";
import { DefaultPortModel } from "@projectstorm/react-diagrams-defaults";
import { fragment } from "xmlbuilder2";
import { XMLBuilder } from "xmlbuilder2/lib/builder/interfaces";
import {ExistingConfigComponent} from "../../ExistingConfig/existingConfigComponent";
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
    staticValues?: any;
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
    receiveCookies?: any;
    sendCookies?: any;
    timeAggregation: boolean;
    tokenNames?: any;
    xpaths?: any;
    sendHeaders: any;
    receiveHeaders: string[]
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
function doDepthFirstSearch(node: Node | undefined, idMap: IdMap, atoms: IBaseAtom[],
                            pdgfTables: XMLBuilder[], closedNodeIds: Set<string>,
                            existinGConfig: ExistingConfigComponent) {
    const nodesToProcess: BaseNode[] = [];
    while (node) {
        // do not export again
        node.visited = true;
        const baseAtoms = ConvertNode(idMap, node, existinGConfig);
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
                        // there might be "dangling" links that point to no other node;
                        // this check detects them and saves us from error
                        if (targetPort) {
                            const otherNode = targetPort.getNode() as BaseNode;
                            if (otherNode && !closedNodeIds.has(otherNode.getID())) {
                                nodesToProcess.push(otherNode);
                                closedNodeIds.add(otherNode.getID());
                            }
                        }
                    }
                }
            }
        }
        node = nodesToProcess.pop();
    }
}

/* tslint:disable:max-line-length ... */
export function ConvertGraphToStory(name: string, scalePercentage: number, startNode: StartNode, nodes: Node[], existingConfig: ExistingConfigComponent): {pdgfTables: XMLBuilder[], story: IStory} {
    const atoms: IBaseAtom[] = [];
    const closedNodeIds: Set<string> = new Set();
    const idMap = new IdMap();

    const pdgfTables: XMLBuilder[] = [];

    const node: BaseNode | undefined = startNode;
    closedNodeIds.add(startNode.getID());
    doDepthFirstSearch(node, idMap, atoms, pdgfTables, closedNodeIds, existingConfig);
    // catch all nodes that are isolated from the start node, i.e. not connected
    for (const currentNode of nodes) {
        if (!currentNode.visited) {
            doDepthFirstSearch(currentNode, idMap, atoms, pdgfTables, closedNodeIds, existingConfig);
        }
    }

    // reset visited for next export or start of test
    for (const currentNode of nodes) {
        currentNode.visited = false;
    }

    return {pdgfTables,
        story: {
            atoms,
            name,
            scalePercentage,
        },
    };
}

/**
 * Convert given deserialized JSON to nodes
 * @param {() => void} disableDeleteKey method for datageneration that disables the delete key
 * @param {() => void} enableDeleteKey method for datageneration that enables the delete key
 * @param deserializedStory story representation as plain JS object
 * @returns {{nodes: Node[]; startNode: StartNode | null; links: LinkModel[]}} extracted nodes, the startNode if present, and links between nodes to be added to the model
 * @constructor
 */
export function ConvertStoryToGraph(disableDeleteKey: () => void, enableDeleteKey: () => void, existingConfigComponent: ExistingConfigComponent, deserializedStory: any): {nodes: Node[], startNode: StartNode | null, links: LinkModel[]} {
    const ret: Node[] = [];
    const links: LinkModel[] = [];
    let startNode: StartNode|null = null;
    console.log(deserializedStory);
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
                // so existing properties can be edited
                node = new DataGenerationNode(disableDeleteKey, enableDeleteKey, existingConfigComponent , nodeOptions);
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
        case "RANDOM_SENTENCE":
            const gen = frag.ele("gen_RandomSentence");
            gen.ele("max").txt(genConfig.getAttribute("max"));
            gen.ele("min").txt(genConfig.getAttribute("min"));
            break;
        default:
            console.log(genConfig.getTypeString() + " unknown generator");
            break;
    }
    return frag;
}

function ConvertDataGenerationNode(idMap: IdMap, baseAtomObj: IBaseAtom, node: DataGenerationNode, existingConfig: ExistingConfigComponent): {atoms: IDataGenerationAtom[], pdgfTable?: XMLBuilder} {
    const atoms: IDataGenerationAtom[] = [];

    const pdgfFields: XMLBuilder[] = [];

    const dataToGenerate = node.dataToGenerate;
    if (node.getAttribute("data").length === 0) {
        return {atoms: [{
            ...baseAtomObj,
            data: [],
            dataToGenerate: node.getAttribute("dataToGenerate"),
            name: node.getAttribute("name"),
            staticValues: node.getAttribute("staticValues"),
            table: "",
        }]};
    }

    /*
     * Create Atom for new data
     */
    const keys: string[] = [];
    // need to preserve order, since some generators rely on it
    for (const key of node.getAttribute("data")) {
        const genConfig = dataToGenerate.value.get(key)!;

        if (genConfig.getTypeString() === "EXISTING") {
            continue;
        }

        keys.push(key);
        const field = fragment().ele("field", {name: key, type: "VARCHAR"});
        field.import(generatorToXml(genConfig));
        pdgfFields.push(field);
    }

    let tableName: string;

    tableName = "_" + Math.random().toString(36).substr(2, 9);

    // Generate a pseudo random unique tablename
    // https://gist.github.com/gordonbrander/2230317
    // also, we do not want to generate the same table name twice
    while (existingConfig.state.allTables.has(tableName)) {
        tableName = "_" + Math.random().toString(36).substr(2, 9);

    }

    // existing data generators have to use the existing CSVs
    if (node.getAttribute("table")) {
        tableName = node.getAttribute("table");
    }

    if (node.getAttribute("data").length > 0) {
        atoms.push({
            ...baseAtomObj,
            // node itself stores data ordered
            data: node.getAttribute("data"),
            dataToGenerate: node.getAttribute("dataToGenerate"),
            name: node.getAttribute("name"),
            staticValues: node.getAttribute("staticValues"),
            table: tableName,
        });
    }

    // in case there are no data yet, this will throw exception
    if (atoms.length > 1) {
        atoms[atoms.length - 1].successors = baseAtomObj.successors;
    }
    // only return non-empty tables, PDGF does not appreciate empty tables
    if (pdgfFields.length > 0) {
        const pdgfTable = fragment().ele("table", {name: tableName});
        for (const field of pdgfFields) {
            pdgfTable.import(field);
        }
        return {atoms, pdgfTable};
    }
    return {atoms};
}

function clearEmptyValuesInDict(object: any) {
    for (const key of Object.keys(object)) {
        if (!object[key] || !key) {
            delete object[key];
        }
    }
    return object;
}

function ConvertNode(idMap: IdMap, node: BaseNode, existingConfig: ExistingConfigComponent): {atoms: IBaseAtom[], pdgfTable?: XMLBuilder} {
    const type = node.getAtomType();

    const successors: number[] = [];
    for (const port of node.getOutPorts()) {
        if (port) {
            for (const linkID in port.getLinks()) {
                if (linkID) {
                    const link = port.getLinks()[linkID];
                    const targetPort = link.getTargetPort();
                    // there might be "dangling" links. This prevents an error, but of course the link is lost after import
                    if (targetPort) {
                        const otherNode = targetPort.getNode();

                        successors.push(idMap.mapId(otherNode.getID()));
                    }
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
            const ret = ConvertDataGenerationNode(idMap, baseAtomObj, node as DataGenerationNode, existingConfig);
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
                // remove whitespaces around comma since they would alter the names the backend looks out for
                attr = attr.replace(/\s*,\s*/, ",");
                request.responseJSONObject = attr.split(",");
            }
            attr = node.getAttribute("requestParams");
            if ((typeof attr === "string" || attr instanceof String) && attr.trim() !== "") {
                // remove whitespaces around comma since they would alter the names the backend looks out for
                attr = attr.replace(/\s*,\s*/, ",");
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
            attr = node.getAttribute("receiveCookies");
            if (attr) {
                request.receiveCookies = clearEmptyValuesInDict(attr);
            }
            attr = node.getAttribute("sendCookies");
            if (attr) {
                request.sendCookies = clearEmptyValuesInDict(attr);
            }
            attr = node.getAttribute("tokenNames");
            if (attr) {
                request.tokenNames = clearEmptyValuesInDict(attr);
            }
            attr = node.getAttribute("xpaths");
            if (attr) {
                request.xpaths = clearEmptyValuesInDict(attr);
            }
            attr = node.getAttribute("timeAggregation");
            //might also be null or undefined
            if (attr === true || attr === false) {
                request.timeAggregation = attr;
            }
            attr = node.getAttribute("sendHeaders");
            if (attr) {
                request.sendHeaders = clearEmptyValuesInDict(attr);
            }
            attr = node.getAttribute("receiveHeaders");
            if (attr) {
                request.receiveHeaders = attr;
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
