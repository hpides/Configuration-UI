import { Population } from "./Population";
import { ErrorEntry, Statistic as ProtoStatistic, Population as ProtoPopulation, Endpoint } from "../statistic_pb";

const methodMapping = new Map([
    [1, "GET"],
    [0, "POST"],
    [2, "PUT"],
    [3, "DELETE"]]);

export function endpointMethodToString(method: number): string {
    return methodMapping.get(method) || "Unknown";
}

export function locationFromUrl(url: string): string {
    return new URL(url).pathname;
}

export function getPopulationName(pop: Population): string {
    const url = new URL(pop.endpoint.url);
    return url.host + url.pathname + ":" + endpointMethodToString(pop.endpoint.method);
}

export class Statistic {
    total: Population;
    populations: Map<string, Population>;
    errors: Map<string, ErrorEntry.AsObject>;
    id: number;
    sequenceNr: number;
    userCountPerSecond: Map<number, number>;

    constructor(protoStat: ProtoStatistic) {
        this.total = new Population(protoStat.getTotal()!!, this, "");

        const protoPopList = protoStat.getPopulationsList();
        this.populations = new Map();
        for (const protoPop of protoPopList) {
            const ep = protoPop.getEp()!!;
            const hash = ep.getMethod().toString() + ep.getUrl();

            this.populations.set(hash, new Population(protoPop, this, hash));
        }

        const protoErrorList = protoStat.getErrorsList();
        this.errors = new Map();
        for (const protoError of protoErrorList) {
            const ep = protoError.getEndpoint()!!;
            const hash = protoError.getError() + ep.getMethod().toString() + ep.getUrl();
            this.errors.set(hash, protoError.toObject());
        }

        this.id = protoStat.getId();
        this.sequenceNr = protoStat.getSequencenr();

        this.userCountPerSecond = new Map();
        const protoUserList = protoStat.getUserspertimeList();
        for (const protoUser of protoUserList) {
            this.userCountPerSecond.set(protoUser.getKey(), protoUser.getValue());
        }
    }

    public merge(otherStat: Statistic) {
        for (const [otherEP, otherPop] of otherStat.populations) {
            let existingPop = this.populations.get(otherEP);
            if (existingPop === undefined) {
                this.populations.set(otherEP, otherPop);
            }
            else {
                existingPop.Merge(otherPop);
            }
        }

        for (const [otherHash, otherError] of otherStat.errors) {
            let existingError = this.errors.get(otherHash);
            if (existingError === undefined) {
                this.errors.set(otherHash, otherError);
            }
            else {
                existingError.count += otherError.count;
            }
        }

        for (const [otherKey, otherValue] of otherStat.userCountPerSecond) {
            let existingUserCount = this.userCountPerSecond.get(otherKey);
            if (existingUserCount === undefined) {
                this.userCountPerSecond.set(otherKey, otherValue);
            }
            else {
                this.userCountPerSecond.set(otherKey, existingUserCount + otherValue);
            }
        }

        let oldLastRequestTimeStamp = this.total.latestRequestTime;
        if (oldLastRequestTimeStamp === -1)
            oldLastRequestTimeStamp = 0;

        this.total.Merge(otherStat.total);

        this.sequenceNr = Math.max(this.sequenceNr, otherStat.sequenceNr);
    }

    public groupPopulationsByEndpointHost() {
        const groupedKeys = new Map<string, Population[]>();

        for (const pop of this.populations.values()) {
            const host = new URL(pop.endpoint.url).host;
            let existingGroup = groupedKeys.get(host);
            if (existingGroup === undefined) {
                existingGroup = [pop];
                groupedKeys.set(host, existingGroup);
            }
            else {
                existingGroup.push(pop);
            }
        }
        return groupedKeys;
    }

    public groupErrorsByEndpointHost() {
        const groupedKeys = new Map<string, ErrorEntry.AsObject[]>();

        for (const error of this.errors.values()) {
            const host = new URL((error.endpoint || {url: ""}).url).host;
            let existingGroup = groupedKeys.get(host);
            if (existingGroup === undefined) {
                existingGroup = [error];
                groupedKeys.set(host, existingGroup);
            }
            else {
                existingGroup.push(error);
            }
        }
        return groupedKeys;
    }
}