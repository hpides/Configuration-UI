import { Population as ProtoPopulation, Endpoint } from "../statistic_pb";
import { Statistic } from "./Statistic";

export interface StoredLatency {
    percentile50: number,
    percentile95: number
}

export class Population {
    endpoint: Endpoint.AsObject;
    numRequests: number;
    numFailures: number;
    totalResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    totalContentLength: number;
    startTime: number;
    latestRequestTime: number;

    requestsPerSecond: Map<number, number>;
    failuresPerSecond: Map<number, number>;
    responseTimes: Map<number, number>;
    latencyPerSecond: Map<number, StoredLatency>;

    statistic: Statistic;
    hash: string;

    constructor(protoPop: ProtoPopulation, statistic: Statistic, hash: string) {
        this.statistic = statistic;
        this.hash = hash;

        this.endpoint = protoPop.getEp()!!.toObject();
        this.numRequests = protoPop.getNumrequests();
        this.numFailures = protoPop.getNumfailures();
        this.totalResponseTime = protoPop.getTotalresponsetime();
        this.minResponseTime = protoPop.getMinresponsetime();
        this.maxResponseTime = protoPop.getMaxresponsetime();
        this.totalContentLength = protoPop.getTotalcontentlength();
        this.startTime = protoPop.getStarttime();
        this.latestRequestTime = protoPop.getLatestrequesttime();

        this.requestsPerSecond = new Map();
        for (const e of protoPop.getRequestspersecondList()) {
            this.requestsPerSecond.set(e.getKey(), e.getValue());
        }

        this.failuresPerSecond = new Map();
        for (const e of protoPop.getFailurespersecondList()) {
            this.failuresPerSecond.set(e.getKey(), e.getValue());
        }

        this.responseTimes = new Map();
        for (const e of protoPop.getResponsetimesList()) {
            this.responseTimes.set(e.getKey(), e.getValue());
        }

        this.latencyPerSecond = new Map();
        for (const e of protoPop.getLatencypersecondList()) {
            this.latencyPerSecond.set(e.getTime(), { percentile50: e.getPercentile50(), percentile95: e.getPercentile95() });
        }
    }

    public CurrentRequestsPerSecond(): number {
        if (this.statistic.total.latestRequestTime === -1)
            return 0;

        // average of last 12 seconds
        const sliceStart = Math.max(this.statistic.total.latestRequestTime - 12, this.statistic.total.startTime);
        let total = 0;
        for (let i = sliceStart; i < this.statistic.total.latestRequestTime - 2; i++) {
            total += this.requestsPerSecond.get(i) || 0;
        }

        let count = ((this.statistic.total.latestRequestTime - 2) - sliceStart);
        if (count <= 0)
            count = 1;

        return total / count;
    }

    public CurrentFailsPerSecond(): number {
        if (this.statistic.total.latestRequestTime === -1)
            return 0;

        // average of last 12 seconds
        const sliceStart = Math.max(this.statistic.total.latestRequestTime - 12, this.statistic.total.startTime);
        let total = 0;
        for (let i = sliceStart; i < this.statistic.total.latestRequestTime - 2; i++) {
            total += this.failuresPerSecond.get(i) || 0;
        }

        let count = ((this.statistic.total.latestRequestTime - 2) - sliceStart);
        if (count <= 0)
            count = 1;

        return total / count;
    }

    public TotalRequestsPerSecond(): number {
        if (this.statistic.total.latestRequestTime === -1)
            return 0;

        const runtime = this.statistic.total.latestRequestTime - this.statistic.total.startTime;
        if (runtime == 0)
            return 0;
        return this.numRequests / runtime;
    }

    public TotalFailuresPerSecond(): number {
        if (this.statistic.total.latestRequestTime === -1)
            return 0;

        const runtime = this.statistic.total.latestRequestTime - this.statistic.total.startTime;
        if (runtime == 0)
            return 0;
        return this.numFailures / runtime;
    }

    public FailRatio() {
        if (this.numRequests == 0) {
            if (this.numFailures == 0)
                return 0;
            else
                return 1;
        } else {
            return this.numFailures / this.numRequests;
        }
    }

    public MedianResponseTime(): number {
        if (this.responseTimes.size === 0)
            return 0;

        let medianPos = (this.numRequests - 1) / 2;

        const sortedKeys = Array.from(this.responseTimes.keys()).sort((a, b) => a - b);
        let medianTime = 0;

        for (const k of sortedKeys) {
            const c = this.responseTimes.get(k)!!;
            if (medianPos < c) {
                medianTime = k;
                break;
            }
            medianPos -= c;
        }
        if (medianTime > this.maxResponseTime)
            medianTime = this.maxResponseTime;
        else if (medianTime < this.minResponseTime)
            medianTime = this.minResponseTime;
        return medianTime;
    }

    public AvgResponseTime() {
        if (this.numRequests == 0)
            return 0;
        return this.totalResponseTime / this.numRequests;
    }

    public AverageContentLength() {
        if (this.numRequests == 0)
            return 0;
        return this.totalContentLength / this.numRequests;
    }

    public MinResponseTime() {
        if (this.numRequests == 0)
            return 0;
        return this.minResponseTime;
    }

    public MaxResponseTime() {
        if (this.numRequests == 0)
            return 0;
        return this.maxResponseTime;
    }

    public Merge(other: Population) {
        /*
        Extend the data from the current StatsEntry with the stats from another
        StatsEntry instance.
        */

        this.numFailures = this.numFailures + other.numFailures;
        for (const [key, value] of other.failuresPerSecond) {
            this.failuresPerSecond.set(key, (this.failuresPerSecond.get(key) || 0) + value);
        }

        if (other.numRequests > 0) {

            if (this.latestRequestTime !== -1 && other.latestRequestTime !== -1)
                this.latestRequestTime = Math.max(this.latestRequestTime, other.latestRequestTime);
            else if (other.latestRequestTime !== -1)
                this.latestRequestTime = other.latestRequestTime;

            this.startTime = Math.min(this.startTime, other.startTime);

            this.numRequests = this.numRequests + other.numRequests;

            this.totalResponseTime = this.totalResponseTime + other.totalResponseTime;
            this.maxResponseTime = Math.max(this.maxResponseTime, other.maxResponseTime);
            this.minResponseTime = Math.min(this.minResponseTime, other.minResponseTime);
            this.totalContentLength = this.totalContentLength + other.totalContentLength;

            for (const [key, value] of other.responseTimes) {
                this.responseTimes.set(key, (this.responseTimes.get(key) || 0) + value);
            }

            for (const [key, value] of other.requestsPerSecond) {
                this.requestsPerSecond.set(key, (this.requestsPerSecond.get(key) || 0) + value);
            }

            for (const [key, value] of other.latencyPerSecond) {
                if (!this.latencyPerSecond.get(key))
                    this.latencyPerSecond.set(key, value);
            }
        }

    }

    /// percentile = percentile to calculate. Between 0.0 - 1.0
    public CalculateResponseTimePercentile(percentile: number): number {
        let percentileRequestCount = this.numRequests * percentile;

        const sortedKeys = Array.from(this.responseTimes.keys()).sort((a, b) => a - b);

        let processedCount = 0;
        for (let index = sortedKeys.length - 1; index >= 0; index--) {
            const value = this.responseTimes.get(sortedKeys[index])!;
            processedCount += value;
            if (this.numRequests - processedCount <= percentileRequestCount) {
                return sortedKeys[index];
            }
        }
        return 0;
    }
}