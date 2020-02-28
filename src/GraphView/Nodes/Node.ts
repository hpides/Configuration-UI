import { DefaultNodeModel, DefaultNodeModelOptions, PortModelAlignment } from "@projectstorm/react-diagrams";
import { AtomType } from "./../ConfigJson";
import { AcyclicPort } from "./AcyclicPort";
export abstract class Node extends DefaultNodeModel {
    protected attributes: { [key: string]: any };

    /*
    true if this node has been visited by the export process*/
    protected visited: boolean = false;

    constructor(options?: DefaultNodeModelOptions) {
        super(options);

        this.attributes = {
            id: "",
            name : "Node",
            repeat: "1",
        };
        this.addPorts();

    }

    public hasPathTo(node: Node) {
        if (node === this) {
            return true;
        }

        const ancestors = this.getAncestors();

        for (const ancestor of ancestors) {
            if (ancestor instanceof Node) {
                if (ancestor.hasPathTo(node)) {
                    return true;
                }
            }
        }

        return false;
    }

    public getAncestors() {
        const outPort = this.getOutPorts()[0];
        const links = Object.values(outPort.getLinks());

        return links.map((link) => link.getTargetPort().getNode());
    }

    public addPorts() {

        const inPort = new AcyclicPort({
            alignment: PortModelAlignment.LEFT,
            in: true,
            label: "In",
            name: "In",
        });
        this.addPort(inPort);

        const outPort = new AcyclicPort({
            alignment: PortModelAlignment.RIGHT,
            in: false,
            label: "Out",
            name: "Out",
        });
        this.addPort(outPort);
    }

    public getAttributes() {
        return this.attributes;
    }

    public getAttribute(key: string) {
        return this.attributes[key];
    }

    public setAttribute(key: string, value: any) {
        if (this.getKeys().includes(key)) {
            this.attributes[key] = value;
        }
    }

    public getKeys(): string[] {
        return Object.keys(this.attributes);
    }

    public abstract getAtomType(): AtomType;

}
