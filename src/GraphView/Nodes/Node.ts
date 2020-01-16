import { DefaultNodeModel, DefaultNodeModelOptions } from "@projectstorm/react-diagrams";

export class Node extends DefaultNodeModel {
    protected attributes: { [key: string]: any};
    protected keys = [
        "name",
    ]
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
        if (this.keys.includes(key)) {
            this.attributes[key] = value;
        }
    }

    getKeys() {
        return this.keys;
    }
}