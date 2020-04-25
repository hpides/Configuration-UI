import { Statistic } from "../statistic_pb";

export declare type ControlMessageType = "testStart" | "testEnd" | "unknown"

export declare type StatisticReceivedCallback = (stat: Statistic) => void
export declare type ControlReceivedCallback = (type: ControlMessageType, testId: number) => void

export interface TestData {
    id: number,
    testConfig: String,
    isActive: boolean,
    serializedStatistic: Buffer
}