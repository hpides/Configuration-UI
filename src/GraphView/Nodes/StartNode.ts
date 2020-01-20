import { DefaultNodeModelOptions, PortModelAlignment } from "@projectstorm/react-diagrams";
import { Node } from './Node';
import { AcyclicPort } from "./AcyclicPort";

export class StartNode extends Node {
    protected attributes: { [key: string]: any};
    
    constructor(options?: DefaultNodeModelOptions) {
        super(options);

        this.attributes = {
            "name" : "Start",
        };
    }

    addPorts() {
        let outPort = new AcyclicPort({
            in: false,
            name: 'Out',
            label: 'Out',
            alignment: PortModelAlignment.RIGHT
        })
        this.addPort(outPort);
    }
}