import { AtomType } from "./../ConfigJson";
import { DefaultNodeModel, DefaultNodeModelOptions, PortModelAlignment } from "@projectstorm/react-diagrams";
import { AcyclicPort } from "./AcyclicPort";
import { DefaultPortModel } from '@projectstorm/react-diagrams-defaults';
export abstract class Node extends DefaultNodeModel {
    protected attributes: { [key: string]: any };
    constructor(options?: DefaultNodeModelOptions) {
        super(options);

        this.attributes = {
            "name" : "Node",
            "id": "",
            "repeat": "1"
        };
        this.addPorts();

    }

    hasPathTo(node: Node) {
        if (node === this) {
            return true;
        }

        let ancestors = this.getAncestors();

        for (let i = 0; i < ancestors.length; i++) {
            let ancestor = ancestors[i];
            if (ancestor instanceof Node) {
                if (ancestor.hasPathTo(node)) {
                    return true;
                }
            }
        }

        return false;
    }

    getAncestors() {
        let outPort = this.getOutPorts()[0];
        let links = Object.values(outPort.getLinks());

        return links.map(link => link.getTargetPort().getNode());
    }

    addPorts() {

        let inPort = new AcyclicPort({
            in: true,
            name: 'In',
            label: 'In',
            alignment: PortModelAlignment.LEFT
        })
        this.addPort(inPort);

        let outPort = new AcyclicPort({
            in: false,
            name: 'Out',
            label: 'Out',
            alignment: PortModelAlignment.RIGHT
        })
        this.addPort(outPort);
    }

    getAttributes() {
        return this.attributes;
    }

    getAttribute(key: string) {
        return this.attributes[key];
    }

    setAttribute(key: string, value: any) {
        if (this.getKeys().includes(key)) {
            this.attributes[key] = value;
        }
    }

    getKeys() {
        return Object.keys(this.attributes);
    }

    abstract getAtomType(): AtomType;

}