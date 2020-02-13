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

    render() {
        return(
            <div className="generator-config">
                <label>Maximum Characters:</label>
                <input type="text" name="maxChars" onChange={this.inputChanged} />
            </div>
        )
    }
}