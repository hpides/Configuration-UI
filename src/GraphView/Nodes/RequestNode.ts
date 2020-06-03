import { DefaultNodeModelOptions } from "@projectstorm/react-diagrams";
import { AtomType } from "../ConfigJson";
import {
    AssertionConfig,
    ContentNotEmptyAssertion,
    ContentTypeAssertion, JSONPATHAssertion,
    ResponseCodeAssertion, XPATHAssertion,
} from "../Inspector/AssertionConfig";
import { Node } from "./Node";
import {classToPlain} from "class-transformer";
import "reflect-metadata";

interface IBasicAuth {
    user: string;
    password: string;
}

export class RequestNode extends Node {

    private keyhandler: {
        disableDeleteKey: () => void,
        enableDeleteKey: () => void,
    } = {disableDeleteKey: () => {
            // do nothing because there is not view which can disable the delete key
        },
        enableDeleteKey: () => {
            // do nothing because there is not view which can enable the delete key
        } };

    constructor(options?: DefaultNodeModelOptions) {
        super(options);

        this.attributes.name = "Request";
        this.attributes.repeat = "1";
        this.attributes.verb = "GET";
        this.attributes.addr = "";
        this.attributes.requestJSONObject = "";
        this.attributes.responseJSONObject = "";
        this.attributes.requestParams = "";
        this.attributes.basicAuth = null;
        this.attributes.assertions = [];
        this.attributes.receiveCookies = {};
        this.attributes.sendCookies = {};
        this.attributes.tokenNames = {};
        this.attributes.xpaths = {};
        this.attributes.timeAggregation = true;
        this.attributes.sendHeaders = {};
        this.attributes.receiveHeaders = {};
    }

    public getAtomType(): AtomType {
        return "REQUEST";
    }

    public setAttribute(attr: string, value: any) {
        super.setAttribute(attr, value);
        if (attr === "assertions") {
            // logic relies on custom parsing
            if (typeof value !== "string") {
                value = JSON.stringify(value);
            }
            const parsed = JSON.parse(value);
            this.attributes.assertions = [];
            for (const current of parsed) {
                let conf;
                switch (current.type) {
                    case ResponseCodeAssertion.getTypeString():
                        conf = new ResponseCodeAssertion(this.keyhandler.disableDeleteKey,
                            this.keyhandler.enableDeleteKey, current.name, () => {});
                        break;
                    case ContentNotEmptyAssertion.getTypeString():
                        conf = new ContentNotEmptyAssertion(this.keyhandler.disableDeleteKey,
                            this.keyhandler.enableDeleteKey, current.name, () => {});
                        break;
                    case ContentTypeAssertion.getTypeString():
                        conf = new ContentTypeAssertion(this.keyhandler.disableDeleteKey,
                            this.keyhandler.enableDeleteKey, current.name, () => {});
                        break;
                    case XPATHAssertion.getTypeString():
                        conf = new XPATHAssertion(this.keyhandler.disableDeleteKey,
                            this.keyhandler.enableDeleteKey, current.name, () => {});
                        break;
                    case JSONPATHAssertion.getTypeString():
                        conf = new JSONPATHAssertion(this.keyhandler.disableDeleteKey,
                            this.keyhandler.enableDeleteKey, current.name, () => {});
                        break;
                    default:
                        alert("Can not deserialize a " + current.__type);
                        return;
                }
                // will copy all keys over
                Object.assign(conf, current);
                this.attributes.assertions.push(conf);
            }
        }
    }

    public addAssertion(assertion: AssertionConfig) {
        this.keyhandler = assertion.keyhandler;
        this.attributes.assertions.push(assertion);
        this.setAttribute("assertions", JSON.stringify(classToPlain(this.attributes.assertions)));
    }
}
