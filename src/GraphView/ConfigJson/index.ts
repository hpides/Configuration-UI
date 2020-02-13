import { StartNode } from "./../Nodes/StartNode";
import { Node as BaseNode } from "./../Nodes/Node";
import Dictionary from "./Dictionary";

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


}

interface IDataGenerationAtom extends IBaseAtom {
    name: string;
    table: string;
    data: string[];
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
        atoms.push(ConvertNode(idMap, node));
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

function ConvertNode(idMap: IdMap, node: BaseNode): IBaseAtom {
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
        type: type
    } as IBaseAtom

    // insert additional data
    switch (type) {
        case "DATA_GENERATION":
            return {
                ...baseAtomObj,
                name: node.getAttribute("name"),
                table: node.getAttribute("table"),
                data: node.getAttribute("data"),
            } as IDataGenerationAtom;
        case "DELAY":
            return {
                ...baseAtomObj,
                name: node.getAttribute("name"),
                delay: node.getAttribute("delay"),
            } as IDelayAtom;
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
            if (attr) {
                request.responseJSONObject = attr;
            }
            attr = node.getAttribute("requestParams");
            if (attr) {
                request.requestParams = attr;
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
            return request;
    }
    return baseAtomObj;
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

