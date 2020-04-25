import * as React from "react";
import { loadTest } from "../connectivity/PerformanceDataStorageClient";
import { TestData } from "../connectivity/Messages";


interface Props {
    testId: number;
}

interface State {
    testData: TestData | null;
    isFetching: boolean;
}

export class EvaluationDetail extends React.Component<Props, State> {

    private testDataAbortController = new AbortController();

    componentDidMount() {
        this.fetchTestData();
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (prevProps.testId !== this.props.testId) {
            this.fetchTestData();
        }

    }

    componentWillUnmount() {
        this.testDataAbortController.abort();
    }

    render() {
        return (
            <div />
        );
    }

    fetchTestData() {

        this.testDataAbortController.abort();
        this.testDataAbortController = new AbortController();

        loadTest(this.props.testId).then((response) => {
            if (!response.ok || response.status === 204) {
                return;
            }
            console.log(response);
        }).catch((error) => {
            this.handleError(error);
        });
    }

    handleError(error: Error) {
        console.log(error);
    };
}