import { DefaultNodeModelOptions } from "@projectstorm/react-diagrams";
import { AtomType } from "../ConfigJson";
import { Node } from "./Node";

export class WarmupEndNode extends Node {

    constructor(options?: DefaultNodeModelOptions) {
        super(options);
        this.attributes.name = "Warmup End";

    }

    public getAtomType(): AtomType {
        return "WARMUP_END";
    }
}
