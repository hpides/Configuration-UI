import { DefaultNodeModelOptions } from "@projectstorm/react-diagrams";
import { Node } from './Node';
import { AtomType } from "../ConfigJson";
import { GeneratorConfig } from "../Inspector/GeneratorConfig";

export type DataGenDict = { [key: string] : GeneratorConfig }

export class DataGenerationNode extends Node {
    protected attributes: { [key: string]: any};
    data_to_generate: DataGenDict = {};
    
    constructor(options?: DefaultNodeModelOptions) {
        super(options);

        this.attributes = {
            "name" : "Data Generation",
        };
    }

    getAtomType(): AtomType {
        return "DATA_GENERATION";
    }

    addData(name: string, genConfig: GeneratorConfig) {
        this.data_to_generate[name] = genConfig;
    }
}