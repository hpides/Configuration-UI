import React from "react";
import "reflect-metadata";
/*tslint:disable:max-classes-per-file*/
/* tslint:disable:variable-name ... */
export abstract class GeneratorConfig {

    public abstract __type: string;
    protected attributes: { [key: string]: any};
    constructor() {

        this.attributes = {
        };
    }

    public abstract getTypeString(): string;

    public getAttributes() {
        return this.attributes;
    }
    public setAttributes(attributes: { [key: string]: any}): void {
        this.attributes = attributes;
    }

    public getAttribute(key: string) {
        return this.attributes[key];
    }

    public setAttribute(key: string, value: any) {
        if (this.getKeys().includes(key)) {
            this.attributes[key] = value;
        }
    }

    public getKeys() {
        return Object.keys(this.attributes);
    }

    public inputChanged = (event: React.FormEvent<HTMLInputElement>) => {
        // called during deserialization for some reason with undefined event. Do not perform operation in this case
        if (event) {
            this.setAttribute(event.currentTarget.name, event.currentTarget.value);
        }
    }

    public render() {
        return(
            <div className="generator-config">
            </div>
        );
    }
}

export class EMailGeneratorConfig extends GeneratorConfig {
    public __type = "EMAIL";
    constructor() {
        super();

        this.attributes = {
            characters: "10",
            domain: "example.com",
        };
    }

    public getTypeString() {
        return "E_MAIL";
    }

    public render() {
        return(
            <div className="generator-config">
                <label>Domain:</label>
                <input type="text" name="domain" onChange={this.inputChanged} />
                <label>Characters: </label>
                <input type="text" name="characters" onChange={this.inputChanged} />
            </div>
        );
    }
}

export class ExistingDataConfig extends GeneratorConfig {
    public __type = "EXISTING";
    constructor() {
        super();

        this.attributes = {
            table: "",
        };
    }

    public getTypeString() {
        return "EXISTING";
    }

    public render() {
        return(
            <div className="generator-config">
                <label>Read from Table:</label>
                <input type="text" name="table" onChange={this.inputChanged} />
            </div>
        );
    }
}

export class RandomStringGeneratorConfig extends GeneratorConfig {
    public __type = "RANDOM_STRING";
    constructor() {
        super();

        this.attributes = {
            maxChars: "10",
        };
    }

    public getTypeString() {
        return "RANDOM_STRING";
    }

    public render() {
        return(
            <div className="generator-config">
                <label>Maximum Characters:</label>
                <input type="text" name="maxChars" onChange={this.inputChanged} />
            </div>
        );
    }
}
