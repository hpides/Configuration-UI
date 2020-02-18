import { DefaultNodeModelOptions } from "@projectstorm/react-diagrams";
import { Node } from './Node';
import { AtomType } from "../ConfigJson";
import { GeneratorConfig } from "../Inspector/GeneratorConfig";

export type DataGenDict = { [key: string] : GeneratorConfig }

export class DataGenerationNode extends Node {
    public get dataToGenerate(): DataGenDict {
        return this._dataToGenerate;
    }
    private _dataToGenerate: DataGenDict = {};
    
    constructor(options?: DefaultNodeModelOptions) {
        super(options);

        this.attributes.name="Data Generation";
        this.setAttribute("dataToGenerate", this._dataToGenerate)
    }

    getAtomType(): AtomType {
        return "DATA_GENERATION";
    }

    setAttribute(attr: string, value: any){
        super.setAttribute(attr, value);
        if(attr === "dataToGenerate" && typeof value === "string"){
            const currentConfig = JSON.parse(value);
            this._dataToGenerate = {};
            //TODO parse generator configs
        }
        else if(attr === "dataToGenerate"){
            this._dataToGenerate = value
        }
    }

    addData(name: string, genConfig: GeneratorConfig) {
        this._dataToGenerate[name] = genConfig;
        this.setAttribute("dataToGenerate", JSON.stringify(this._dataToGenerate))
    }
}