import { DefaultPortModel, PortModel } from "@projectstorm/react-diagrams";
import { Node } from "./Node";

export class AcyclicPort extends DefaultPortModel {
    canLinkToPort(port: PortModel): boolean {
        if (!(port instanceof AcyclicPort)) {
            return super.canLinkToPort(port);
        }

        if (this.options.in === port.options.in) {
            return false;
        }

        let endPort: AcyclicPort;
        let startPort: AcyclicPort;

        if (this.options.in) {
            startPort = port;
            endPort = this;
        } else {
            startPort = this;
            endPort = port;
        }

        // if we can reach startPort from endPort we would add a cycle when connecting

        let endNode = endPort.getNode();
        let startNode = startPort.getNode();

        if (!(endNode instanceof Node && startNode instanceof Node)) {
            return super.canLinkToPort(port);
        }

        if (endNode.hasPathTo(startNode)) {
            return false;
        }
        
        return true;
    }
}