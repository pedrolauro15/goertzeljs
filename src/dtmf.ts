import { DTMF_INITIAL_OPTIONS } from "./constants/DTMF_INITIAL_OPTIONS";
import { INITIAL_FREQUENCY_TABLE } from "./constants/INITIAL_FREQUENCY_TABLE";
import Goertzel from "./goertzel";
import { DTMFOptions } from "./types/dtmfOptions";

export default class DTMF {
  private options: DTMFOptions;
  private sampleRate: number;
  private lowFrequencies: number[];
  private highFrequencies: number[];
  private allFrequencies: number[];
  private repeatCounter: number;
  private firstPreviousValue: string;
  private goertzel: Goertzel;
  private jobs: { [key: string]: any[] };
  private decodeHandlers: any[];
  private frequencyTable: { [key: number]: { [key: number]: string } };

  constructor(options: undefined | DTMFOptions) {
    if (!options) {
      options = {};
    }
    this.options = DTMF_INITIAL_OPTIONS;
    for (let option in options) {
      this.options[option as "downsampleRate"] =
        options[option as "downsampleRate"];
    }
    this.sampleRate =
      (this.options.sampleRate as number) /
      (this.options.downsampleRate as number);

    this.frequencyTable = INITIAL_FREQUENCY_TABLE;
    this.lowFrequencies = [];
    for (var key in this.frequencyTable) {
      this.lowFrequencies.push(parseInt(key));
    }
    this.highFrequencies = [];
    for (key in this.frequencyTable[this.lowFrequencies[0]]) {
      this.highFrequencies.push(parseInt(key));
    }
    this.allFrequencies = this.lowFrequencies.concat(this.highFrequencies);
    this.repeatCounter = 0;
    this.firstPreviousValue = "";
    this.goertzel = new Goertzel({
      frequencies: this.allFrequencies,
      sampleRate: this.sampleRate,
    });
    this.decodeHandlers = [];
    this.jobs = { beforeProcess: [] };
  }

  /**
   * S4s Implementation for naturally updates frequencyDTMF Table
   */
  getFrequencyTable() {
    return this.frequencyTable;
  }

  updateFrequencyTable(table: { [key: number]: { [key: number]: string } }) {
    this.frequencyTable = table;
  }

  processBuffer(buffer: Buffer) {
    let value = "";
    let result: string[] = [];
    this._runJobs("beforeProcess", buffer);
    if (
      this.options.decibelThreshold &&
      Goertzel.Utilities.averageDecibels(buffer) < this.options.decibelThreshold
    ) {
      return result;
    }
    // Downsample by choosing every Nth sample.
    Goertzel.Utilities.eachDownsample(
      buffer,
      this.options.downsampleRate as number,
      (sample, i, downSampledBufferLength) => {
        let windowedSample = Goertzel.Utilities.exactBlackman(
          sample,
          i,
          downSampledBufferLength
        );
        this.goertzel.processSample(windowedSample);
      }
    );
    let energies: { high: any[]; low: any[] } = {
      high: [],
      low: [],
    };
    for (let fType of ["high", "low"]) {
      let i = 0;
      while (i < this[`${fType}Frequencies` as "highFrequencies"].length) {
        let f = this[`${fType}Frequencies` as "highFrequencies"][i];
        energies[fType as "high"].push(this.goertzel.energies[f]);
        i++;
      }
    }
    if (
      (this.options.filter &&
        this.options.filter({ goertzel: this.goertzel, energies })) ||
      !this.options.filter
    ) {
      value = this._energyProfileToCharacter(this.goertzel) as string;
      if (
        (value === this.firstPreviousValue || this.options.repeatMin === 0) &&
        value !== undefined
      ) {
        if (this.options.repeatMin !== 0) {
          this.repeatCounter += 1;
        }
        if (this.repeatCounter === this.options.repeatMin) {
          result.push(value);
          for (let handler of Array.from(this.decodeHandlers)) {
            setTimeout(function () {
              handler(value);
            }, 0);
          }
        }
      } else {
        this.repeatCounter = 0;
        this.firstPreviousValue = value;
      }
    }
    this.goertzel.refresh();
    return result;
  }

  on(eventName: "decode", handler: (value: string) => void) {
    switch (eventName) {
      case "decode":
        return this.decodeHandlers.push(handler);
    }
  }

  calibrate(multiplier: number) {
    if (multiplier == null) {
      multiplier = 1;
    }
    if (!this.jobs.beforeProcess) {
      this.jobs.beforeProcess = [];
    }
    return this.jobs.beforeProcess.push(
      (buffer: Buffer, dtmf: any) =>
        (dtmf.options.decibelThreshold =
          Goertzel.Utilities.averageDecibels(buffer) * multiplier)
    );
  }

  // private

  _energyProfileToCharacter(register: any) {
    let { energies } = register;
    // Find high frequency.
    let highFrequency = 0.0;
    let highFrequencyEngergy = 0.0;
    for (var f of Array.from(this.highFrequencies)) {
      if (
        energies[f] > highFrequencyEngergy &&
        energies[f] > (this.options.energyThreshold as number)
      ) {
        highFrequencyEngergy = energies[f];
        highFrequency = f;
      }
    }
    // Find low frequency.
    let lowFrequency = 0.0;
    let lowFrequencyEnergy = 0.0;
    for (f of Array.from(this.lowFrequencies)) {
      if (
        energies[f] > lowFrequencyEnergy &&
        energies[f] > (this.options.energyThreshold as number)
      ) {
        lowFrequencyEnergy = energies[f];
        lowFrequency = f;
      }
    }
    return this.frequencyTable[lowFrequency]
      ? this.frequencyTable[lowFrequency][highFrequency]
      : null;
  }

  _runJobs(jobName: string, buffer: Buffer) {
    if (this.jobs[jobName]) {
      let queueLength = this.jobs[jobName].length;
      let i = 0;
      return (() => {
        let result = [];
        while (i < queueLength) {
          this.jobs[jobName].pop()(buffer, this);
          result.push(i++);
        }
        return result;
      })();
    }
  }
}
