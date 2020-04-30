import * as React from "react";
import { Population } from "../Statistic/Population";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

interface Props {
    pop: Population;
}

export class PercentileDrawer extends React.Component<Props> {

    chart: am4charts.XYChart | undefined;

    componentDidMount() {
        this.chart = am4core.create("percentile_chart", am4charts.XYChart);
        //const title = this.chart.titles.create();
        //title.text = "Latency Percentiles";
        
        const xAxis = this.chart.xAxes.push(new am4charts.CategoryAxis());
        xAxis.title.text = "percentile";
        xAxis.renderer.grid.template.location = 0;
        xAxis.renderer.minGridDistance = 30;
        xAxis.dataFields.category = "x";

        const yAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
        yAxis.title.text = "latency";

        const series = this.chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.categoryX = "x";
        series.dataFields.valueY = "y";
        series.name = "Total"
        

        const columnTemplate = series.columns.template;
        columnTemplate.strokeWidth = 2;
        columnTemplate.strokeOpacity = 1;
        columnTemplate.tooltipText = "{categoryX}: <{valueY}ms";
        columnTemplate.fillOpacity = 1;

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
            <div id="percentile_chart" style={{ height: "600px" }} />
        );
    }

    updateGraph() {
        if (!this.chart)
            return;

        const pop = this.props.pop;
        const percentiles = [
            0.5,
            0.66,
            0.75,
            0.8,
            0.9,
            0.95,
            0.98,
            0.99,
            0.999,
            0.9999
        ];
        const data = new Array<{ x: string, y: number }>(percentiles.length);

        for (let i = 0; i < percentiles.length; i++) {
            const p = percentiles[i];
            data[i] = { x: (p.toString() + "%"), y: pop.CalculateResponseTimePercentile(percentiles[i]) };
        }

        this.chart.data = data;
    }
}
