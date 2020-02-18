import React from 'react'
import {Type} from "class-transformer";
import "reflect-metadata";

export abstract class GeneratorConfig {
    protected attributes: { [key: string]: any};

    public abstract __type: string;
    constructor() {

        this.attributes = {
        };
    }

    abstract getTypeString(): string

    getAttributes() {
        return this.attributes;
    }
    setAttributes(attributes: { [key: string]: any}):void {
        this.attributes = attributes
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

    inputChanged = (event: React.FormEvent<HTMLInputElement>) => {
        //called during deserialization for some reason with undefined event. Do not perform operation in this case
        if(event) {
            this.setAttribute(event.currentTarget.name, event.currentTarget.value);
        }
    }

    render() {
        return(
            <div className="generator-config">
            </div>
        )
    }
}

export class EMailGeneratorConfig extends GeneratorConfig {
    __type="EMAIL";
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

export class ExistingDataConfig extends GeneratorConfig {
    __type="EXISTING";
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

export class RandomStringGeneratorConfig extends GeneratorConfig {
    __type="RANDOM_STRING";
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