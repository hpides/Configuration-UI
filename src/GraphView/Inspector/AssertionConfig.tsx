import {Exclude} from "class-transformer";
import React from "react";
import ReactTooltip from "react-tooltip";
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
    public updateParent?: (assertion: AssertionConfig) => void;
    @Exclude()
    private readonly _keyhandler: {
        disableDeleteKey: () => void,
        enableDeleteKey: () => void,
    };
    constructor(
        disableDeleteKey: () => void,
        enableDeleteKey: () => void,
        name: string = "",
        updateParent?: (assertion: AssertionConfig) => void,
    ) {
        this._keyhandler = {
            disableDeleteKey,
            enableDeleteKey,
        };
        this.name = name;
        this.updateParent = updateParent;
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
            if (this.updateParent) { this.updateParent(this); }
        }
    }

    public render(keyPressed: (event: React.KeyboardEvent) => void) {
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

    public render(keyPressed: (event: React.KeyboardEvent) => void) {
        return(
            <div className="generator-config">
                <label>Response Code: </label>
                <input
                    onFocus={this.keyhandler.disableDeleteKey}
                    onBlur={this.keyhandler.enableDeleteKey}
                    type="number"
                    name="responseCode"
                    onChange={this.inputChanged}
                    onKeyPress={keyPressed}
                    value={this.responseCode}/>
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

    public render(keyPressed: (event: React.KeyboardEvent) => void) {
        return(
            <div className="generator-config">
                <label>Content Type: </label>
                <input
                    onFocus={this.keyhandler.disableDeleteKey}
                    onBlur={this.keyhandler.enableDeleteKey}
                    type="text"
                    name="contentType"
                    onChange={this.inputChanged}
                    onKeyPress={keyPressed}
                    value={this.contentType}/>
            </div>
    );
    }
}

export class XPATHAssertion extends AssertionConfig {

    public static getTypeString() {
        return "XPATH";
    }
    public type = XPATHAssertion.getTypeString();
    public xpath = "//h1[text()='Hello World!']";

    public render(keyPressed: (event: React.KeyboardEvent) => void) {
        return(
            <div className="generator-config">
                <ReactTooltip />
                <label data-tip="Enter a valid XPATH expression. If the expression does not evaluate to a non-empty Stringvalue, the assertions is considered failed.">XPATH expression: </label>
                <input
                    onFocus={this.keyhandler.disableDeleteKey}
                    onBlur={this.keyhandler.enableDeleteKey}
                    type="text"
                    name="xpath"
                    onChange={this.inputChanged}
                    onKeyPress={keyPressed}
                    value={this.xpath}/>
            </div>
    );
    }
}

export class ContentNotEmptyAssertion extends AssertionConfig {

    public static  getTypeString() {
        return "CONTENT_NOT_EMPTY";
    }
    public type = ContentNotEmptyAssertion.getTypeString();
}
