import { GOERTZEL_ATTRIBUTES, GOERTZEL_ATTRIBUTES_LENGTH } from "./constants/GOERTZEL_ATTRIBUTES";
import { INITIAL_OPTIONS } from "./constants/INITIAL_OPTIONS";
import Utilities from "./util";
const { atan2, cos, sin, PI } = Math;
class Goertzel {
    constructor(options = INITIAL_OPTIONS) {
        this.options = options;
        this.sampleRate = options.sampleRate || INITIAL_OPTIONS.sampleRate;
        this.frequencies = options.frequencies || INITIAL_OPTIONS.frequencies;
        this._initializeConstants(this.frequencies);
        this.currentSample = undefined;
        this.firstPrevious = {};
        this.secondPrevious = {};
        this.totalPower = {};
        this.filterLength = {};
        this.energies = {};
        this.phases = {};
        this.coefficient = {};
        this.cosine = {};
        this.sine = {};
        this.refresh();
    }
    processSample(sample) {
        this.currentSample = sample;
        const len = this.frequencies.length;
        let i = 0;
        while (i < len) {
            let frequency = this.frequencies[i];
            this._getEnergyOfFrequency(sample, frequency);
            i++;
        }
    }
    refresh() {
        let i = 0;
        while (i < GOERTZEL_ATTRIBUTES_LENGTH) {
            let attr = GOERTZEL_ATTRIBUTES[i];
            this[attr] = {};
            i++;
        }
        this.frequencies.forEach((frequency) => {
            let i = 0;
            while (i < GOERTZEL_ATTRIBUTES_LENGTH) {
                let attr = GOERTZEL_ATTRIBUTES[i];
                this[attr][frequency] = 0.0;
                i++;
            }
        });
    }
    _getEnergyOfFrequency(sample, frequency) {
        let f1 = this.firstPrevious[frequency], f2 = this.secondPrevious[frequency];
        const coefficient = this.coefficient[frequency], sine = sample + coefficient * f1 - f2;
        f2 = f1;
        f1 = sine;
        this.filterLength[frequency] += 1;
        const power = f2 * f2 + f1 * f1 - coefficient * f1 * f2, totalPower = (this.totalPower[frequency] += sample * sample);
        if (totalPower === 0)
            this.totalPower[frequency] = 1;
        this.energies[frequency] =
            power / totalPower / this.filterLength[frequency];
        if (this.options.getPhase) {
            let real = f1 - f2 * this.cosine[frequency], imaginary = f2 * this.sine[frequency];
            this.phases[frequency] = atan2(imaginary, real);
        }
        this.firstPrevious[frequency] = f1;
        this.secondPrevious[frequency] = f2;
    }
    _initializeConstants(frequencies) {
        const len = frequencies.length;
        let frequency, normalizedFrequency, omega, cosine, i = 0;
        (this.sine = {}), (this.cosine = {}), (this.coefficient = {});
        while (i < len) {
            frequency = frequencies[i];
            normalizedFrequency = frequency / this.sampleRate;
            omega = 2.0 * PI * normalizedFrequency;
            cosine = cos(omega);
            this.sine[frequency] = sin(omega);
            this.cosine[frequency] = cosine;
            this.coefficient[frequency] = 2.0 * cosine;
            i++;
        }
    }
}
Goertzel.Utilities = Utilities;
export default Goertzel;
