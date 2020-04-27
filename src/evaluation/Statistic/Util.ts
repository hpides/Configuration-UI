export function roundNumberTo2Places(x: number): number {
    //this language is truly far from the light of the Omnissiah
    return Math.round((x + Number.EPSILON) * 100) / 100
}