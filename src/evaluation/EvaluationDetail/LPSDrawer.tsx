import * as React from "react";
import { TestData } from "../connectivity/Messages";
import { Population } from "../Statistic/Population";
import { Statistic, getPopulationName } from "../Statistic/Statistic";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { SubEvent, Subscription } from 'sub-events';

interface Props {
    testData: TestData;
    statisticChangeEventHandler: SubEvent<Statistic>;
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

export class LPSDrawer extends React.Component<Props> {

    chart: am4charts.XYChart | undefined;
    statisticChangeSubscription: Subscription | undefined;
    mapPopulationToSeriesIndex = new Map<string, number>();

    componentDidMount() {
        this.chart = am4core.create("lps_chart", am4charts.XYChart);
        const title = this.chart.titles.create();
        title.text = "Latency per second";

        const xAxis = this.chart.xAxes.push(new am4charts.DateAxis());
        xAxis.title.text = "Time";
        xAxis.groupData = true;
        xAxis.groupCount = 500;

        const yAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
        yAxis.title.text = "Latency";

        const stat = this.props.testData.statistic;
        const series = this.chart.series.push(new am4charts.LineSeries());
        series.dataFields.dateX = "x";
        series.dataFields.valueY = "y";
        series.name = "Total";
        this.mapPopulationToSeriesIndex.set(stat.total.hash, 0);

        for (const pop of this.props.testData.statistic.populations.values()) {
            this.createSerieForPopulation(pop);
        }

        this.chart.cursor = new am4charts.XYCursor();
        this.chart.legend = new am4charts.Legend();
        this.chart.scrollbarX = new am4core.Scrollbar();

        this.onStatisticChanged(this.props.testData.statistic);

        this.statisticChangeSubscription =
            this.props.statisticChangeEventHandler.subscribe(this.onStatisticChanged);
    }

    componentWillUnmount() {
        if (this.chart)
            this.chart.dispose();
        if (this.statisticChangeSubscription)
            this.statisticChangeSubscription.cancel();
    }

    render() {
        return (
            <React.Fragment>
                <div id="lps_chart" style={{ height: "600px" }} />
                <div>{"Avg LPS: " + this.props.testData.statistic.total.AvgResponseTime()}</div>
            </React.Fragment>
        );
    }

    onStatisticChanged = (delta: Statistic) => {
        this.updateLPSData(delta.total);
        for (const pop of delta.populations.values())
            this.updateLPSData(pop);
    }

    updateLPSData(deltaPop: Population) {
        if (!this.chart)
            return;

        let series: am4charts.Series | undefined;
        const index = this.mapPopulationToSeriesIndex.get(deltaPop.hash);
        if (index === undefined) {
            series = this.createSerieForPopulation(deltaPop);
        }
        else {
            series = this.chart.series.getIndex(index);
        }
        if (!series)
            return;

        const dataItems = new Array<{ x: Date, y: number }>();
        let dataWasShuffled = false;
        for (const [second, count] of deltaPop.latencyPerSecond) {

            const date = new Date(second * 1000);
            let addedDataPoint = false;
            for (let i = series.data.length - 1; i >= 0; i--) {

                if (series.data[i].x === date) {
                    series.data[i].y += count;
                    addedDataPoint = true;
                    break;
                } else if (series.data[i].x > date) {
                    if (i === series.data.length - 1) {
                        dataItems.push({ x: date, y: count.percentile95 });
                    } else {
                        dataItems.push(rightShiftArray(series.data, i + 1));
                        series.data[i + 1] = { x: date, y: count.percentile95 };
                        dataWasShuffled = true;
                    }
                    addedDataPoint = true;
                    break;
                }
            }
            if (!addedDataPoint)
                dataItems.push({ x: date, y: count.percentile95 });
        }

        dataItems.sort((a, b) => a.x.getTime() - b.x.getTime());
        series.data = series.data.concat(dataItems);
    }

    createSerieForPopulation(pop: Population) {
        if (!this.chart)
            return undefined;

        const series = this.chart.series.push(new am4charts.LineSeries());
        series.dataFields.dateX = "x";
        series.dataFields.valueY = "y";
        series.name = getPopulationName(pop);
        this.mapPopulationToSeriesIndex.set(pop.hash, this.chart.series.length - 1);
        return series;
    }
}
