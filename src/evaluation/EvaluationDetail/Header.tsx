import * as React from "react";
import { TestData } from "../connectivity/Messages";
import { roundNumberTo2Places } from "../Statistic/Util";

interface Props {
    testData: TestData;
}

export class Header extends React.Component<Props> {

    render() {
        const testData = this.props.testData;
        const stat = testData.statistic;

        return (
            <div id="test_header">
                <h2 id="test_header">
                    {testData.id}
                </h2>
                {testData.isActive &&
                    <div className="test_header_item">
                        Is currently running
                    </div>
                }
                <div>
                    {"RPS: " +
                        roundNumberTo2Places(testData.isActive ?
                            stat.total.CurrentRequestsPerSecond() :
                            stat.total.TotalRequestsPerSecond())}
                </div>
                <div>
                    {"Failures: " +
                        roundNumberTo2Places(testData.isActive ?
                            stat.total.CurrentFailsPerSecond() :
                            stat.total.TotalFailuresPerSecond())
                        + "(" +
                        roundNumberTo2Places(stat.total.FailRatio() * 100)
                        + "%)"}
                </div>
            </div>
        );
    }
}