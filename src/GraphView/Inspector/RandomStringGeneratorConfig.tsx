import React from 'react'
import { GeneratorConfig } from './GeneratorConfig';

export class RandomStringGeneratorConfig extends GeneratorConfig {
    protected attributes: { [key: string]: any};

    constructor() {
        super();

        this.attributes = {
            "maxChars": "10",
        };
    }

    getTypeString() {
        return "RANDOM_STRING"
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

    render() {
        return(
            <div className="generator-config">
                <label>Maximum Characters:</label>
                <input type="text" name="maxChars" onChange={this.inputChanged} />
            </div>
        )
    }
}