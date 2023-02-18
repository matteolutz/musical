import { type FaderState } from './fader.model';
import type SoundEffect from './soundEffect.model';

interface Scene {
  order: number;

  name: string;

  faderStates: FaderState[];

  soundEffects: SoundEffect[];

  lightPreset: {
    name: string;
    isBlackout: boolean;
    masterValue: number;
  };

  notes: string;

  keyword: string;
}

export default Scene;
