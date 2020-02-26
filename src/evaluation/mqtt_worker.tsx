import axios from "axios";
import {ChartOptions, ChartPoint} from "chart.js";
import jspdf from "jspdf";
import {Client, connect} from "mqtt";
import React, {Component} from "react";
import { Line } from "react-chartjs-2";
import ClipLoader from "react-spinners/ClipLoader";
import {Alert, Button} from "reactstrap";
import {Histogram} from "./percentile";
import "./table.css";

enum teststate {NOT_STARTED, RUNNING, FINISHED}

interface ITestConfig {
    testId: string;
    isRunning: boolean;
}
interface IFailedAssertion {
    actualValues: Set<string>;
    name: string;
    numberFailures: number;
}
interface IMqttWorkerState {
    assertions: IFailedAssertion[];
    nines: number;
    current_state: teststate;
    reportReady: boolean;
    preparingReport: boolean;
}

export class MqttWorker extends Component<ITestConfig, IMqttWorkerState> {

    public mqtt: Client;
    public reconnectTimeout: number = 2000;
    public host: string = "users";
    public port: number = 9001;
    // references that will be set by react
    public chartMin: Line|null = null;
    public chartMax: Line|null = null;
    public chartAvg: Line|null = null;
    public chartThroughput: Line|null = null;
    public chartHistogram: Line|null = null;

    // initial datasets
    public readonly datasetsMinLatency: Chart.ChartDataSets[] = [];
    public readonly dataMinLatency = {
        datasets: this.datasetsMinLatency,
        labels: [],
    };

    public readonly datasetsMaxLatency: Chart.ChartDataSets[] = [];
    public readonly dataMaxLatency = {
        datasets: this.datasetsMaxLatency,
        labels: [],
    };

    public readonly datasetsAvgLatency: Chart.ChartDataSets[] = [];
    public readonly dataAvgLatency = {
        datasets: this.datasetsAvgLatency,
        labels: [],
    };

    public readonly datasetsThroughput: Chart.ChartDataSets[] = [];
    public readonly dataThroughput = {
        datasets: this.datasetsThroughput,
        labels: [],
    };

    public readonly datasetsHistogram: Chart.ChartDataSets[] = [];
    public readonly dataHistogram = {
        datasets: this.datasetsHistogram,
        labels: [],
    };
    // contains settings for style and content of chart
    public minOptions: ChartOptions = this.defaultChartOptions();
    // same settings, just the animation completed handler will differ
    public maxOptions: ChartOptions = this.defaultChartOptions();
    public avgOptions: ChartOptions = this.defaultChartOptions();
    public throughputOptions: ChartOptions = this.defaultChartOptions();

    // the chart for histograms is different because the data types differ.
    public histogramOptions: ChartOptions = {
        animation: {
            easing: "linear",
        },
        legend: {
            align: "end",
            position: "chartArea",
        },
        maintainAspectRatio: false,
        scales: {
            xAxes: [{
                display: true,
            }],
            yAxes: [{
                ticks: {
                    min: 0,
                },
            }],

        },
    };
    private doc: jspdf | null = null;
    // in production, these values will never be visible because this age will be shown when the test is already running
    private maxLatencyMaximum = -1;
    private minLatencyMaximum = -1;
    private avgLatencyMaximum = -1;
    private throughputMinimum = -1;
    private assertions: IFailedAssertion[] = [];
    private readonly timesTopic = "de.hpi.tdgt.times";
    private readonly assertionsTopic = "de.hpi.tdgt.assertions";
    private readonly controlTopic = "de.hpi.tdgt.control";
    // Chart.js can only set its height to pixels, so set this relative to the windows height
    private chartHeight = window.innerHeight / 2;
    private readonly maxHistogram = new Histogram();
    private histogramLabelsInitialized = false;
    // we need to store this twice because using state.nines
    // will introduce delay of one action to actually showing the value
    private nines = 5;
    // store if the corresponding diagram has been drawn into the report
    private histogramFinished = false;
    private minFinished = false;
    private maxFinished = false;
    private avgFinished = false;
    private throughputFinished = false;
    private readonly testId: string;
    private maxChartHeight = 0;
    constructor(props: ITestConfig) {
        super(props);
        this.testId = this.props.testId;
        this.getTimesAndAssertionsFromPerformanceDataStorage();
        this.mqtt = connect("mqtt://" + this.host + ":" + this.port);
        const client = this.mqtt;

        this.mqtt.on("connect", () => {
            this.onConnect(client);
        });
        this.mqtt.on("message", (topic, message) => {
            this.onMessageArrived(topic, message);
        });
        /*tslint:disable:max-line-length*/
        this.state = { assertions: [], nines: this.nines, current_state: teststate.RUNNING, reportReady: false, preparingReport: false};
        // else I can not reference it
        this.histogramOptions.animation = {easing: "linear", onComplete: this.histogramChanged};
        this.minOptions.animation = {easing: "linear", onComplete: this.minChanged};
        this.maxOptions.animation = {easing: "linear", onComplete: this.maxChanged};
        this.avgOptions.animation = {easing: "linear", onComplete: this.avgChanged};
        this.throughputOptions.animation = {easing: "linear", onComplete: this.throughputChanged};
    }
    public onConnect(client: Client) {
        client.subscribe(this.timesTopic, (err) => {
            // TODO error handling
        });
        client.subscribe(this.assertionsTopic, (err) => {
            // TODO error handling
        });
        client.subscribe(this.controlTopic, (err) => {
            // TODO error handling
        });
    }

    /**
     * Returns the percentile with i nines.
     * If i is 0, returns 50.
     * If is is 1, returns 90.
     * If i is 2, returns 99.
     * If i is 3, returns 99.9.
     * And so on.
     * @param i
     */
    public getNinesPercentileValue(i: number) {
        if (i === 0) {
            return 0.5;
        }
        // Why I build the number as a string and parse it to a float afterwards:
        // Typescript uses IEEE754 floats. They can not represent 0.(0*)1 accurately.
        // Building the value by addition would mean getting e.g. a 99.0000000001'ths percentile.
        // The string, on the other hand, can be parsed into the exact value we want.
        let percentile = "0.";
        for (let nines = 0; nines < i; nines++) {
            percentile = percentile.concat("9");
        }
        return parseFloat(percentile);
    }
    /* tslint:disable:max-line-length ... */
    public onMessageArrived = (topic: string, msg: any) => {
            // error handling
            if (!msg.toString()) {
                return;
            }
            if (topic === this.controlTopic) {
                const components = msg.toString().split(" ");
                // ignore messages for another test
                const currentId: string = components[1];
                // there was some type problem here
                if (!(currentId.toString() === this.testId.toString())) {
                    return;
                }

                if (msg.toString().startsWith("testStart")) {
                    // to be able to draw a new report after the end of the test
                    this.histogramFinished = false;
                    this.minFinished = false;
                    this.maxFinished = false;
                    this.avgFinished = false;
                    this.throughputFinished = false;
                    this.doc = null;
                    this.setState({assertions: this.assertions, nines: this.state.nines, current_state: teststate.RUNNING, reportReady: false, preparingReport: false});
                }
                if (msg.toString().startsWith("testEnd")) {
                    this.setState({assertions: this.assertions, nines: this.state.nines, current_state: teststate.FINISHED, reportReady: this.state.reportReady, preparingReport: true});
                    // force redraw events for all charts to generate report
                    this.chartHistogram!.chartInstance.update();
                    this.chartMin!.chartInstance.update();
                    this.chartMax!.chartInstance.update();
                    this.chartAvg!.chartInstance.update();
                    this.chartThroughput!.chartInstance.update();
                }
                // next call would cause exception now
                return;
            }
            let object = JSON.parse(msg.toString());
            // ignore messages for another test
            const id = object.testId;
            // this ignores issues with data types
            if (!(id.toString() === this.testId.toString())) {
                return;
            }
            if (topic === this.timesTopic) {
                const creationTime = object.creationTime;
                const date = new Date(0);
                date.setUTCMilliseconds(creationTime);
                let troughputOverall = 0;
                object = object.times;
                // tslint required checking the existence of the iterator value in every loop
                for (const adress in object) {
                    if (adress) {
                        for (const endpoint in object[adress]) {
                            if (endpoint) {
                            for (const story in object[adress][endpoint]) {
                                if (story) {
                                    const storyObject = object[adress][endpoint][story];
                                    const requestIdentifier = endpoint + " " + adress + " in " + story;
                                    // this gives us a (hopefully) unique color for each line in the graph, but can be reproduced when the test is watched again
                                    const borderColor = "rgb(" + this.hashToInt(adress) + ", "
                                        + this.hashToInt(endpoint)  + ", " + this.hashToInt(story) * 255 + ")";

                                    // data are transferred in nanoseconds, but we want to show milliseconds.
                                    this.addTimeData(this.chartAvg, requestIdentifier
                                    + " average latency", date, parseFloat(storyObject.avgLatency) / 1_000_000,
                                     borderColor);
                                    this.addTimeData(this.chartMin, requestIdentifier
                                    + " minimum latency", date, parseFloat(storyObject.minLatency) / 1_000_000,
                                     borderColor);
                                    this.addTimeData(this.chartMax, requestIdentifier
                                    + " maximum latency", date, parseFloat(storyObject.maxLatency) / 1_000_000,
                                     borderColor);
                                    this.addTimeData(this.chartThroughput, requestIdentifier
                                    + " throughput", date, parseFloat(storyObject.throughput), borderColor);
                                    troughputOverall += parseFloat(storyObject.throughput);
                                    this.maxHistogram.recordValue(parseFloat(storyObject.maxLatency) / 1_000_000);
                                    this.maxLatencyMaximum = Math.max(parseFloat(storyObject.maxLatency), this.maxLatencyMaximum);
                                    this.minLatencyMaximum = Math.max(parseFloat(storyObject.minLatency), this.minLatencyMaximum);
                                    this.avgLatencyMaximum = Math.max(parseFloat(storyObject.avgLatency), this.avgLatencyMaximum);
                                }
                            }
                        }
                    }
                }
            }
                const overallColor = "rgb(255,0,0)";
                this.addTimeData(this.chartThroughput, "Aggregated throughput", date,
            troughputOverall, overallColor);
                this.updatePercentiles();
                // if it stays there, it will never change
                if (this.throughputMinimum === -1) {
                    this.throughputMinimum = troughputOverall;
                }
                this.throughputMinimum = Math.min(troughputOverall, this.throughputMinimum);
        }
            if (topic === this.assertionsTopic) {
                object = object.actuals;
                for (const name in object) {
                    if (name) {
                        const thisAssertion = object[name];
                        const numberFailures = thisAssertion.key;
                        const actuals: string[] = thisAssertion.value;
                        let found = false;
                        this.assertions.forEach((assertion) => {
                            if (assertion.name === name) {
                                assertion.numberFailures += numberFailures;
                                actuals.forEach((element) => {
                                    assertion.actualValues.add(element);
                                });
                                found = true;
                            }
                        });
                        if (!found) {
                            const assertion: IFailedAssertion = {
                                actualValues: new Set(actuals),
                                name,
                                numberFailures,
                            };
                            this.assertions.push(assertion);
                        }
                    }
                }
                this.setState({assertions: this.assertions, nines: this.state.nines, current_state: this.state.current_state, reportReady: this.state.reportReady, preparingReport: this.state.preparingReport});
        }

    }
    public addTimeData(chart: Line|null, label: string, time: Date, data: number,
                       borderColor: string) {
        if (chart === null || !chart.chartInstance ||
            !chart.chartInstance.data || !chart.chartInstance.data.datasets) {
           return;
        }
        let datasetExists = false;
        chart.chartInstance.data.datasets.forEach((element) => {

           if (element.label === label && element.data) {
               const p: ChartPoint = {
                   x: time,
                   y: data,
               };
               (element.data as ChartPoint[]).push(p);
               datasetExists = true;
           }
       });
        if (!datasetExists) {
           const p: ChartPoint = {
               x: time,
               y: data,
           };
           chart.chartInstance.data.datasets.push({
               borderColor,
               data: [p],
               label,
               lineTension: 0,
           });
       }
        chart.chartInstance.update();
   }
public componentDidMount() {
        // we need the maximum height for pdf generation
        if (this.maxChartHeight < this.chartMin!.chartInstance.height!) {
            this.maxChartHeight = this.chartMin!.chartInstance.height!;
        }
        if (this.maxChartHeight < this.chartAvg!.chartInstance.height!) {
            this.maxChartHeight = this.chartAvg!.chartInstance.height!;
        }
        if (this.maxChartHeight < this.chartMax!.chartInstance.height!) {
            this.maxChartHeight = this.chartMax!.chartInstance.height!;
        }
        if (this.maxChartHeight < this.chartThroughput!.chartInstance.height!) {
            this.maxChartHeight = this.chartThroughput!.chartInstance.height!;
        }
        if (this.maxChartHeight < this.chartHistogram!.chartInstance.height!) {
            this.maxChartHeight = this.chartHistogram!.chartInstance.height!;
        }
}

public componentDidUpdate(prevProps: Readonly<ITestConfig>, prevState: Readonly<any>, snapshot?: any) {
        this.componentDidMount();
}
public render() {
        let alert = <div/>;
        if (this.state.current_state === teststate.RUNNING) {
            alert = <Alert color="primary">Test running (#{this.testId})</Alert>;
        }
        if (this.state.current_state === teststate.FINISHED) {
            alert = <Alert color="primary">Test finished (#{this.testId})<br/> <Button active={this.state.reportReady && !this.state.preparingReport} onClick={this.downloadReport}>Download report</Button> <ClipLoader loading={this.state.preparingReport}/></Alert>;
        }
        return <div>
        {alert}
        <table style={{height: 400}}>
        <tbody>
        <tr>

            <td>minimum Latency in the last second in ms, overall maximum: {this.minLatencyMaximum / 1_000_000} ms</td>
            <td>average Latency in the last second in ms, overall maximum: {this.avgLatencyMaximum / 1_000_000} ms</td>
            <td>maximum Latency in the last second in ms, overall maximum: {this.maxLatencyMaximum / 1_000_000} ms</td>
        </tr>
        <tr>
            <td style={{height: this.chartHeight}}>
                <div className="fixedWidth">
                    <div className="scrollHorizontally">
                        <Line height={this.chartHeight} data={this.dataMinLatency} options={this.minOptions}
                        ref = {(reference) => this.chartMin = reference} />
                    </div>
                </div>
            </td>
            <td style={{height: this.chartHeight}}>
                <div className="fixedWidth">
                    <div className="scrollHorizontally">
                        <Line height={this.chartHeight} data={this.dataAvgLatency} options={this.avgOptions}
                        ref = {(reference) => this.chartAvg = reference} />
                    </div>
            </div>
            </td>
            <td style={{height: this.chartHeight}}>
                <div className="fixedWidth">
                    <div className="scrollHorizontally">
                        <Line height={this.chartHeight} data={this.dataMaxLatency} options={this.maxOptions}
                        ref = {(reference) => this.chartMax = reference} />
                    </div>
            </div>
            </td>
        </tr>
        <tr>
            <td>Throughput in the last second, overall minimum: {this.throughputMinimum}</td>
            <td>Latency by percentile</td>
            <td id={"assertions"}>Failed assertions</td>
        </tr>
        <tr>
            <td style={{height: this.chartHeight}}>
                <div className="fixedWidth">
                    <div className="scrollHorizontally">
                    <Line height={this.chartHeight} data={this.dataThroughput} options={this.throughputOptions}
                    ref = {(reference) => this.chartThroughput = reference} />
                    </div>
                </div>
            </td>
            <td style={{height: this.chartHeight}}>
                <div className="fixedWidthPercentile">
                    <div className="scrollHorizontallyPercentile">
                            <Line height={this.chartHeight} data={this.dataHistogram} options={this.histogramOptions}
                            ref = {(reference) => this.chartHistogram = reference} />
                    </div>
                    <input type="range" id="start" name="nines"
                           min="1" max="6" value={this.state.nines} onChange={this.handleSliderMove}/> <br/>
                    <label htmlFor="nines">Number of nines: {this.state.nines}</label>
                </div>

            </td>
            <td>
                <ul>
                {
                    // name is unique because of definition
                    this.assertions.map((el) => <li key={el.name}>{el.name} failed {el.numberFailures} times :
                        Actuals were [{el.actualValues}]</li>)
                }
                </ul>
            </td>
        </tr>
        </tbody>
    </table>
    </div>;
}

    public handleSliderMove = (event: React.FormEvent<HTMLInputElement>)  => {
        this.setState({assertions: this.state.assertions, nines: parseInt(event.currentTarget.value, 10), current_state: this.state.current_state, reportReady: this.state.reportReady, preparingReport: this.state.preparingReport});
        this.nines = parseInt(event.currentTarget.value, 10);
        this.updatePercentiles();
    }
    private hashToInt(str: string) {
        let sum = 0;
        for (let i = 0; i < str.length; i++) {
            sum += str.charCodeAt(i);
        }
        return sum % 256;
    }

    private getTimesAndAssertionsFromPerformanceDataStorage() {
        axios.request<string[]>({
            url: "http://users:8080/test/" + this.testId + "/times",
        }).then((response) => {
            const data = response.data;
            data.forEach( (time) =>  {
                if (time) {
                    this.onMessageArrived(this.timesTopic, time);
                }
            });
        }).then( (dealtResponse) => {
            axios.request<string[]>({
                url: "http://users:8080/test/" + this.testId + "/assertions",
            }).then((response) => {
                const data = response.data;
                data.forEach((assertion) => {
                    if (assertion) {
                        this.onMessageArrived(this.assertionsTopic, assertion);
                    }
                });
                // do not create a report prematurely
                let testState: teststate;
                if (this.props.isRunning) {
                    testState = teststate.RUNNING;
                } else {
                    testState = teststate.FINISHED;
                }
                this.setState({current_state: testState});
            });
        });
    }
    private defaultChartOptions(): ChartOptions {
        return {
            animation: {
                easing: "linear",
            },
            legend: {
                align: "end",
                position: "left",
            },
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    // so the diagram does not start too far off
                    ticks: {
                        // min: Date(),
                    },
                    time: {
                        unit: "second",
                    },
                    type: "time",
                }],
                yAxes: [{
                    position: "right",
                    ticks: {
                        min: 0,
                    },
                }],

            },
        };
    }
    private makeReport = (chart: Line, label: string, relativePositionOfCurrentChart: number) => {
        // show spinner, but not download button
        this.setState({assertions: this.assertions, nines: this.state.nines, current_state: this.state.current_state, reportReady: false, preparingReport: true});
        if (this.doc === null) {
            this.doc = new jspdf("landscape", "pt", [chart.chartInstance.width! + 100, this.maxChartHeight * 6 + 100]);
            this.doc.text("Test report", 50, 20);
        }
        const image = chart.chartInstance.toBase64Image();
        this.doc.text(label, 50, relativePositionOfCurrentChart * (this.maxChartHeight + 60) + 40);
        // use best compression
        this.doc.addImage(image, "JPEG", 0, relativePositionOfCurrentChart * (this.maxChartHeight + 60) + 60, chart.chartInstance.width!, chart.chartInstance.height!, undefined, "SLOW");
        // do not print report if diagrams are missing
        if (this.histogramFinished && this.maxFinished && this.minFinished && this.avgFinished && this.throughputFinished) {
            this.doc.addPage();
            this.doc.text("Failed assertions: ", 50, 20);
            const assertions = this.assertions.map((el) => "" + el.name + "failed " + el.numberFailures + " times: Actuals were [" + this.setEntriesToString(el.actualValues) + "]");
            this.doc.text(assertions, 50, 40);
            // show the download button when everything is set up, hide spinner
            this.setState({assertions: this.assertions, nines: this.state.nines, current_state: this.state.current_state, reportReady: true, preparingReport: false});
        }
    }

    private downloadReport = () => {
        if (this.doc) {
            this.doc.save("Report.pdf");
        }
    }
    private updatePercentiles = () => {
        if (this.chartHistogram && this.chartHistogram.chartInstance
        && this.chartHistogram.chartInstance.data && this.chartHistogram.chartInstance.data.datasets) {
            const label = "Max latency by percentile over"
            + " all atoms in all stories.";
            let percentile;
            if (this.chartHistogram.chartInstance.data.datasets.length === 0) {
                this.chartHistogram.chartInstance.data.datasets.push({
                    data: [],
                    label,
                    lineTension: 0,
                });
            }
            // add more labels after slider was moved
            if (this.chartHistogram.chartInstance.data.labels!.length !== this.nines + 1) {
                this.chartHistogram.chartInstance.data.labels! = [];
                this.histogramLabelsInitialized = false;
            }
            // Number of nines should be variable later, so the labels have to be added dynamically
            if (!this.histogramLabelsInitialized) {
            for (let i = 0; i < this.nines + 1; i++) {
                // so it is better human readable
                percentile = 100 * this.getNinesPercentileValue(i);
                this.chartHistogram.chartInstance.data.labels!.push("" + percentile);
            }
            this.histogramLabelsInitialized = true;
            }
            for (let i = 0; i < this.nines + 1; i++) {
                // so it is better human readable
                percentile = this.getNinesPercentileValue(i);
                const value = this.maxHistogram.getPercentile(percentile);
                // removing data from chart.js diagrams is difficult, so replace existing data.
                if (this.chartHistogram.chartInstance.data.datasets[0].data!.length > i) {
                    this.chartHistogram.chartInstance.data.datasets[0].data![i] = value;
                } else {
                    (this.chartHistogram.chartInstance.data.datasets[0].data! as number[]).push(value);

                }
            }
            // does not notice changed datasets without this hint
            this.chartHistogram.chartInstance.update();

        }
    }
    private histogramChanged = () => {
        // do not add the chart twice to the pdf, and only when report is finished
        if (this.chartHistogram != null && ! this.histogramFinished && this.state.current_state === teststate.FINISHED) {
            this.histogramFinished = true;
            this.makeReport(this.chartHistogram, "Latency by percentile", 4);
        }
    }
    private minChanged = () => {
        // do not add the chart twice to the pdf, and only when report is finished
        if (this.chartMin != null && ! this.minFinished && this.state.current_state === teststate.FINISHED) {
            this.minFinished = true;
            this.makeReport(this.chartMin, "minimum Latency in the last second in ms, overall maximum: " + this.minLatencyMaximum / 1_000_000 + " ms", 0);
        }
    }
    private maxChanged = () => {
        // do not add the chart twice to the pdf, and only when report is finished
        if (this.chartMax != null && ! this.maxFinished && this.state.current_state === teststate.FINISHED) {
            this.maxFinished = true;
            this.makeReport(this.chartMax, "maximum Latency in the last second in ms, overall maximum: " + this.maxLatencyMaximum / 1_000_000 + " ms", 1);
        }
    }
    private avgChanged = () => {
        // do not add the chart twice to the pdf, and only when report is finished
        if (this.chartAvg != null && ! this.avgFinished && this.state.current_state === teststate.FINISHED) {
            this.avgFinished = true;
            this.makeReport(this.chartAvg, "average Latency in the last second in ms, overall maximum: " + this.avgLatencyMaximum / 1_000_000 + " ms", 2);
        }
    }
    private throughputChanged = () => {
        // do not add the chart twice to the pdf, and only when report is finished
        if (this.chartThroughput != null && ! this.throughputFinished && this.state.current_state === teststate.FINISHED) {
            this.throughputFinished = true;
            this.makeReport(this.chartThroughput, "Throughput in the last second, overall minimum: " + this.throughputMinimum, 3);
        }
    }

    private setEntriesToString(set: Set<string>): string {
        let ret =  "";
        let first = true;
        // nothing we can filter here
        set.forEach( (item) => {
            if (first) {
                first = false;
            } else {
                ret = ret + ", ";
            }
            ret = ret + item;
        });
        return ret;
    }
}
