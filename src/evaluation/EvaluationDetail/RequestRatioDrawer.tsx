import * as React from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import { TestData } from "../connectivity/Messages";

interface Props {
    testData: TestData;
}

export class RequestRatioDrawer extends React.Component<Props> {

    chart: am4charts.PieChart | undefined;

    componentDidMount() {
        this.chart = am4core.create("requestratio_chart", am4charts.PieChart)
        const title = this.chart.titles.create();
        title.text = "Traffic Shape";

        const series = this.chart.series.push(new am4charts.PieSeries());
        series.dataFields.category = "url";
        series.dataFields.value = "count";

        const as = series.slices.template.states.getKey("active")!;
        as.properties.shiftRadius = 0;

        this.chart.legend = new am4charts.Legend();

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
            <div id="requestratio_chart" style={{ height: "600px" }} />
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
