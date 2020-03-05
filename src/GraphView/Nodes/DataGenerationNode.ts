import {DefaultNodeModelOptions} from "@projectstorm/react-diagrams";
import {classToPlain, Type} from "class-transformer";
import "reflect-metadata";
import {AtomType} from "../ConfigJson";
import {
    EMailGeneratorConfig,
    ExistingDataConfig,
    GeneratorConfig,
    RandomStringGeneratorConfig,
} from "../Inspector/GeneratorConfig";
import {Node} from "./Node";
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
    public get dataToGenerate(): DataToGenerate {
        return this._dataToGenerate;
    }

    private _dataToGenerate: DataToGenerate = new DataToGenerate(new Map<string, GeneratorConfig>());

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

        this.attributes.name = "Data Generation";
        this.attributes.dataToGenerate = JSON.stringify(classToPlain(this._dataToGenerate));
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
                    case "EMAIL":
                        conf = new EMailGeneratorConfig(this.keyhandler.disableDeleteKey,
                            this.keyhandler.enableDeleteKey);
                        break;
                    case "EXISTING":
                        conf = new ExistingDataConfig(this.keyhandler.disableDeleteKey,
                            this.keyhandler.enableDeleteKey);
                        break;
                    case "RANDOM_STRING":
                        conf = new RandomStringGeneratorConfig(this.keyhandler.disableDeleteKey,
                            this.keyhandler.enableDeleteKey);
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
        this.keyhandler = genConfig.keyhandler;
        this._dataToGenerate.value.set(name, genConfig);
        this.setAttribute("dataToGenerate", JSON.stringify(classToPlain(this._dataToGenerate)));
    }

    public removeData(key: string) {
        this._dataToGenerate.value.delete(key);
        this.setAttribute("dataToGenerate", JSON.stringify(classToPlain(this._dataToGenerate)));
    }
}
