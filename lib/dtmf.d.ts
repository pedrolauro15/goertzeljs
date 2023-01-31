/// <reference types="node" />
import { DTMFOptions } from "./types/dtmfOptions";
export default class DTMF {
    private options;
    private sampleRate;
    private lowFrequencies;
    private highFrequencies;
    private allFrequencies;
    private repeatCounter;
    private firstPreviousValue;
    private goertzel;
    private jobs;
    private decodeHandlers;
    private frequencyTable;
    constructor(options: undefined | DTMFOptions);
    processBuffer(buffer: Buffer): string[];
    on(eventName: "decode", handler: () => any): number;
    calibrate(multiplier: number): number;
    _energyProfileToCharacter(register: any): string | null;
    _runJobs(jobName: string, buffer: Buffer): number[] | undefined;
}
