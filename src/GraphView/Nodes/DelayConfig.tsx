import NodeConfig from "./NodeConfig";

class DelayConfig extends NodeConfig {
    protected keys = [
        "name",
        "delay"
    ]

    constructor() {
        super();

        this.attributes = {
            "name": "Delay",
            "delay": "1"
        };
    }
}

export default DelayConfig;