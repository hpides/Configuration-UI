import { TestConfig } from "./TestConfig";
import { Statistic as ProtoStatistic } from "../statistic_pb";
import { Statistic } from '../Statistic/Statistic';

export declare type ControlMessageType = "testStart" | "testEnd" | "unknown"

export declare type StatisticReceivedCallback = (stat: Statistic) => void
export declare type ControlReceivedCallback = (type: ControlMessageType, testId: number) => void

export interface TestJSON {
    id: number,
    testConfig: string,
    isActive: boolean,
    serializedStatistic: Buffer,
    lastChange: number,
}

export interface StrippedTestJSON {
    id: number,
    lastChange: number,
}

export class TestData {
    public readonly id: number;
    public readonly testConfig: TestConfig;
    public isActive: boolean;
    public readonly statistic: Statistic;
    public readonly lastChange: number;
     
    constructor(testData: TestJSON) {
        this.id = testData.id;
        this.testConfig = JSON.parse(testData.testConfig);
        this.isActive = testData.isActive;
        this.statistic = new Statistic(
            ProtoStatistic.deserializeBinary(testData.serializedStatistic)
        );
        this.lastChange = testData.lastChange;
    }
}