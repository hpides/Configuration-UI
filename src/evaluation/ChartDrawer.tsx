import { ChartOptions } from "chart.js";
import React, { Component, ReactFragment } from "react";
import { Line } from "react-chartjs-2";
import ClipLoader from "react-spinners/ClipLoader";
import { Alert, Button } from "reactstrap";
import "./table.css";
import { MQTTClient } from "./connectivity/MQTTClient";
import { Statistic } from "./statistic_pb";
import { ControlMessageType } from "./connectivity/Messages";
import * as chartjs from "chart.js";
import { asyncLoadTest } from "./connectivity/PerformanceDataStorageClient";

enum Teststate { NotStarted, Running, Finished }

interface Props {
	testId: string;
	isRunning: boolean;
}
interface State {
	current_state: Teststate;
	reportReady: boolean;
	preparingReport: boolean;
}

export class ChartDrawer extends Component<Props, State> {

	// references that will be set by react
	public chartMin: Line | null = null;
	public chartMax: Line | null = null;
	public chartAvg: Line | null = null;
	public chartThroughput: Line | null = null;
	public chartHistogram: Line | null = null;

	private readonly defaultChartOptions: ChartOptions = {
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

	// contains settings for style and content of chart
	public minOptions: ChartOptions = { ...this.defaultChartOptions };
	// same settings, just the animation completed handler will differ
	public maxOptions: ChartOptions = { ...this.defaultChartOptions };
	public avgOptions: ChartOptions = { ...this.defaultChartOptions };
	public throughputOptions: ChartOptions = { ...this.defaultChartOptions };

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

	// Chart.js can only set its height to pixels, so set this relative to the windows height
	private chartHeight = window.innerHeight / 2.5;
	private maxChartHeight = 0;

	private emptyData: chartjs.ChartData = { }

	constructor(props: Props) {
		super(props);

		new MQTTClient(this.onStatisticReceived, this.onControlMessageReceived);
	}

    public render() {
		let alert: ReactFragment;
		if (this.state.current_state === Teststate.Running) {
			alert = <Alert color="primary">Test running (Test {})</Alert>;
		}
		else if (this.state.current_state === Teststate.Finished) {
			alert = (
				<Alert color="primary">
					Test finished (Test {})<br />
					<Button>Download report</Button>
					<ClipLoader loading={this.state.preparingReport} />
				</Alert>);
		} else {
			alert = <div />;
		}

		return <div>
			{alert}
			<table>
				<tbody>
					<tr>
						<td>minimum Latency in the last second in ms, overall maximum: {0} ms</td>
						<td>average Latency in the last second in ms, overall maximum: {0} ms</td>
						<td>maximum Latency in the last second in ms, overall maximum: {0} ms</td>
					</tr>
					<tr>
						<td style={{ height: this.chartHeight }}>
							<div className="fixedWidth">
								<div className="scrollHorizontally">
									<Line height={this.chartHeight} data={this.emptyData} options={this.minOptions}
										ref={(reference) => this.chartMin = reference} />
								</div>
							</div>
						</td>
						<td style={{ height: this.chartHeight }}>
							<div className="fixedWidth">
								<div className="scrollHorizontally">
									<Line height={this.chartHeight} data={this.emptyData} options={this.avgOptions}
										ref={(reference) => this.chartAvg = reference} />
								</div>
							</div>
						</td>
						<td style={{ height: this.chartHeight }}>
							<div className="fixedWidth">
								<div className="scrollHorizontally">
									<Line height={this.chartHeight} data={this.emptyData} options={this.maxOptions}
										ref={(reference) => this.chartMax = reference} />
								</div>
							</div>
						</td>
					</tr>
					<tr>
						<td>Throughput in the last second, overall minimum: {9}</td>
						<td>Latency by percentile</td>
						<td id={"assertions"}>Failed assertions</td>
					</tr>
					<tr>
						<td style={{ height: this.chartHeight }}>
							<div className="fixedWidth">
								<div className="scrollHorizontally">
									<Line height={this.chartHeight} data={this.emptyData} options={this.throughputOptions}
										ref={(reference) => this.chartThroughput = reference} />
								</div>
							</div>
						</td>
						<td style={{ height: this.chartHeight }}>
							<div className="fixedWidthPercentile">
								<div className="scrollHorizontallyPercentile">
									<Line height={this.chartHeight} data={this.emptyData} options={this.histogramOptions}
										ref={(reference) => this.chartHistogram = reference} />
								</div>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>;
	}


	private onStatisticReceived(stats: Statistic) {

	}

	private onControlMessageReceived(type: ControlMessageType, testId: number) {

	}
}
