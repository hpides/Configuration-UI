export class Histogram {
    private values: number[];
    public constructor() {
        this.values = [];
    }
    /**
     * Adds a new value
     * @param value new value
     */
    public recordValue(value: number) {
        this.values.push(value);
    }
    /**
     * get the percentile's percentile of the stored data.
     * Throws error if percentile out of bounds.
     * @param percentile Value between 0 and 1, inclusive.
     */
    public getPercentile(percentile: number) {
        if (percentile < 0 || percentile > 1) {
            throw new Error("Percentile out of range (0-1): " + percentile);
        }
        this.values = this.values.sort((n1, n2) => n1 - n2);
        // indices count from 0 to length -1, so minus one
        return this.values[Math.ceil((this.values.length - 1) * percentile)];
    }
}
