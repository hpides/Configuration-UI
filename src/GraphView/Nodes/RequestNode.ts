import { DefaultNodeModelOptions } from "@projectstorm/react-diagrams";
import { Node } from './Node';

export class RequestNode extends Node {
    protected attributes: { [key: string]: any};
    protected keys = [
        "name",
        "endpoint"
    ]
    constructor(options?: DefaultNodeModelOptions) {
        super(options);

        this.attributes = {
            "name" : "Request",
            "endpoint" : "",
        };
    }
}