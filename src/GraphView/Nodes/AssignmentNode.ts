import { DefaultNodeModelOptions } from "@projectstorm/react-diagrams";
import { AtomType } from "../ConfigJson";
import { Node } from "./Node";

export class AssignmentNode extends Node {

    constructor(options?: DefaultNodeModelOptions) {
        super(options);

        this.attributes.name = "Assignment";
        this.attributes.assignments = {};
    }

    public getAtomType(): AtomType {
        return "ASSIGNMENT";
    }
}
