import {FaderState} from "./fader.model";
import SoundEffect from "./soundEffect.model";

interface Scene {
    order: number;

    name: string;

    faderStates: FaderState[];

    soundEffects: Array<SoundEffect>

    lightPreset: {
        name: string;
        isBlackout: boolean;
        masterValue: number;
    };

    notes: string;

    keyword: string;
}

export default Scene;