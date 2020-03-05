import React from "react";
import Dropzone from 'react-dropzone'
import {instanceOf} from "prop-types";

export interface IState {
    existingTables: string[],
    tableMapping: Map<string, string[]>
}

export class ExistingConfigComponent extends React.Component<{},IState> {
    public constructor(props:{}){
        super(props);
        this.state={existingTables: [], tableMapping: new Map<string, string[]>()}
    }

    public onDrop(files: File[]){
        for(let file of files){
            const reader = new FileReader();
            reader.onload = () => {
                console.log("Read "+(reader.result || "").toString().length+"bytes");
                if(reader.result && !(reader.result instanceof ArrayBuffer)){
                    this.processFileContents(reader.result);
                }
            };
            reader.readAsText(file)
        }
    }

    public processFileContents(reader:string) {
        const xml = new DOMParser().parseFromString(reader.toString(), "text/xml");
        const tables = xml.evaluate("//table/@name", xml, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE);
        let node;
        while ((node = tables.iterateNext()) !== null) {
            console.log(node.nodeValue)
            if (node.nodeValue) {
                this.state.existingTables.push(node.nodeValue);
            }
            this.setState({existingTables: this.state.existingTables});
            const fields = xml.evaluate("//table[@name=\""+node.nodeValue+"\"]/field/@name", xml, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE);
            let field;
            while ((field = fields.iterateNext()) !== null) {
                console.log("Table "+node.nodeValue+" field "+field.nodeValue);
                if(!this.state.tableMapping.has(node.nodeValue+"")){
                    this.state.tableMapping.set(node.nodeValue+"", [])
                }

                this.state.tableMapping.get(node.nodeValue+"")!.push(field.nodeValue+"");
            }
        }
    }

    public render(){
        return <div>
            <Dropzone onDrop={ (files) => this.onDrop(files)}>
                {({getRootProps, getInputProps}) => (
                    <section>
                        <div {...getRootProps()}>
                            <input {...getInputProps()} />
                            <p>Drag 'n' drop some files here, or click to select files</p>
                        </div>
                    </section>
                )}
            </Dropzone>

        </div>
    }
}