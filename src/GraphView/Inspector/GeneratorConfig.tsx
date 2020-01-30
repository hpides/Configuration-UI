import React from 'react'

export abstract class GeneratorConfig {
    protected attributes: { [key: string]: any};

    constructor() {

        this.attributes = {
        };
    }

    abstract getTypeString(): string

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
        this.setAttribute(event.currentTarget.name, event.currentTarget.value);
    }

    render() {
        return(
            <div className="generator-config">
            </div>
        )
    }
}