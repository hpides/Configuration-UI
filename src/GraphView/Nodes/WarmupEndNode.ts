import { DefaultNodeModelOptions } from "@projectstorm/react-diagrams";
import { Node } from './Node';
import { AtomType } from "../ConfigJson";

export class WarmupEndNode extends Node {
    
    constructor(options?: DefaultNodeModelOptions) {
        super(options);
        this.attributes.name="Warmup End";

    }

    getAtomType(): AtomType {
        return "WARMUP_END";
    }
}