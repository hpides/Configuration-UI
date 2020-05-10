import React from "react";
import Dropzone from "react-dropzone";
import Alert from "reactstrap/lib/Alert";
import "../evaluation/Evaluation.css";
export interface IUploadedFile {
    existingTables: string[];
    tableMapping: Map<string, string[]>;
    fileContent: string;
}

export interface IState {
    uploadedFiles: Map<string, IUploadedFile>;
    // redundant, but handy in other components
    allTables: Set<string>;
    lastError: string;
}

export class ExistingConfigComponent extends React.Component<{}, IState> {
    public constructor(props: {}) {
        super(props);
        this.state = {uploadedFiles: new Map<string, IUploadedFile>(), lastError: "", allTables: new Set<string>()};
    }

    public onDrop(files: File[]) {
        for (const file of files) {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result && !(reader.result instanceof ArrayBuffer)) {
                    this.processFileContents(reader.result, file.name);
                }
            };
            reader.readAsText(file);
        }
    }

    public processFileContents(reader: string, filename: string) {
        const allTables = [];
        this.setState({lastError: ""});
        let tables;
        let xml;
        xml = new DOMParser().parseFromString(reader.toString(), "text/xml");

        // some browsers, e.g. MS Edge, output a whole html document here.
        // Select respective element with error and render it if html if applicable.
        if (xml.getElementsByTagName("parsererror").length > 0) {
                this.setState({lastError: xml.getElementsByTagName("parsererror")[0].innerHTML + ""});
                return;
            }
        tables = xml.evaluate("//table/@name", xml, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE);

        let node;
        const uploadedFileRepr: IUploadedFile = {existingTables: [], fileContent: reader,
            tableMapping: new Map<string, string[]>()};
        while ((node = tables.iterateNext()) !== null) {
            if (node.nodeValue) {
               uploadedFileRepr.existingTables.push(node.nodeValue);
               allTables.push(node.nodeValue);
            }
            const fields = xml.evaluate("//table[@name=\"" + node.nodeValue
                + "\"]/field/@name", xml, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE);
            let field;
            while ((field = fields.iterateNext()) !== null) {
                if (!uploadedFileRepr.tableMapping.has(node.nodeValue + "")) {
                    uploadedFileRepr.tableMapping.set(node.nodeValue + "", []);
                }
                uploadedFileRepr.tableMapping.get(node.nodeValue + "")!.push(field.nodeValue + "");
            }
        }
        this.state.uploadedFiles.set(filename, uploadedFileRepr);
        allTables.forEach((value) => this.state.allTables.add(value));
        this.setState({uploadedFiles: this.state.uploadedFiles, allTables: this.state.allTables});

    }

    public render() {
        return <div>
            <div>
                {this.state.lastError === "" ? <div/> : <Alert color="danger">
                    Import error: <div dangerouslySetInnerHTML={{__html: this.state.lastError}}/></Alert>}
            </div>
            <div className="dropzone">
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
        <label>Loaded configurations:</label>
            <ul>
            {Array.from(this.state.uploadedFiles.keys()).map((filename, fileIndex) => {
                return <li key={fileIndex}>{filename + " : "}{
                    <ul>
                        {Array.from(this.state.uploadedFiles.get(filename)!
                            .tableMapping.keys()).map((tablename, tableIndex) => {
                            return <li key={tableIndex}>{"Table: " + tablename +
                            ", Fields:" + this.state.uploadedFiles.get(filename)!
                                .tableMapping.get(tablename)!.map((field) => {
                                // react will separate them by commata
                                return " " + field;
                            })}</li>;
                        })}
                    </ul>
                }</li>;
            })}
            </ul>
        </div>;
    }
}
