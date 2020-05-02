// package: statistics
// file: statistic.proto

import * as jspb from "google-protobuf";

export class Statistic extends jspb.Message {
  hasTotal(): boolean;
  clearTotal(): void;
  getTotal(): Population | undefined;
  setTotal(value?: Population): void;

  getId(): number;
  setId(value: number): void;

  clearPopulationsList(): void;
  getPopulationsList(): Array<Population>;
  setPopulationsList(value: Array<Population>): void;
  addPopulations(value?: Population, index?: number): Population;

  clearErrorsList(): void;
  getErrorsList(): Array<ErrorEntry>;
  setErrorsList(value: Array<ErrorEntry>): void;
  addErrors(value?: ErrorEntry, index?: number): ErrorEntry;

  getSequencenr(): number;
  setSequencenr(value: number): void;

  clearUserspertimeList(): void;
  getUserspertimeList(): Array<LongIntEntry>;
  setUserspertimeList(value: Array<LongIntEntry>): void;
  addUserspertime(value?: LongIntEntry, index?: number): LongIntEntry;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Statistic.AsObject;
  static toObject(includeInstance: boolean, msg: Statistic): Statistic.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Statistic, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Statistic;
  static deserializeBinaryFromReader(message: Statistic, reader: jspb.BinaryReader): Statistic;
}

export namespace Statistic {
  export type AsObject = {
    total?: Population.AsObject,
    id: number,
    populationsList: Array<Population.AsObject>,
    errorsList: Array<ErrorEntry.AsObject>,
    sequencenr: number,
    userspertimeList: Array<LongIntEntry.AsObject>,
  }
}

export class Population extends jspb.Message {
  hasEp(): boolean;
  clearEp(): void;
  getEp(): Endpoint | undefined;
  setEp(value?: Endpoint): void;

  clearRequestspersecondList(): void;
  getRequestspersecondList(): Array<LongIntEntry>;
  setRequestspersecondList(value: Array<LongIntEntry>): void;
  addRequestspersecond(value?: LongIntEntry, index?: number): LongIntEntry;

  clearFailurespersecondList(): void;
  getFailurespersecondList(): Array<LongIntEntry>;
  setFailurespersecondList(value: Array<LongIntEntry>): void;
  addFailurespersecond(value?: LongIntEntry, index?: number): LongIntEntry;

  getNumrequests(): number;
  setNumrequests(value: number): void;

  getNumfailures(): number;
  setNumfailures(value: number): void;

  getTotalresponsetime(): number;
  setTotalresponsetime(value: number): void;

  getMinresponsetime(): number;
  setMinresponsetime(value: number): void;

  getMaxresponsetime(): number;
  setMaxresponsetime(value: number): void;

  getTotalcontentlength(): number;
  setTotalcontentlength(value: number): void;

  getStarttime(): number;
  setStarttime(value: number): void;

  getLatestrequesttime(): number;
  setLatestrequesttime(value: number): void;

  clearLatencypersecondList(): void;
  getLatencypersecondList(): Array<ResponseTimeEntry>;
  setLatencypersecondList(value: Array<ResponseTimeEntry>): void;
  addLatencypersecond(value?: ResponseTimeEntry, index?: number): ResponseTimeEntry;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Population.AsObject;
  static toObject(includeInstance: boolean, msg: Population): Population.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Population, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Population;
  static deserializeBinaryFromReader(message: Population, reader: jspb.BinaryReader): Population;
}

export namespace Population {
  export type AsObject = {
    ep?: Endpoint.AsObject,
    requestspersecondList: Array<LongIntEntry.AsObject>,
    failurespersecondList: Array<LongIntEntry.AsObject>,
    numrequests: number,
    numfailures: number,
    totalresponsetime: number,
    minresponsetime: number,
    maxresponsetime: number,
    totalcontentlength: number,
    starttime: number,
    latestrequesttime: number,
    latencypersecondList: Array<ResponseTimeEntry.AsObject>,
  }
}

export class Endpoint extends jspb.Message {
  getUrl(): string;
  setUrl(value: string): void;

  getMethod(): Endpoint.MethodMap[keyof Endpoint.MethodMap];
  setMethod(value: Endpoint.MethodMap[keyof Endpoint.MethodMap]): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Endpoint.AsObject;
  static toObject(includeInstance: boolean, msg: Endpoint): Endpoint.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Endpoint, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Endpoint;
  static deserializeBinaryFromReader(message: Endpoint, reader: jspb.BinaryReader): Endpoint;
}

export namespace Endpoint {
  export type AsObject = {
    url: string,
    method: Endpoint.MethodMap[keyof Endpoint.MethodMap],
  }

  export interface MethodMap {
    POST: 0;
    GET: 1;
    PUT: 2;
    DELETE: 3;
  }

  export const Method: MethodMap;
}

export class ErrorEntry extends jspb.Message {
  getError(): string;
  setError(value: string): void;

  getCount(): number;
  setCount(value: number): void;

  hasEndpoint(): boolean;
  clearEndpoint(): void;
  getEndpoint(): Endpoint | undefined;
  setEndpoint(value?: Endpoint): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ErrorEntry.AsObject;
  static toObject(includeInstance: boolean, msg: ErrorEntry): ErrorEntry.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ErrorEntry, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ErrorEntry;
  static deserializeBinaryFromReader(message: ErrorEntry, reader: jspb.BinaryReader): ErrorEntry;
}

export namespace ErrorEntry {
  export type AsObject = {
    error: string,
    count: number,
    endpoint?: Endpoint.AsObject,
  }
}

export class LongIntEntry extends jspb.Message {
  getKey(): number;
  setKey(value: number): void;

  getValue(): number;
  setValue(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LongIntEntry.AsObject;
  static toObject(includeInstance: boolean, msg: LongIntEntry): LongIntEntry.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: LongIntEntry, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LongIntEntry;
  static deserializeBinaryFromReader(message: LongIntEntry, reader: jspb.BinaryReader): LongIntEntry;
}

export namespace LongIntEntry {
  export type AsObject = {
    key: number,
    value: number,
  }
}

export class ResponseTimeEntry extends jspb.Message {
  getTime(): number;
  setTime(value: number): void;

  clearLatencycountList(): void;
  getLatencycountList(): Array<LongIntEntry>;
  setLatencycountList(value: Array<LongIntEntry>): void;
  addLatencycount(value?: LongIntEntry, index?: number): LongIntEntry;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ResponseTimeEntry.AsObject;
  static toObject(includeInstance: boolean, msg: ResponseTimeEntry): ResponseTimeEntry.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ResponseTimeEntry, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ResponseTimeEntry;
  static deserializeBinaryFromReader(message: ResponseTimeEntry, reader: jspb.BinaryReader): ResponseTimeEntry;
}

export namespace ResponseTimeEntry {
  export type AsObject = {
    time: number,
    latencycountList: Array<LongIntEntry.AsObject>,
  }
}

