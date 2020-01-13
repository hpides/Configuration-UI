import NodeConfig from "./NodeConfig";

class DataGenerationConfig extends NodeConfig {
    protected keys = [
        "name",
        "table"
    ]

    constructor() {
        super();

        this.attributes = {
            "name": "Data Generation",
            "table": ""
        };
    }
}

export default DataGenerationConfig;