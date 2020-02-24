import { DefaultNodeModelOptions } from "@projectstorm/react-diagrams";
import { AtomType } from "../ConfigJson";
import { Node } from "./Node";
import {AssertionConfig} from "../Inspector/AssertionConfig";

import {classToPlain, Type} from "class-transformer";
import "reflect-metadata";

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
        this.attributes.assertions = [];
    }

    public getAtomType(): AtomType {
        return "REQUEST";
    }

    public addAssertion(assertion: AssertionConfig){
        this.attributes.assertions.push(JSON.stringify(classToPlain(assertion)));
    }
}
