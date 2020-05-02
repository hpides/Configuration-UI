import * as React from "react";
import { TestData } from "../connectivity/Messages";
import { Population } from "../Statistic/Population";
import { Statistic, getPopulationName, mergeResponseTimes, avgResponseTime } from "../Statistic/Statistic";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { SubEvent, Subscription } from 'sub-events';
import { number } from "prop-types";
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

export class LVRDrawer extends React.Component<Props> {

    chart: am4charts.XYChart | undefined;
    statisticChangeSubscription: Subscription | undefined;
    mapPopulationToSeriesIndex = new Map<string, number>();

    componentDidMount() {
        this.chart = am4core.create("lvr_chart", am4charts.XYChart)

        const xAxis = this.chart.xAxes.push(new am4charts.ValueAxis());
        xAxis.title.text = "Requests";
        xAxis.title.fill = am4core.color("#ffffff");
        xAxis.renderer.labels.template.fill = am4core.color("#ffffff");

        const yAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
        yAxis.title.text = "Latency";
        yAxis.renderer.labels.template.fill = am4core.color("#ffffff");
        yAxis.title.fill = am4core.color("#ffffff");

        const stat = this.props.testData.statistic;
        const series = this.chart.series.push(new am4charts.LineSeries());
        series.dataFields.valueX = "x";
        series.dataFields.valueY = "y";
        series.name = "Total";
        this.mapPopulationToSeriesIndex.set(stat.total.hash, 0);

        for (const pop of this.props.testData.statistic.populations.values()) {
            this.createSerieForPopulation(pop);
        }

        this.chart.cursor = new am4charts.XYCursor();
        const legend = this.chart.legend = new am4charts.Legend();
        legend.labels.template.fill = am4core.color("#ffffff");
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
            <Card color="dark" className={this.props.className}>
                <CardHeader>
                    Latency vs Requests
                </CardHeader>
                <CardBody>
                    <div id="lvr_chart" style={{ height: "600px" }} />
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

        const map = new Map<number, Map<number, number>>();
        for (const [second, rCount] of deltaPop.requestsPerSecond) {
            const latency = deltaPop.latencyPerSecond.get(second);
            if (!latency)
                continue;

            const ex = map.get(rCount);
            if (ex) {
                mergeResponseTimes(ex, latency);
            } else {
                map.set(rCount, latency);
            }
        }

        const data: Array<{ x: number, y: number }> = [];
        for (const [rCount, latencies] of map) {
            data.push({ x: rCount, y: avgResponseTime(latencies) });
        }
        data.sort((a, b) => a.x - b.x);

        series.data = data;
    }

    createSerieForPopulation(pop: Population) {
        if (!this.chart)
            return undefined;

        const series = this.chart.series.push(new am4charts.LineSeries());
        series.dataFields.valueX = "x";
        series.dataFields.valueY = "y";
        series.connect = false;
        series.name = getPopulationName(pop);
        this.mapPopulationToSeriesIndex.set(pop.hash, this.chart.series.length - 1);
        return series;
    }
}
