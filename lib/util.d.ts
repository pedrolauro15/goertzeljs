/// <reference types="node" />
declare const Utilities: {
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
export default Utilities;
