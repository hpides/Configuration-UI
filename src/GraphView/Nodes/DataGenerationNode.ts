import { DefaultNodeModelOptions } from "@projectstorm/react-diagrams";
import { Node } from './Node';
import { AtomType } from "../ConfigJson";
import { GeneratorConfig } from "../Inspector/GeneratorConfig";

export class DataGenerationNode extends Node {
    protected attributes: { [key: string]: any};
    data_to_generate: { [key: string]: GeneratorConfig} = {};
    
    constructor(options?: DefaultNodeModelOptions) {
        super(options);

        this.attributes = {
            "name" : "Data Generation",
            "table" : "",
        };
    }

    getAtomType(): AtomType {
        return "DATA_GENERATION";
    }
}