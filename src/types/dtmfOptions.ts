import Goertzel from "..";

export type DTMFOptions = {
  downsampleRate?: number;
  energyThreshold?: number;
  decibelThreshold?: number;
  repeatMin?: number;
  sampleRate?: number;
  filter?: (params: { goertzel: Goertzel; energies: any }) => any;
};
