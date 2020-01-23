import { DefaultNodeModel, DefaultNodeModelOptions } from "@projectstorm/react-diagrams";
import { AtomType } from "./../ConfigJson";

export abstract class Node extends DefaultNodeModel {
    protected attributes: { [key: string]: any };

    constructor(options?: DefaultNodeModelOptions) {
        super(options);

        this.attributes = {
            "name" : "Node",
        };

        this.addPorts();
    }

    addPorts() {
        this.addInPort('In');
        this.addOutPort('Out');
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