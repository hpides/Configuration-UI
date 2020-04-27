import * as React from "react";
import { TestData } from "../connectivity/Messages";
import { roundNumberTo2Places } from "../Statistic/Util";

interface Props {
    testData: TestData;
}

const methodMapping = new Map([
    [1, "GET"],
    [0, "POST"],
    [2, "PUT"],
    [3, "DELETE"]]);

function epMethodToString(method: number): string {
    return methodMapping.get(method) || "Unknown";
}

export class Overview extends React.Component<Props> {

    render() {
        const stat = this.props.testData.statistic;
        const tableEntries: JSX.Element[] = [];
        for (const [ep, pop] of stat.populations) {
            tableEntries.push((<tr key={pop.endpoint.method + pop.endpoint.url}>
                <td>{epMethodToString(pop.endpoint.method)}</td>
                <td>{pop.endpoint.url}</td>
                <td>{pop.numRequests}</td>
                <td>{pop.numFailures}</td>
                <td>{pop.MedianResponseTime()}</td>
                <td>{roundNumberTo2Places(pop.AvgResponseTime())}</td>
                <td>{pop.minResponseTime}</td>
                <td>{pop.maxResponseTime}</td>
                <td>{pop.AverageContentLength()}</td>
                <td>{this.props.testData.isActive ? roundNumberTo2Places(pop.CurrentRequestsPerSecond()) : 0}</td>
            </tr>));
        }

        return (
            <table>
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Name</th>
                        <th># Requests</th>
                        <th># Fails</th>
                        <th>Median(ms)</th>
                        <th>Average(ms)</th>
                        <th>Min(ms)</th>
                        <th>Max(ms)</th>
                        <th>Avg size(bytes)</th>
                        <th>Current RPS</th>
                    </tr>
                </thead>
                <tbody>
                    {tableEntries}
                </tbody>
            </table>
        );
    }


   
}