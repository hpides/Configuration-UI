import { DefaultNodeModelOptions } from "@projectstorm/react-diagrams";
import { classToPlain, Type } from "class-transformer";
import "reflect-metadata";
import { ExistingConfigComponent } from "../../ExistingConfig/existingConfigComponent";
import { AtomType } from "../ConfigJson";
import {
    ExistingDataConfig,
    GeneratorConfig,
    RandomSentence,
    RandomStringGeneratorConfig,
} from "../Inspector/GeneratorConfig";
import { Node } from "./Node";

/*tslint:disable:max-classes-per-file*/
/*tslint:disable:variable-name*/
class DataToGenerate {

    @Type(() => GeneratorConfig)
    public value: Map<string, GeneratorConfig>;

    constructor(value: Map<string, GeneratorConfig>) {
        this.value = value;
    }
}

export class DataGenerationNode extends Node {

    get keyhandler(): { disableDeleteKey: () => void; enableDeleteKey: () => void } {
        return this._keyhandler;
    }

    set keyhandler(value: { disableDeleteKey: () => void; enableDeleteKey: () => void }) {
        this._keyhandler = value;
    }
    public get dataToGenerate(): DataToGenerate {
        return this._dataToGenerate;
    }

    private _dataToGenerate: DataToGenerate = new DataToGenerate(new Map<string, GeneratorConfig>());

    private _keyhandler: {
        disableDeleteKey: () => void,
        enableDeleteKey: () => void,
    };

    private existingConfig: ExistingConfigComponent;

    constructor(disableDeleteKey: () => void, enableDeleteKey: () => void,
                existingConfig: ExistingConfigComponent, options?: DefaultNodeModelOptions) {
                    
        super(options);

        this.attributes.name = "Data Generation";
        this.attributes.dataToGenerate = JSON.stringify(classToPlain(this._dataToGenerate));
        this.attributes.data = [];
        this.attributes.table = null;
        this.attributes.staticValues = {};
        this._keyhandler = {
            disableDeleteKey,
            enableDeleteKey,
        };
        this.existingConfig = existingConfig;
    }

    public getAtomType(): AtomType {
        return "DATA_GENERATION";
    }

    public setAttribute(attr: string, value: any) {
        super.setAttribute(attr, value);
        if (attr === "dataToGenerate" && typeof value === "string") {
            const parsed = JSON.parse(value);
            this._dataToGenerate = new DataToGenerate(new Map<string, GeneratorConfig>());
            for (const key of Object.keys(parsed.value)) {
                let conf: GeneratorConfig;
                const current = parsed.value[key];
                switch (current.__type) {
                    case "RANDOM_SENTENCE":
                        conf = new RandomSentence(this._keyhandler.disableDeleteKey,
                            this._keyhandler.enableDeleteKey);
                        break;
                    case "EXISTING":
                        conf = new ExistingDataConfig(this._keyhandler.disableDeleteKey,
                            this._keyhandler.enableDeleteKey);
                        break;
                    case "RANDOM_STRING":
                        conf = new RandomStringGeneratorConfig(this._keyhandler.disableDeleteKey,
                            this._keyhandler.enableDeleteKey);
                        break;
                    default:
                        alert("Can not deserialize a " + current.__type);
                        return;
                }
                conf.setAttributes(current.attributes);
                this._dataToGenerate.value.set(key, conf);
            }
        } else if (attr === "dataToGenerate") {
            this._dataToGenerate = value;
        }
    }

    public addData(name: string, genConfig: GeneratorConfig) {
        // generator config has to have valid handlers
        this._keyhandler = genConfig.keyhandler;
        this._dataToGenerate.value.set(name, genConfig);
        this.getAttribute("data").push(name);
        this.setAttribute("dataToGenerate", JSON.stringify(classToPlain(this._dataToGenerate)));
    }

    public removeData(key: string) {
        this._dataToGenerate.value.delete(key);
        const newData = [];
        for (const attribute of this.getAttribute("data") ) {
            if (attribute !== key) {
                newData.push(attribute);
            }
        }
        this.setAttribute("data", newData);
        this.setAttribute("dataToGenerate", JSON.stringify(classToPlain(this._dataToGenerate)));
    }

    public clearData() {
        for (const attribute of this.getAttribute("data")) {
            this.removeData(attribute);
        }
    }
}
