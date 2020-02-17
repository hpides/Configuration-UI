import { DefaultNodeModelOptions } from "@projectstorm/react-diagrams";
import { Node } from './Node';
import { AtomType } from "../ConfigJson";

interface IBasicAuth {
    user: string;
    password: string;
}

export class RequestNode extends Node {
    protected attributes: { [key: string]: any};
    
    constructor(options?: DefaultNodeModelOptions) {
        super(options);

        this.attributes = {
            "name" : "Request",
            "repeat" : "1",
            "verb" : "GET",
            "addr" : "",
            "requestJSONObject" : "",
            "responseJSONObject" : "",
            "requestParams" : "",
            "basicAuth" : null,
        };
    }

    getAtomType(): AtomType {
        return "REQUEST";
    }
}