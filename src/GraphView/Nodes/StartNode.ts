import { DefaultNodeModelOptions, PortModelAlignment } from "@projectstorm/react-diagrams";
import { AtomType } from "../ConfigJson";
import { AcyclicPort } from "./AcyclicPort";
import { Node } from "./Node";

export class StartNode extends Node {

    constructor(options?: DefaultNodeModelOptions) {
        super(options);
        this.attributes.name = "Start";

    }

    public addPorts() {
        const outPort = new AcyclicPort({
            alignment: PortModelAlignment.RIGHT,
            in: false,
            label: "Out",
            name: "Out",
        });
        this.addPort(outPort);
    }

    public getAtomType(): AtomType {
        return "START";
    }
}
