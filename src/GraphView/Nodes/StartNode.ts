import { DefaultNodeModelOptions } from "@projectstorm/react-diagrams";
import { Node } from './Node';

export class StartNode extends Node {
    protected attributes: { [key: string]: any};
    protected keys = [
        "name",
    ]
    constructor(options?: DefaultNodeModelOptions) {
        super(options);

        this.attributes = {
            "name" : "Start",
        };
    }

    addPorts() {
        this.addOutPort('Out');
    }
}