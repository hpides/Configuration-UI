import { PDS_HOST } from "./Origins";

export async function loadTest(testId: number) {
    return fetch(PDS_HOST + "/test/" + testId);
}

export async function loadAllRunningTestIds() {
    return fetch(PDS_HOST + "/test/running");
}

export async function loadAllFinishedTestIds() {
    return fetch(PDS_HOST + "/test/finished");
}