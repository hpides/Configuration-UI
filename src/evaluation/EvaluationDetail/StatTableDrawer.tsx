import * as React from "react";
import { TestData } from "../connectivity/Messages";
import { roundNumberTo2Places } from "../Statistic/Util";
import { endpointMethodToString, locationFromUrl } from "../Statistic/Statistic";

interface Props {
    testData: TestData;
}

const statisticTableHeader = (
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
    </thead>);

const errorTableHeader = (
    <thead>
        <tr>
            <th>Type</th>
            <th>Name</th>
            <th>Error</th>
            <th># Occurances</th>
        </tr>
    </thead>);

export class StatTableDrawer extends React.Component<Props> {

    render() {
        return (
            <React.Fragment>
                {this.renderStatisticTables()}
                {this.renderErrorTable()}
            </React.Fragment>
        )
    }

    renderStatisticTables() {
        const stat = this.props.testData.statistic;
        const groupedPop = stat.groupPopulationsByEndpointHost();

        const tables: JSX.Element[] = [];
        for (const [host, pops] of groupedPop) {
            const tableEntries = new Array<JSX.Element>();
            for (const pop of pops) {
                tableEntries.push((
                    <tr key={pop.endpoint.method + pop.endpoint.url}>
                        <td>{endpointMethodToString(pop.endpoint.method)}</td>
                        <td>{locationFromUrl(pop.endpoint.url)}</td>
                        <td>{pop.numRequests}</td>
                        <td>{pop.numFailures}</td>
                        <td>{pop.MedianResponseTime()}</td>
                        <td>{roundNumberTo2Places(pop.AvgResponseTime())}</td>
                        <td>{pop.MinResponseTime()}</td>
                        <td>{pop.MaxResponseTime()}</td>
                        <td>{pop.AverageContentLength()}</td>
                        <td>{this.props.testData.isActive ? roundNumberTo2Places(pop.CurrentRequestsPerSecond()) : 0}</td>
                    </tr>));
            }

            tables.push(
                <React.Fragment key={host}>
                    <div>{host}</div>
                    <table>
                        {statisticTableHeader}
                        <tbody>
                            {tableEntries}
                        </tbody>
                    </table>
                </React.Fragment>);
        }

        const total = stat.total;
        return (
            <React.Fragment>
                {tables}
                <div>Total</div>
                <table>
                    {statisticTableHeader}
                    <tbody>
                        <tr key={total.endpoint.method + total.endpoint.url}>
                            <td></td>
                            <td></td>
                            <td>{total.numRequests}</td>
                            <td>{total.numFailures}</td>
                            <td>{total.MedianResponseTime()}</td>
                            <td>{roundNumberTo2Places(total.AvgResponseTime())}</td>
                            <td>{total.MinResponseTime()}</td>
                            <td>{total.MaxResponseTime()}</td>
                            <td>{total.AverageContentLength()}</td>
                            <td>{this.props.testData.isActive ? roundNumberTo2Places(total.CurrentRequestsPerSecond()) : 0}</td>
                        </tr>
                    </tbody>
                </table>
            </React.Fragment>
        );
    }

    renderErrorTable() {
        const stat = this.props.testData.statistic;
        const groupedErrors = stat.groupErrorsByEndpointHost();

        const tables: JSX.Element[] = [];
        for (const [host, errors] of groupedErrors) {
            const tableEntries = new Array<JSX.Element>();
            for (const error of errors) {
                const endpoint = error.endpoint || { url: "", method: 0 };
                const location = locationFromUrl(endpoint.url);
                tableEntries.push((
                    <tr key={location+error.error}>
                        <td>{endpointMethodToString(endpoint.method)}</td>
                        <td>{location}</td>
                        <td>{error.error}</td>
                        <td>{error.count}</td>
                    </tr>));
            }

            tables.push(
                <React.Fragment key={host}>
                    <div>{host}</div>
                    <table>
                        {errorTableHeader}
                        <tbody>
                            {tableEntries}
                        </tbody>
                    </table>
                </React.Fragment>);
        }

        return (
            <React.Fragment>
                {tables}
            </React.Fragment>
        );
    }
}