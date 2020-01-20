import { DefaultNodeModelOptions } from "@projectstorm/react-diagrams";
import { Node } from './Node';

export class DataGenerationNode extends Node {
    protected attributes: { [key: string]: any};
    
    constructor(options?: DefaultNodeModelOptions) {
        super(options);

        this.attributes = {
            "name" : "Data Generation",
            "table" : "",
        };
    }
}