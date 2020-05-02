import * as React from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { TestData } from "../connectivity/Messages";
import { Card, CardHeader, CardBody } from "reactstrap";

interface Props {
    testData: TestData;
    className?: string;
}

export class RequestRatioDrawer extends React.Component<Props> {

    chart: am4charts.PieChart | undefined;

    componentDidMount() {
        this.chart = am4core.create("requestratio_chart", am4charts.PieChart)

        const series = this.chart.series.push(new am4charts.PieSeries());
        series.dataFields.category = "url";
        series.dataFields.value = "count";
        series.labels.template.fill = am4core.color("#ffffff");

        const as = series.slices.template.states.getKey("active")!;
        as.properties.shiftRadius = 0;

        const legend = this.chart.legend = new am4charts.Legend();
        legend.labels.template.fill = am4core.color("#ffffff");
        legend.valueLabels.template.fill = am4core.color("D3D3D3");

        this.updateGraph();
    }

    componentWillUnmount() {
        if (this.chart)
            this.chart.dispose();
    }

    componentDidUpdate() {
        this.updateGraph();
    }

    render() {
        return (
            <Card color="dark" className={this.props.className}>
                <CardHeader>
                    Traffic shape
                </CardHeader>
                <CardBody>
                    <div id="requestratio_chart" style={{ height: "600px" }} />
                </CardBody>
            </Card>
        );
    }

    updateGraph() {
        if (!this.chart)
            return;

        const data: { url: string, count: number }[] = [];
        for (const pop of this.props.testData.statistic.populations.values()) {
            data.push({
                url: pop.endpoint.url,
                count: pop.numRequests
            });
        }
        this.chart.data = data;
    }
}
