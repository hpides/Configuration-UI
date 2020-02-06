import { DefaultNodeModelOptions } from "@projectstorm/react-diagrams";
import { Node } from './Node';
import { AtomType } from "../ConfigJson";

export class RequestNode extends Node {
    protected attributes: { [key: string]: any};
    
    constructor(options?: DefaultNodeModelOptions) {
        super(options);

        this.attributes = {
            "name" : "Request",
            "endpoint" : "",
        };
    }

    getAtomType(): AtomType {
        return "REQUEST";
    }
}