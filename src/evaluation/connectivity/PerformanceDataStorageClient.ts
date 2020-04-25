import axios from "axios";
import { Statistic } from "../statistic_pb";
import { TestData } from "./Messages";

export function asyncLoadTestTimes(pdsHost: string, testId: number) {
    axios.request<Buffer>({
        url: pdsHost + "/test/" + testId + "/times",
    }).then((response) => {
        return Statistic.deserializeBinary(response.data);
    });
}

export function asyncLoadTest(pdsHost: string, testId: number) {
    return axios.get<TestData>(
        pdsHost + "/test/" + testId).then((response) => {
            const test: TestData = response.data;
            return test;
        }).catch((e) => alert(e));
}

export function asyncLoadAllRunningTestIds(pdsHost: string) {
    return axios.get<Array<number>>(
        pdsHost + "/test/running").catch((e) => alert(e));
}

export function asyncLoadAllFinishedTestIds(pdsHost: string) {
    return axios.get<Array<number>>(
        pdsHost + "/test/finished").catch((e) => alert(e));
}