import { Population } from "./Population";
import { ErrorEntry, Statistic as ProtoStatistic, Population as ProtoPopulation, Endpoint } from "../statistic_pb";


export class Statistic {
    total: Population;
    populations: Map<string, Population>;
    errors: Map<string, ErrorEntry.AsObject>;
    id: number;
    sequenceNr: number;

    constructor(protoStat: ProtoStatistic) {
        this.total = new Population(protoStat.getTotal()!!, this);

        const protoPopList = protoStat.getPopulationsList();
        this.populations = new Map();
        for (const protoPop of protoPopList) {
            const ep = protoPop.getEp()!!;
            const hash = ep.getMethod().toString() + ep.getUrl();

            this.populations.set(hash, new Population(protoPop, this));
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

        let oldLastRequestTimeStamp = this.total.latestRequestTime;
        if (oldLastRequestTimeStamp === -1)
            oldLastRequestTimeStamp = 0;

        this.total.Merge(otherStat.total);

        this.sequenceNr = Math.max(this.sequenceNr, otherStat.sequenceNr);
    }
}