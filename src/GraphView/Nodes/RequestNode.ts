import { DefaultNodeModelOptions } from "@projectstorm/react-diagrams";
import { AtomType } from "../ConfigJson";
import { Node } from "./Node";

interface IBasicAuth {
    user: string;
    password: string;
}

export class RequestNode extends Node {

    constructor(options?: DefaultNodeModelOptions) {
        super(options);

        this.attributes.name = "Request";
        this.attributes.repeat = "1";
        this.attributes.verb = "GET";
        this.attributes.addr = "";
        this.attributes.requestJSONObject = "";
        this.attributes.responseJSONObject = "";
        this.attributes.requestParams = "";
        this.attributes.basicAuth = null;
    }

    public getAtomType(): AtomType {
        return "REQUEST";
    }
}
