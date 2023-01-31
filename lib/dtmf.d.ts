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
    /**
     * S4s Implementation for naturally updates frequencyDTMF Table
     */
    getFrequencyTable(): {
        [key: number]: {
            [key: number]: string;
        };
    };
    updateFrequencyTable(table: {
        [key: number]: {
            [key: number]: string;
        };
    }): void;
    processBuffer(buffer: Buffer): string[];
    on(eventName: "decode", handler: (value: string) => void): number;
    calibrate(multiplier: number): number;
    _energyProfileToCharacter(register: any): string | null;
    _runJobs(jobName: string, buffer: Buffer): number[] | undefined;
}
