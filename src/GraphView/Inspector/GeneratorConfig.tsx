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

    public render() {
        return(
            <div className="generator-config">
                <label>Domain:</label>
                <input onFocus={this.keyhandler.disableDeleteKey} onBlur={this.keyhandler.enableDeleteKey}
                       type="text" name="domain" onChange={this.inputChanged} />
                <label>Characters: </label>
                <input onFocus={this.keyhandler.disableDeleteKey} onBlur={this.keyhandler.enableDeleteKey}
                       type="text" name="characters" onChange={this.inputChanged} />
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

    public render() {
        return(
            <div className="generator-config">
                <label>Read from Table:</label>
                <input onFocus={this.keyhandler.disableDeleteKey} onBlur={this.keyhandler.enableDeleteKey}
                       type="text" name="table" onChange={this.inputChanged} />
            </div>
        );
    }
}

export class RandomStringGeneratorConfig extends GeneratorConfig {
    public __type = "RANDOM_STRING";
    constructor(disableDeleteKey: () => void, enableDeleteKey: () => void) {
        super(disableDeleteKey, enableDeleteKey);

        this.attributes = {
            maxChars: "10",
            minChars: "10",
            characters: "abcdefghijklmnopqrstuvwxyz"
        };
    }

    public getTypeString() {
        return "RANDOM_STRING";
    }

    public render() {
        return(
            <div className="generator-config">
                <label>Maximum Characters:</label>
                <input onFocus={this.keyhandler.disableDeleteKey} onBlur={this.keyhandler.enableDeleteKey}
                       type="text" name="maxChars" onChange={this.inputChanged} defaultValue={"10"} />
                <label>Minimum Characters:</label>
                <input onFocus={this.keyhandler.disableDeleteKey} onBlur={this.keyhandler.enableDeleteKey}
                       type="text" name="minChars" onChange={this.inputChanged} defaultValue={"10"} />
                <label>Allowed Characters:</label>
                <input onFocus={this.keyhandler.disableDeleteKey} onBlur={this.keyhandler.enableDeleteKey}
                       type="text" name="characters" onChange={this.inputChanged} defaultValue={"abcdefghijklmnopqrstuvwxyz"} />
            </div>
        );
    }
}
