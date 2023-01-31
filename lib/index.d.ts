/// <reference types="node" />
import { GoertzelOptions } from "./types/goertzelOptions";
declare class Goertzel {
    private options;
    private sampleRate;
    private frequencies;
    private currentSample;
    private firstPrevious;
    private secondPrevious;
    private totalPower;
    private filterLength;
    private phases;
    private coefficient;
    private cosine;
    private sine;
    energies: {
        [key: string]: string | number | boolean;
    };
    static Utilities: {
        floatToIntSample(floatSample: number): number;
        downsampleBuffer(buffer: Buffer, downsampleRate: number, mapSample?: ((sample: number, index: number, bufferLength: number, downSampleRate: number) => number) | undefined): Uint8ClampedArray;
        eachDownsample(buffer: Buffer, downSampleRate: number, fn: (sample: number, index: number, downSampledBufferLength: number) => void): number[];
        hamming(sample: number, sampleIndex: number, bufferSize: number): number;
        exactBlackman(sample: number, sampleIndex: number, bufferSize: number): number;
        peakFilter(energies: number[], sensitivity: number): boolean;
        doublePeakFilter(energies1: number[], energies2: number[], sensitivity: number): boolean;
        generateSineBuffer(frequencies: number[], sampleRate: number, numberOfSamples: number, phase?: number): Float32Array;
        generateWhiteNoiseBuffer(sampleRate: number, numberOfSamples: number): Float32Array;
        floatBufferToInt(floatBuffer: number[]): Uint8ClampedArray;
        averageDecibels(buffer: Buffer): number;
    };
    constructor(options?: GoertzelOptions);
    processSample(sample: number): void;
    refresh(): void;
    _getEnergyOfFrequency(sample: number, frequency: number): void;
    _initializeConstants(frequencies: number[]): void;
}
export default Goertzel;
