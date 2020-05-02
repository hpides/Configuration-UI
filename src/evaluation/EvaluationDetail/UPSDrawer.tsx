import * as React from "react";
import { TestData } from "../connectivity/Messages";
import { Population } from "../Statistic/Population";
import { Statistic, getPopulationName } from "../Statistic/Statistic";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { SubEvent, Subscription } from 'sub-events';
import { Card, CardBody, CardHeader } from "reactstrap";

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

export class UPSDrawer extends React.Component<Props> {

    chart: am4charts.XYChart | undefined;
    statisticChangeSubscription: Subscription | undefined;

    componentDidMount() {
        this.chart = am4core.create("ups_chart", am4charts.XYChart)

        const xAxis = this.chart.xAxes.push(new am4charts.DateAxis());
        xAxis.renderer.labels.template.fill = am4core.color("#ffffff");
        //xAxis.groupData = true;
        //xAxis.groupCount = 500;

        const yAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
        yAxis.title.text = "Users";
        yAxis.title.fill = am4core.color("#ffffff");
        yAxis.renderer.labels.template.fill = am4core.color("#ffffff");

        const series = this.chart.series.push(new am4charts.LineSeries());
        series.dataFields.dateX = "x";
        series.dataFields.valueY = "y";
        series.name = "Total";

        this.chart.cursor = new am4charts.XYCursor();
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
                    Users per second
                </CardHeader>
                <CardBody>
                    <div id="ups_chart" style={{ height: "600px" }} />
                </CardBody>
            </Card>
        );
    }

    onStatisticChanged = (delta: Statistic) => {
        if (!this.chart)
            return;

        const series = this.chart.series.getIndex(0)!;

        const dataItems = new Array<{ x: Date, y: number }>();
        let dataWasShuffled = false;
        for (const [second, count] of delta.userCountPerSecond) {

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
    }
}
