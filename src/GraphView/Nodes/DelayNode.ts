import { DefaultNodeModelOptions } from "@projectstorm/react-diagrams";
import { Node } from './Node';

export class DelayNode extends Node {
    protected attributes: { [key: string]: any};
    protected keys = [
        "name",
        "delay"
    ]
    constructor(options?: DefaultNodeModelOptions) {
        super(options);

        this.attributes = {
            "name" : "Data Generation",
            "delay" : "1",
        };
    }
}