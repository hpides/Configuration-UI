import * as React from "react";
import { TestData, ControlMessageType } from "../connectivity/Messages";
import { Header } from "./Header";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { StatTableDrawer } from "./StatTableDrawer";
import { MQTTClient } from "../connectivity/MQTTClient";
import { Statistic } from '../Statistic/Statistic';
import { loadTest } from "../connectivity/PerformanceDataStorageClient";
import { RPSDrawer } from "./RPSDrawer";
import { SubEvent } from 'sub-events';
import { PercentileDrawer } from "./PercentileDrawer";
import { UPSDrawer } from "./UPSDrawer";
import { LPSDrawer } from "./LPSDrawer";
import { RequestRatioDrawer } from "./RequestRatioDrawer";
import { LVRDrawer } from "./LVRDrawer";
import 'react-tabs/style/react-tabs.css';


interface Props {
    test: TestData;
}

interface State {
    test: TestData;
}

export class EvaluationDetail extends React.Component<Props, State> {

    private testDataAbortController = new AbortController();
    private mqttClient: MQTTClient | null;
    private cachedStats: (Statistic | undefined)[] = [];
    private statisticChangeEventHandler: SubEvent<Statistic> = new SubEvent();

    constructor(props: Props) {
        super(props);

        this.mqttClient = null;
        if (props.test.isActive) {
            // connect to mqtt to get updates
            this.mqttClient = new MQTTClient(this.onStatisticReceived, this.onControlReceived);
        }
        this.state = { test: this.props.test }
    }

    componentWillUnmount() {
        this.testDataAbortController.abort();
        if (this.mqttClient !== null)
            this.mqttClient.close();
    }

    render() {
        const t = this.state.test;

        return (
            <React.Fragment>
                <Header testData={t} />
                <Tabs>
                    <TabList>
                        <Tab>Summary</Tab>
                        <Tab>Charts</Tab>
                        <Tab>Download</Tab>
                    </TabList>
                    <TabPanel>
                        <StatTableDrawer testData={t} />
                    </TabPanel>
                    <TabPanel>
                        <RPSDrawer className="eval_chart" testData={t} statisticChangeEventHandler={this.statisticChangeEventHandler} />
                        <UPSDrawer className="eval_chart" testData={t} statisticChangeEventHandler={this.statisticChangeEventHandler} />
                        <RequestRatioDrawer className="eval_chart" testData={t} />
                        <PercentileDrawer className="eval_chart" pop={t.statistic.total} />
                        <LPSDrawer className="eval_chart" testData={t} statisticChangeEventHandler={this.statisticChangeEventHandler} />
                        <LVRDrawer className="eval_chart" testData={t} statisticChangeEventHandler={this.statisticChangeEventHandler} />
                    </TabPanel>
                    <TabPanel>
                        "Railgun"
                    </TabPanel>
                </Tabs>
            </React.Fragment>
        );
    }

    onStatisticReceived = (stat: Statistic) => {
        if (this.state.test.statistic.sequenceNr === stat.sequenceNr - 1) {
            this.state.test.statistic.merge(stat);
            this.statisticChangeEventHandler.emit(stat);
            this.forceUpdate();
        } else if (this.state.test.statistic.sequenceNr >= stat.sequenceNr) {
            // ignore
            return;
        } else {
            // a message from the future
            console.log("Received statistic " + stat.sequenceNr + " from the future! Hope future is fine...");
            this.cachedStats.push(stat);
            this.fetchTestData(this.state.test.id);
        }
    }

    onControlReceived = (type: ControlMessageType, testId: number) => {
        console.log("received control: " + type + ", " + testId);
        if (testId !== this.state.test.id)
            return;

        if (type === "testEnd") {
            this.state.test.isActive = false;
            this.forceUpdate();
        }
        else if (type === "testStart") {
            this.state.test.isActive = true;
            this.forceUpdate();
        }
    }

    fetchTestData(id: number) {

        this.testDataAbortController.abort();
        this.testDataAbortController = new AbortController();

        loadTest(id, this.testDataAbortController).then((test: TestData) => {
            console.log("Received statistic " + test.statistic.sequenceNr + " from pds that is further along. Will apply all cached updates.")
            let cachedElemCount = this.cachedStats.length;
            while (cachedElemCount > 0) {
                const oldElemCount = cachedElemCount;
                for (let i = 0; i < this.cachedStats.length; i++) {
                    if (this.cachedStats[i] !== undefined && this.cachedStats[i]!!.sequenceNr - 1 === test.statistic.sequenceNr) {
                        test.statistic.merge(this.cachedStats[i]!!);
                        this.statisticChangeEventHandler.emit(this.cachedStats[i]!!);
                        cachedElemCount--;
                        this.cachedStats[i] = undefined;
                        break;
                    }
                }
                if (oldElemCount === cachedElemCount) {
                    break;
                }
            }
            this.cachedStats = [];
            console.log("Resulting statistic " + test.statistic.sequenceNr);
            this.setState({ test: test });

        }).catch((error) => {
            console.log(error);
        });
    }
}