import { DefaultNodeModelOptions } from "@projectstorm/react-diagrams";
import { AtomType } from "../ConfigJson";
import { Node } from "./Node";

export class DelayNode extends Node {

    constructor(options?: DefaultNodeModelOptions) {
        super(options);

        this.attributes.name = "Delay";
        this.attributes.delay = "1";
    }

    public getAtomType(): AtomType {
        return "DELAY";
    }
}
