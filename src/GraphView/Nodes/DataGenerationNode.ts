import {DefaultNodeModelOptions} from "@projectstorm/react-diagrams";
import {Node} from './Node';
import {AtomType} from "../ConfigJson";
import {
    EMailGeneratorConfig,
    ExistingDataConfig,
    GeneratorConfig,
    RandomStringGeneratorConfig
} from "../Inspector/GeneratorConfig";
import {classToPlain, Type} from "class-transformer";
import "reflect-metadata";

export class dataToGenerateClass {

    @Type(() => GeneratorConfig)
    public value: Map<string, GeneratorConfig>;

    constructor(value: Map<string, GeneratorConfig>) {
        this.value = value
    }
}

export class DataGenerationNode extends Node {
    public get dataToGenerate(): dataToGenerateClass {
        return this._dataToGenerate;
    }

    private _dataToGenerate: dataToGenerateClass = new dataToGenerateClass(new Map<string, GeneratorConfig>());

    constructor(options?: DefaultNodeModelOptions) {
        super(options);

        this.attributes.name = "Data Generation";
        this.attributes.dataToGenerate = JSON.stringify(classToPlain(this._dataToGenerate))
    }

    getAtomType(): AtomType {
        return "DATA_GENERATION";
    }

    setAttribute(attr: string, value: any) {
        super.setAttribute(attr, value);
        if (attr === "dataToGenerate" && typeof value === "string") {
            const parsed = JSON.parse(value);
            this._dataToGenerate = new dataToGenerateClass(new Map<string, GeneratorConfig>());
            for (let key of Object.keys(parsed.value)) {
                let conf: GeneratorConfig;
                const current = parsed.value[key];
                switch (current.__type) {
                    case "EMAIL":
                        conf = new EMailGeneratorConfig();
                        break;
                    case "EXISTING":
                        conf = new ExistingDataConfig();
                        break;
                    case "RANDOM_STRING":
                        conf = new RandomStringGeneratorConfig();
                        break;
                    default:
                        alert("Can not deserialize a "+current.__type);
                        return
                }
                conf.setAttributes(current.attributes);
                this._dataToGenerate.value.set(key, conf);
            }
        }
        else if (attr === "dataToGenerate") {
            this._dataToGenerate = value
        }
    }

    addData(name: string, genConfig: GeneratorConfig) {
        this._dataToGenerate.value.set(name, genConfig);
        this.setAttribute("dataToGenerate", JSON.stringify(classToPlain(this._dataToGenerate)));
    }
}