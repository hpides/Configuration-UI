import React, { Component } from "react";
import "./style.css";
import { EvaluationDetail } from "./EvaluationDetail/EvaluationDetail";
import { TestData, StrippedTestJSON } from "./connectivity/Messages";
import { loadTest, loadAllTestIds } from "./connectivity/PerformanceDataStorageClient";
import { delay } from "q";
import am4themes_material from "@amcharts/amcharts4/themes/material";
import * as am4core from "@amcharts/amcharts4/core";

am4core.useTheme(am4themes_material);

interface Props {
    importTestConfigFunc: (testConfig: any) => void;
}

declare type CachedTest = TestData | StrippedTestJSON;
function isTestData(arg: CachedTest): arg is TestData {
    return (arg as any).statistic !== undefined;
}

interface State {
    tests: Array<CachedTest>;
    pdsIsUp: boolean;
    selectedTest: TestData | null;
}
/*tslint:disable:no-console*/
export class Evaluation extends Component<Props, State> {

    private testIdsAbortController = new AbortController();
    private testDataAbortController: { [index: number]: AbortController } = {};
    private pdsBackoffTime = 2000;
    private testIdsUpdator: {
        run: () => Promise<void>,
        cancel: () => void
    }

    public constructor(props: Props) {
        super(props);

        this.state = {
            tests: [],
            pdsIsUp: false,
            selectedTest: null
        }

        this.testIdsUpdator = this.fetchTestIdsRunner();
        this.testIdsUpdator.run();
    }

    componentDidMount() {
    }

    componentWillUnmount() {
        this.testIdsAbortController.abort();
        for (const c of Object.values(this.testDataAbortController))
            c.abort();

        this.testIdsUpdator.cancel();
    }

    render() {
        if (this.state.selectedTest === null) {
            const tests = this.state.tests.map((t) => {
                if (isTestData(t)) {
                    return (
                        <TestListItem key={t.id} testData={t} onClick={this.onClickOnTest} />
                    );
                } else if (t.lastChange == -2) {
                    return (
                        <div key={t.id}>
                            {t.id + ": Failed to fetch"}
                        </div>
                    );
                } else {
                    return (
                        <div key={t.id}>
                            {t.id + ": Fetching..."}
                        </div>
                    );
                }

            });
            tests.sort((a, b) => (a.key as number) - (b.key as number));

            return (
                <div>
                    {tests}
                </div>);
        } else {
            return (
                <div id="eval">
                    <div onClick={() => { this.setState({ ...this.state, selectedTest: null }); }}>Back</div>
                    <EvaluationDetail test={this.state.selectedTest} />
                </div >
            );
        }
    }

    fetchTestIdsRunner() {
        let isCanceled = false;
        return {
            run: async () => {

                while (!isCanceled) {
                    this.testIdsAbortController.abort();
                    this.testIdsAbortController = new AbortController();

                    try {
                        const strippedTest = await loadAllTestIds(this.testIdsAbortController)
                        const tests: CachedTest[] = [];
                        for (const stTest of strippedTest) {
                            let t = this.getCachedTest(stTest);
                            if (t !== null)
                                tests.push(t);
                            else {
                                // fetch it
                                this.fetchTestData(stTest.id);

                                //add awaiting notification
                                tests.push({ id: stTest.id, lastChange: -1 });
                            }
                        }
                        this.state = { ...this.state, tests: tests, pdsIsUp: true };
                        this.pdsBackoffTime = 2000;
                    } catch (error) {
                        console.log(error);
                        this.setState({ ...this.state, pdsIsUp: false })

                        // try again later
                        this.pdsBackoffTime = 2 * this.pdsBackoffTime;
                    }
                    await delay(this.pdsBackoffTime);
                }
            },
            cancel: () => {
                isCanceled = true;
            }
        }
    }

    fetchTestData(id: number) {

        let abc = this.testDataAbortController[id];
        if (abc !== undefined)
            abc.abort();

        abc = new AbortController();
        this.testDataAbortController[id] = abc;
        const _id = id;
        loadTest(id, abc).then((test: TestData) => {
            const tests = this.state.tests;
            const index = tests.findIndex((val) => val.id === _id);
            tests[index] = test;
            this.setState({ tests, pdsIsUp: true });

        }).catch((error) => {
            const tests = this.state.tests;
            const index = tests.findIndex((val) => val.id === _id);
            tests[index] = { id: tests[index].id, lastChange: -2 };
            this.setState({ tests, pdsIsUp: true });
            console.log(error);
        });
    }

    getCachedTest(test: StrippedTestJSON): CachedTest | null {
        for (const t of this.state.tests) {
            if (t.id === test.id && (test.lastChange === t.lastChange
                || t.lastChange < 0))
                return t;
        }
        return null;
    }

    onClickOnTest = (testData: TestData) => {
        this.setState({ ...this.state, selectedTest: testData });
    }
}

interface TestListItemProps {
    testData: TestData;
    onClick: (testData: TestData) => void;
}

class TestListItem extends Component<TestListItemProps> {

    render() {
        const t = this.props.testData;
        return (
            <div key={t.id} onClick={this.handleClick}>
                {t.id + ": Running=" + t.isActive}
            </div>
        );
    }

    handleClick = () => {
        this.props.onClick(this.props.testData);
    }
}
