import * as React from "react";
import { TestData } from "../connectivity/Messages";
import { Population } from "../Statistic/Population";
import { Statistic, getPopulationName } from "../Statistic/Statistic";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { SubEvent, Subscription } from 'sub-events';
import { Card, CardHeader, CardBody } from "reactstrap";

interface Props {
    testData: TestData;
    statisticChangeEventHandler: SubEvent<Statistic>;
    className?: string;
}

function rightShiftArray<T>(array: Array<T>, start: number): T {
    let prev = array[start];
    for (let i = start + 1; i < array.length - 1; i++) {
        const tmp = array[i];
        array[i] = prev;
        prev = tmp;
    }
    return prev;
}

export class RPSDrawer extends React.Component<Props> {

    rpsChart: am4charts.XYChart | undefined;
    statisticChangeSubscription: Subscription | undefined;
    mapPopulationToSeriesIndex = new Map<string, number>();

    componentDidMount() {
        this.rpsChart = am4core.create("rps_chart", am4charts.XYChart)

        const xAxis = this.rpsChart.xAxes.push(new am4charts.DateAxis());
        xAxis.groupData = true;
        xAxis.groupCount = 500;
        xAxis.renderer.labels.template.fill = am4core.color("#ffffff");

        const yAxis = this.rpsChart.yAxes.push(new am4charts.ValueAxis());
        yAxis.title.text = "Requests";
        yAxis.title.fill = am4core.color("#ffffff");
        yAxis.renderer.labels.template.fill = am4core.color("#ffffff");

        const stat = this.props.testData.statistic;
        const series = this.rpsChart.series.push(new am4charts.LineSeries());
        series.dataFields.dateX = "x";
        series.dataFields.valueY = "y";
        series.name = "Total";
        this.mapPopulationToSeriesIndex.set(stat.total.hash, 0);

        for (const pop of this.props.testData.statistic.populations.values()) {
            this.createSerieForPopulation(pop);
        }

        this.rpsChart.cursor = new am4charts.XYCursor();
        const legend = this.rpsChart.legend = new am4charts.Legend();
        legend.labels.template.fill = am4core.color("#ffffff");
        this.rpsChart.scrollbarX = new am4core.Scrollbar();

        this.onStatisticChanged(this.props.testData.statistic);

        this.statisticChangeSubscription =
            this.props.statisticChangeEventHandler.subscribe(this.onStatisticChanged);
    }

    componentWillUnmount() {
        if (this.rpsChart)
            this.rpsChart.dispose();
        if (this.statisticChangeSubscription)
            this.statisticChangeSubscription.cancel();
    }

    render() {
        return (
            <Card color="dark" className={this.props.className}>
                <CardHeader>
                    {"Total requests per second (Avg " + this.props.testData.statistic.total.TotalRequestsPerSecond() + ")"}
                </CardHeader>
                <CardBody>
                    <div id="rps_chart" style={{ height: "600px" }} />
                </CardBody>
            </Card>
        );
    }

    onStatisticChanged = (delta: Statistic) => {
        this.updateRPSData(delta.total);
        for (const pop of delta.populations.values())
            this.updateRPSData(pop);
    }

    updateRPSData(deltaPop: Population) {
        if (!this.rpsChart)
            return;

        let series: am4charts.Series | undefined;
        const index = this.mapPopulationToSeriesIndex.get(deltaPop.hash);
        if (index === undefined) {
            series = this.createSerieForPopulation(deltaPop);
        }
        else {
            series = this.rpsChart.series.getIndex(index);
        }
        if (!series)
            return;

        const dataItems = new Array<{ x: Date, y: number }>();
        let dataWasShuffled = false;
        for (const [second, count] of deltaPop.requestsPerSecond) {

            const date = new Date(second * 1000);
            let addedDataPoint = false;
            for (let i = series.data.length - 1; i >= 0; i--) {

                if (series.data[i].x === date) {
                    series.data[i].y += count;
                    addedDataPoint = true;
                    break;
                } else if (series.data[i].x > date) {
                    if (i === series.data.length - 1) {
                        dataItems.push({ x: date, y: count });
                    } else {
                        dataItems.push(rightShiftArray(series.data, i + 1));
                        series.data[i + 1] = { x: date, y: count };
                        dataWasShuffled = true;
                    }
                    addedDataPoint = true;
                    break;
                }
            }
            if (!addedDataPoint)
                dataItems.push({ x: date, y: count });
        }

        dataItems.sort((a, b) => a.x.getTime() - b.x.getTime());
        series.data = series.data.concat(dataItems);
        if (dataWasShuffled)
            this.rpsChart.invalidateData();
        else
            this.rpsChart.invalidateRawData();
    }

    createSerieForPopulation(pop: Population) {
        if (!this.rpsChart)
            return undefined;

        const series = this.rpsChart.series.push(new am4charts.LineSeries());
        series.dataFields.dateX = "x";
        series.dataFields.valueY = "y";
        series.connect = false;
        series.name = getPopulationName(pop);
        this.mapPopulationToSeriesIndex.set(pop.hash, this.rpsChart.series.length - 1);
        return series;
    }
}