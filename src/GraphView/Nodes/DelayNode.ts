import { DefaultNodeModelOptions } from "@projectstorm/react-diagrams";
import { Node } from './Node';
import { AtomType } from "../ConfigJson";

export class DelayNode extends Node {
    
    constructor(options?: DefaultNodeModelOptions) {
        super(options);

        this.attributes.name = "Delay";
        this.attributes.delay="1";
    }

    getAtomType(): AtomType {
        return "DELAY";
    }
}