abstract class NodeConfig {
    protected attributes: { [key: string]: any };
    protected keys = [
        "name",
    ]

    constructor() {
        this.attributes = {
            "name" : "Node"
        };
    }

    getAttributes() {
        return this.attributes
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

export default NodeConfig;