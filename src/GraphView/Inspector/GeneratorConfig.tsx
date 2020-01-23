import React from 'react'

export class GeneratorConfig {
    protected attributes: { [key: string]: any};

    constructor() {

        this.attributes = {
            "maxChars" : "10",
        };
    }

    getTypeString() {
        return "RandomString";
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

    inputChanged = (event: React.FormEvent<HTMLInputElement>) => {
        this.setAttribute("maxChars", event.currentTarget.value);
    }

    render() {
        return(
            <div className="generator-config">
                <label>Maximum Characters:</label>
                <input type="text" onChange={this.inputChanged} />
            </div>
        )
    }
}