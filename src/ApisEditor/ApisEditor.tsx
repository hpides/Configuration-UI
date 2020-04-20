import React from "react";
import "./ApisEditor.css";
import Dropzone from "react-dropzone";
import Alert from "reactstrap/lib/Alert";
import YAML from "yaml";

export interface IUploadedFile {
    existingEndpoints: string[];
    fileContent: string;
}

export interface IState {
    uploadedFiles: Map<string, IUploadedFile>;
    allEndpoints: Set<string>;
    lastError: string;
}

export class ApisEditor extends React.Component<{}, IState> {
    public constructor(props: {}) {
        super(props);
        this.state = {
            uploadedFiles: new Map<string, IUploadedFile>(),
            lastError: "",
            allEndpoints: new Set<string>()
        };
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

    public async processFileContents(reader: string, filename: string) {
        this.setState({lastError: ""});

        let api = YAML.parse(reader.toString());
        let paths = api.paths;
        let endpoints = Object.keys(paths);

        console.log(Object.keys(paths));

        const uploadedFileRepr: IUploadedFile = {
            existingEndpoints: [],
            fileContent: reader
        };

        uploadedFileRepr.existingEndpoints = endpoints;

        this.state.uploadedFiles.set(filename, uploadedFileRepr);
        endpoints.forEach((value) => this.state.allEndpoints.add(value));
        console.log(this.state.allEndpoints);
        this.setState({uploadedFiles: this.state.uploadedFiles, allEndpoints: this.state.allEndpoints});
    }

    public render() {
        return <div>
            <div>
                {this.state.lastError === "" ? <div/> : <Alert color="danger">
                    Import error: <div dangerouslySetInnerHTML={{__html: this.state.lastError}}/></Alert>}
            </div>
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
        <label>Loaded configurations:</label>
            <ul>
            {Array.from(this.state.uploadedFiles.keys()).map((filename, fileIndex) => {
                return <li key={fileIndex}>{filename + " : "}{
                    <ul>

                    </ul>
                }</li>;
            })}
            </ul>
        </div>;
    }
}
