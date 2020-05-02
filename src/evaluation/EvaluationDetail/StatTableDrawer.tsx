import * as React from "react";
import { TestData } from "../connectivity/Messages";
import { roundNumberTo2Places } from "../Statistic/Util";
import { endpointMethodToString, locationFromUrl } from "../Statistic/Statistic";

interface Props {
    testData: TestData;
}

const statisticTableTotalHeader = (
    <thead>
        <tr>
            <th># Requests</th>
            <th># Fails</th>
            <th>Median(ms)</th>
            <th>Average(ms)</th>
            <th>Min(ms)</th>
            <th>Max(ms)</th>
            <th>Avg size(bytes)</th>
            <th>RPS</th>
        </tr>
    </thead>);

const statisticTableHeader = (
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th># Requests</th>
            <th># Fails</th>
            <th>Median(ms)</th>
            <th>Average(ms)</th>
            <th>Min(ms)</th>
            <th>Max(ms)</th>
            <th>Avg size(bytes)</th>
            <th>RPS</th>
        </tr>
    </thead>);

const errorTableHeader = (
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Error</th>
            <th># Occurances</th>
        </tr>
    </thead>);

export class StatTableDrawer extends React.Component<Props> {

    render() {
        return (
            <React.Fragment>
                {this.renderStatisticTables()}
                {this.props.testData.statistic.errors.size > 0 && <hr/>}
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
                    <tr key={pop.endpoint.url + pop.endpoint.method}>
                        <td>{locationFromUrl(pop.endpoint.url)}</td>
                        <td>{endpointMethodToString(pop.endpoint.method)}</td>                  
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
            tableEntries.sort((a, b) => (a.key as string).localeCompare(b.key as string));

            tables.push(
                <React.Fragment key={host}>
                    <h3 className="stat_table_title">{"Summary of " + host}</h3>
                    <table className="stat_table">
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
                <h3 className="stat_table_title">Total</h3>
                <table className="stat_table">
                    {statisticTableTotalHeader}
                    <tbody>
                        <tr key={total.endpoint.method + total.endpoint.url}>
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
                    <tr key={location + error.error}>
                        <td>{location}</td>
                        <td>{endpointMethodToString(endpoint.method)}</td>
                        <td>{error.error}</td>
                        <td>{error.count}</td>
                    </tr>));
            }
            tableEntries.sort((a, b) => (a.key as string).localeCompare(b.key as string));

            tables.push(
                <React.Fragment key={host}>
                    <h3 className="stat_table_title">{"Errors for " + host}</h3>
                    <table className="stat_table">
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