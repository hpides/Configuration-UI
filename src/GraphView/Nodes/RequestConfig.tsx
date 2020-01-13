import NodeConfig from "./NodeConfig";

class RequestConfig extends NodeConfig {
    protected keys = [
        "name",
        "endpoint"
    ]

    constructor() {
        super();

        this.attributes = {
            "name": "Request",
            "endpoint": ""
        };
    }
}

export default RequestConfig;