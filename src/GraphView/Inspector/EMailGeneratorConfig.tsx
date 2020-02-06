import React from 'react'
import { GeneratorConfig } from './GeneratorConfig';

export class EMailGeneratorConfig extends GeneratorConfig {
    protected attributes: { [key: string]: any};

    constructor() {
        super();

        this.attributes = {
            "domain": "example.com",
            "characters": "10",
        };
    }

    getTypeString() {
        return "E_MAIL";
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
                <label>Domain:</label>
                <input type="text" name="domain" onChange={this.inputChanged} />
                <label>Characters: </label>
                <input type="text" name="characters" onChange={this.inputChanged} />
            </div>
        )
    }
}