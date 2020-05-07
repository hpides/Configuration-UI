import React from "react";
import Dropzone from "react-dropzone";
import Alert from "reactstrap/lib/Alert";
import YAML from "yaml";
import "./ApisEditor.css";
import {ServerChooser} from "./ServerChooser";

export interface IUploadedFile {
    existingEndpoints: string[];
    fileContent: string;
    server: string;
}

export interface IState {
    uploadedFiles: Map<string, IUploadedFile>;
    allEndpoints: Set<string>;
    choosingServer: boolean;
    serversToChoose: string[];
    lastUploadedFile: IUploadedFile | null;
    lastFilename: string | null;
}

export class ApisEditor extends React.Component<{}, IState> {
    public constructor(props: {}) {
        super(props);
        this.state = {
            allEndpoints: new Set<string>(),
            choosingServer: false,
            lastFilename: null,
            lastUploadedFile: null,
            serversToChoose: [],
            uploadedFiles: new Map<string, IUploadedFile>(),
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

        const api = YAML.parse(reader.toString());
        const paths = api.paths;
        const servers = api.servers;
        const endpoints = Object.keys(paths);

        const serverUrls: string[] = [];
        servers.forEach((server: any) => serverUrls.push(server.url));

        const uploadedFileRepr: IUploadedFile = {
            existingEndpoints: [],
            fileContent: reader,
            server: "",
        };

        uploadedFileRepr.existingEndpoints = endpoints;

        this.setState({
            choosingServer: true,
            lastFilename: filename,
            lastUploadedFile: uploadedFileRepr,
            serversToChoose: serverUrls,
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
            (value) => this.state.allEndpoints.add(server + value),
        );
        this.setState({
            allEndpoints: this.state.allEndpoints,
            choosingServer: false,
            lastFilename: null,
            lastUploadedFile: null,
            uploadedFiles: this.state.uploadedFiles,
        });
    }

    public serverSelectionCancelled = () => {
        this.setState({
            choosingServer: false,
            lastFilename: null,
            lastUploadedFile: null,
        });
    }

    public deleteConfig = (event: React.MouseEvent<HTMLButtonElement>) => {
        const key = event.currentTarget.getAttribute("data-key");
        if (!key) { return; }

        this.state.uploadedFiles.delete(key);
        this.setState({uploadedFiles: this.state.uploadedFiles});
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
        let noConfig;
        if (this.state.uploadedFiles.size === 0) {
            noConfig = <tr>
                <td colSpan={2}>No Configurations</td>
            </tr>
        }
        return <div className="apis-editor">
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
            <table>
                <tr>
                    <th colSpan={2}>Loaded Configurations:</th>
                </tr>
                {Array.from(this.state.uploadedFiles.keys()).map((filename, fileIndex) => {
                    return [<tr>
                        <td rowSpan={2}>
                            <span>{filename}</span>
                            <button
                                className="delete-data-btn"
                                data-key={filename}
                                onClick={this.deleteConfig}
                            >&times;</button>
                            
                        </td>
                        <td>{this.state.uploadedFiles.get(filename)!.server}</td>
                    </tr>,
                    <tr>
                        <td><ul>
                            {Array.from(this.state.uploadedFiles.get(filename)!
                            .existingEndpoints).map((endpoint) => {
                                return <li key={endpoint}>{endpoint}</li>;
                            })}
                        </ul></td>
                    </tr>];
                })}
                {noConfig}
            </table>
            {serverChooser}
        </div>;
    }
}
