import {Exclude} from "class-transformer";
import React from "react";
import "reflect-metadata";
/*tslint:disable:max-classes-per-file*/
/* tslint:disable:variable-name ... */
export abstract class AssertionConfig {

    @Exclude()
     get keyhandler(): { enableDeleteKey: () => void; disableDeleteKey: () => void } {
        return this._keyhandler;
    }

    public static getTypeString(): string {
        return "";
    }

    public abstract type: string;

    public name: string = "";

    private readonly _keyhandler: {
        disableDeleteKey: () => void,
        enableDeleteKey: () => void,
    };
    constructor(disableDeleteKey: () => void, enableDeleteKey: () => void) {
        this._keyhandler = {
            disableDeleteKey,
            enableDeleteKey,
        };
    }

    public setAttribute(key: string, value: any) {
        if (this.getKeys().includes(key)) {
            const val: {[key: string]: any} = {};
            val[key] = value;
            Object.assign(this, val);
        }
    }

    public getKeys() {
        return Object.keys(this);
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

export class ResponseCodeAssertion extends AssertionConfig {

    public static getTypeString() {
        return "RESPONSE_CODE";
    }
    public type = ResponseCodeAssertion.getTypeString();
    public responseCode = 200;

    public render() {
        return(
            <div className="generator-config">
                <label>Name:</label>
        <input onFocus={this.keyhandler.disableDeleteKey} onBlur={this.keyhandler.enableDeleteKey}
        type="text" name="name" onChange={this.inputChanged} />
        <label>Response Code: </label>
        <input onFocus={this.keyhandler.disableDeleteKey} onBlur={this.keyhandler.enableDeleteKey}
        type="number" name="responseCode" onChange={this.inputChanged} />
        </div>
    );
    }
}

export class ContentTypeAssertion extends AssertionConfig {

    public static getTypeString() {
        return "CONTENT_TYPE";
    }
    public type = ContentTypeAssertion.getTypeString();
    public contentType = "application/JSON";

    public render() {
        return(
            <div className="generator-config">
                <label>Name:</label>
        <input onFocus={this.keyhandler.disableDeleteKey} onBlur={this.keyhandler.enableDeleteKey}
        type="text" name="name" onChange={this.inputChanged} />
        <label>Content Type: </label>
        <input onFocus={this.keyhandler.disableDeleteKey} onBlur={this.keyhandler.enableDeleteKey}
        type="text" name="contentType" onChange={this.inputChanged} />
        </div>
    );
    }
}

export class ContentNotEmptyAssertion extends AssertionConfig {

    public static  getTypeString() {
        return "CONTENT_NOT_EMPTY";
    }
    public type = ContentNotEmptyAssertion.getTypeString();

    public render() {
        return(
            <div className="generator-config">
                <label>Name:</label>
                <input onFocus={this.keyhandler.disableDeleteKey} onBlur={this.keyhandler.enableDeleteKey}
                       type="text" name="name" onChange={this.inputChanged} />
            </div>
        );
    }
}
