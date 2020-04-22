import React from "react";
import "./ApisEditor.css";
import Dropzone from "react-dropzone";
import Alert from "reactstrap/lib/Alert";
import YAML from "yaml";
import {ServerChooser} from './ServerChooser';

export interface IUploadedFile {
    existingEndpoints: string[];
    fileContent: string;
    server: string;
}

interface IProps {
}

export interface IState {
    uploadedFiles: Map<string, IUploadedFile>;
    allEndpoints: Set<string>;
    lastError: string;
    choosingServer: boolean;
    serversToChoose: string[];
    lastUploadedFile: IUploadedFile | null;
    lastFilename: string | null;
}

export class ApisEditor extends React.Component<IProps, IState> {
    public constructor(props: IProps) {
        super(props);
        this.state = {
            uploadedFiles: new Map<string, IUploadedFile>(),
            lastError: "",
            allEndpoints: new Set<string>(),
            choosingServer: false,
            serversToChoose: [],
            lastUploadedFile: null,
            lastFilename: null,
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
        let servers = api.servers;
        let endpoints = Object.keys(paths);

        let serverUrls: string[] = [];
        servers.forEach((server: any) => serverUrls.push(server.url));

        console.log(Object.keys(paths));

        const uploadedFileRepr: IUploadedFile = {
            existingEndpoints: [],
            fileContent: reader,
            server: "",
        };

        uploadedFileRepr.existingEndpoints = endpoints;

        this.setState({
            lastUploadedFile: uploadedFileRepr,
            lastFilename: filename,
            serversToChoose: serverUrls,
        });

        this.setState({
            choosingServer: true,
        });
    }

    public serverSelected = (server: string) => {
        if (!(this.state.lastUploadedFile && this.state.lastFilename)) {
            this.setState({choosingServer: false});
            return;
        }

        this.state.lastUploadedFile.server = server;
        this.state.uploadedFiles.set(this.state.lastFilename, this.state.lastUploadedFile);
        this.state.lastUploadedFile.existingEndpoints.forEach(
            (value) => this.state.allEndpoints.add(server+value)
        );
        this.setState({
            choosingServer: false,
            uploadedFiles: this.state.uploadedFiles,
            allEndpoints: this.state.allEndpoints,
            lastUploadedFile: null,
            lastFilename: null,
        });
    }

    public serverSelectionCancelled = () => {
        this.setState({
            choosingServer: false,
            lastUploadedFile: null,
            lastFilename: null,
        });
    }

    public render() {
        let serverChooser;
        if (this.state.choosingServer) {
            serverChooser = <ServerChooser
                servers={this.state.serversToChoose}
                selectedServer={null}
                onAdd={this.serverSelected}
                onCancel={this.serverSelectionCancelled}
            />;
        }
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
                return <li key={fileIndex}>{filename + " : " + this.state.uploadedFiles.get(filename)!.server}{
                    <ul>
                        {
                            Array.from(this.state.uploadedFiles.get(filename)!
                                .existingEndpoints).map((endpoint) => {
                                    return <li key={endpoint}>{endpoint}</li>;
                                })
                        }
                    </ul>
                }</li>;
            })}
            </ul>
            {serverChooser}
        </div>;
    }
}
