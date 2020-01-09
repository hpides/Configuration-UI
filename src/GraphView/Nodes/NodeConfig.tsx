import React from 'react';

class NodeConfig {
    private name: String = "";

    setName(name: String) {
        this.name = name
    }

    getName() {
        return this.name;
    }
}

export default NodeConfig;