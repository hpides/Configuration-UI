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