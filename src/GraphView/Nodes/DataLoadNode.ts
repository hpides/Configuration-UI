import { DefaultNodeModelOptions } from "@projectstorm/react-diagrams";
import { Node } from './Node';
import { AtomType } from "../ConfigJson";
import { GeneratorConfig } from "../Inspector/GeneratorConfig";

export class DataLoadNode extends Node {
    protected attributes: { [key: string]: any};
    
    constructor(options?: DefaultNodeModelOptions) {
        super(options);

        this.attributes = {
            "name" : "Data Generation",
            "table" : "",
            "key" : ""
        };
    }

    getAtomType(): AtomType {
        return "DATA_LOAD";
    }
}