import React from 'react'
import { GeneratorConfig } from './GeneratorConfig';

export class ExistingDataConfig extends GeneratorConfig {
    protected attributes: { [key: string]: any};

    constructor() {
        super();

        this.attributes = {
            "table": "",
        };
    }

    getTypeString() {
        return "EXISTING";
    }
    
    render() {
        return(
            <div className="generator-config">
                <label>Read from Table:</label>
                <input type="text" name="table" onChange={this.inputChanged} />
            </div>
        )
    }
}