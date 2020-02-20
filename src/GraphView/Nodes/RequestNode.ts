import { DefaultNodeModelOptions } from "@projectstorm/react-diagrams";
import { Node } from './Node';
import { AtomType } from "../ConfigJson";

interface IBasicAuth {
    user: string;
    password: string;
}

export class RequestNode extends Node {
    
    constructor(options?: DefaultNodeModelOptions) {
        super(options);

        this.attributes.name = "Request";
        this.attributes.repeat="1";
        this.attributes.verb="GET";
        this.attributes.addr="";
        this.attributes.requestJSONObject="";
        this.attributes.responseJSONObject="";
        this.attributes.requestParams="";
        this.attributes.basicAuth=null;
    }

    getAtomType(): AtomType {
        return "REQUEST";
    }
}