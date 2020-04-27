import { PDS_HOST } from "./Origins";
import { TestJSON, TestData, StrippedTestJSON } from "./Messages";

export async function loadTest(testId: number, abortController: AbortController): Promise<TestData> {
    const response = await fetch(PDS_HOST + "/test/" + testId,
        {
            method: "GET",
            signal: abortController.signal
        });

    if (!response.ok || response.status === 204) {
        throw new Error("Response indicated problem fetching test");
    }

    const json = await response.json()
    return new TestData(json as TestJSON);
}

export async function loadAllTestIds(abortController: AbortController) {
    const response = await fetch(PDS_HOST + "/tests", {
        method: "GET",
        signal: abortController.signal
    });

    if (!response.ok)
        throw new Error("Response indicated problem fetching test ids");

    const json = await response.json();
    return json as StrippedTestJSON[];
}