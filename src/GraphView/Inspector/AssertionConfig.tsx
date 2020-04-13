import {Exclude} from "class-transformer";
import React, {MouseEvent} from "react";
import ReactTooltip from "react-tooltip";
import "reflect-metadata";
/*tslint:disable:max-classes-per-file*/
/* tslint:disable:variable-name ... */
export abstract class AssertionConfig {

    @Exclude()
     get keyhandler(): { enableDeleteKey: () => void; disableDeleteKey: () => void } {
        return this._keyhandler;
    }
    set keyhandler(handler: {enableDeleteKey: () => void; disableDeleteKey: () => void }) {
        this._keyhandler = handler;
    }

    set redraw(newVal: () => void) {
        this._redraw = newVal;
    }

    public static getTypeString(): string {
        return "";
    }

    public abstract type: string;

    public name: string = "";
    public updateParent?: (assertion: AssertionConfig) => void;
    @Exclude()
    protected _redraw: () => void;
    @Exclude()
    private _keyhandler: {
        disableDeleteKey: () => void,
        enableDeleteKey: () => void,
    };

    constructor(
        disableDeleteKey: () => void,
        enableDeleteKey: () => void,
        name: string = "",
        redraw: () => void,
        updateParent?: (assertion: AssertionConfig) => void,
    ) {
        this._keyhandler = {
            disableDeleteKey,
            enableDeleteKey,
        };
        this.name = name;
        this.updateParent = updateParent;
        this._redraw = redraw;
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
            this._redraw();
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
    public returnPage: boolean = false;

    public render(keyPressed: (event: React.KeyboardEvent) => void) {
        return(
            <div className="generator-config">
                <ReactTooltip />
                <label data-tip="Enter a valid XPATH expression. If the expression does not evaluate to a non-empty String value, the assertions is considered failed.">XPATH expression: </label>
                <input
                    onFocus={this.keyhandler.disableDeleteKey}
                    onBlur={this.keyhandler.enableDeleteKey}
                    type="text"
                    name="xpath"
                    onChange={this.inputChanged}
                    onKeyPress={keyPressed}
                    value={this.xpath}/>
                <label htmlFor="returnPage">Return whole page if no XPATH result was found:</label>
                <input type="checkbox" checked={this.returnPage}
                       onClick={(e) => this.invertReturnPage(e)} id={"returnPage"} />
            </div>
    );
    }

    private invertReturnPage = (e: MouseEvent<any, any>) => {
        // During import, this method is called for some reason with e=undefined. Do not alter the value in this case.
        if (e !== undefined) {
            this.returnPage = !this.returnPage;
            this._redraw();
        }
    }
}

export class JSONPATHAssertion extends AssertionConfig {

    public static getTypeString() {
        return "JSONPATH";
    }
    public type = JSONPATHAssertion.getTypeString();
    public jsonpath = "$[?(@.attr1=~ /val1/ && @.attr2=~ /attr2/)]";
    public returnResponse: boolean = false;

    public render(keyPressed: (event: React.KeyboardEvent) => void) {
        return(
            <div className="generator-config">
                <ReactTooltip />
                <label data-tip="Enter a valid JSONPATH expression. If the expression does not evaluate to a non-empty String value, the assertions is considered failed. Documentation can be found under https://github.com/json-path/JsonPath.">JSONPATH expression: </label>
                <input
                    onFocus={this.keyhandler.disableDeleteKey}
                    onBlur={this.keyhandler.enableDeleteKey}
                    type="text"
                    name="jsonpath"
                    onChange={this.inputChanged}
                    onKeyPress={keyPressed}
                    value={this.jsonpath}/>
                <label htmlFor="returnResponse">Return whole response if no JSONPATH result was found:</label>
                <input type="checkbox" checked={this.returnResponse}
                       onClick={(e) => this.invertReturnResponse(e)} id={"returnResponse"} />
            </div>
    );
    }

    private invertReturnResponse = (e: MouseEvent<any, any>) => {
        // During import, this method is called for some reason with e=undefined. Do not alter the value in this case.
        if (e !== undefined) {
            this.returnResponse = !this.returnResponse;
            this._redraw();
        }
    }
}

export class ContentNotEmptyAssertion extends AssertionConfig {

    public static  getTypeString() {
        return "CONTENT_NOT_EMPTY";
    }
    public type = ContentNotEmptyAssertion.getTypeString();
}
