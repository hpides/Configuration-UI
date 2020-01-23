import { DefaultNodeModelOptions } from "@projectstorm/react-diagrams";
import { Node } from './Node';
import { AtomType } from "../ConfigJson";

export class StartNode extends Node {
    protected attributes: { [key: string]: any};
    
    constructor(options?: DefaultNodeModelOptions) {
        super(options);

        this.attributes = {
            "name" : "Start",
        };
    }

    addPorts() {
        this.addOutPort('Out');
    }

    getAtomType(): AtomType {
        return "START";
    }
}