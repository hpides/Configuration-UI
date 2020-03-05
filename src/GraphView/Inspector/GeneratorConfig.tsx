import React from "react";
import "reflect-metadata";
/*tslint:disable:max-classes-per-file*/
/* tslint:disable:variable-name ... */
export abstract class GeneratorConfig {
    get keyhandler(): { enableDeleteKey: () => void; disableDeleteKey: () => void } {
        return this._keyhandler;
    }

    public abstract __type: string;
    protected attributes: { [key: string]: any};

    private _keyhandler: {
        disableDeleteKey: () => void,
        enableDeleteKey: () => void,
    };
    constructor(disableDeleteKey: () => void, enableDeleteKey: () => void) {
        this._keyhandler = {
            disableDeleteKey,
            enableDeleteKey,
        };
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

    public render(inputChanged: (event: React.FormEvent<HTMLInputElement>) => void) {
        return(
            <div className="generator-config">
            </div>
        );
    }
}

export class EMailGeneratorConfig extends GeneratorConfig {
    public __type = "EMAIL";
    constructor(disableDeleteKey: () => void, enableDeleteKey: () => void) {
        super(disableDeleteKey, enableDeleteKey);

        this.attributes = {
            characters: "10",
            domain: "example.com",
        };
    }

    public getTypeString() {
        return "E_MAIL";
    }

    public render(inputChanged: (event: React.FormEvent<HTMLInputElement>) => void) {
        return(
            <div className="generator-config">
                <label>Domain:</label>
                <input onFocus={this.keyhandler.disableDeleteKey} onBlur={this.keyhandler.enableDeleteKey}
                       type="text" name="domain" onChange={inputChanged} value={this.getAttribute("domain")}/>
                <label>Characters: </label>
                <input onFocus={this.keyhandler.disableDeleteKey} onBlur={this.keyhandler.enableDeleteKey}
                       type="text" name="characters" onChange={inputChanged} value={this.getAttribute("characters")}/>
            </div>
        );
    }
}

export class ExistingDataConfig extends GeneratorConfig {
    public __type = "EXISTING";
    constructor(disableDeleteKey: () => void, enableDeleteKey: () => void) {
        super(disableDeleteKey, enableDeleteKey);

        this.attributes = {
            table: "",
        };
    }

    public getTypeString() {
        return "EXISTING";
    }

    public render(inputChanged: (event: React.FormEvent<HTMLInputElement>) => void) {
        return(
            <div className="generator-config">
                <label>Read from Table:</label>
                <input onFocus={this.keyhandler.disableDeleteKey} onBlur={this.keyhandler.enableDeleteKey}
                       type="text" name="table" onChange={inputChanged} value={this.getAttribute("table")}/>
            </div>
        );
    }
}

export class RandomStringGeneratorConfig extends GeneratorConfig {
    public __type = "RANDOM_STRING";
    constructor(disableDeleteKey: () => void, enableDeleteKey: () => void) {
        super(disableDeleteKey, enableDeleteKey);

        this.attributes = {
            characters: "abcdefghijklmnopqrstuvwxyz",
            maxChars: "10",
            minChars: "10",
        };
    }

    public getTypeString() {
        return "RANDOM_STRING";
    }

    public render(inputChanged: (event: React.FormEvent<HTMLInputElement>) => void) {
        return(
            <div className="generator-config">
                <label>Maximum Characters:</label>
                <input onFocus={this.keyhandler.disableDeleteKey} onBlur={this.keyhandler.enableDeleteKey}
                       type="text" name="maxChars" onChange={inputChanged} value={this.getAttribute("maxChars")}/>
                <label>Minimum Characters:</label>
                <input onFocus={this.keyhandler.disableDeleteKey} onBlur={this.keyhandler.enableDeleteKey}
                       type="text" name="minChars" onChange={inputChanged} value={this.getAttribute("minChars")}/>
                <label>Allowed Characters:</label>
                <input onFocus={this.keyhandler.disableDeleteKey} onBlur={this.keyhandler.enableDeleteKey}
                       type="text" name="characters" onChange={inputChanged} value={this.getAttribute("characters")} />
            </div>
        );
    }
}
