import React from 'react'
import { GeneratorConfig } from './GeneratorConfig';

export class ExistingDataConfig extends GeneratorConfig {
    protected attributes: { [key: string]: any};

    constructor() {
        super();

        this.attributes = {
            "table": "",
            "key": "",
        };
    }

    getTypeString() {
        return "EXISTING";
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
                <label>Table:</label>
                <input type="text" name="table" onChange={this.inputChanged} />
                <label>Key: </label>
                <input type="text" name="key" onChange={this.inputChanged} />
            </div>
        )
    }
}