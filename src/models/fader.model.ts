interface Fader {
    id: number;
    channel: string;
    person: string;
}

export default Fader;

export interface FaderState {
    faderId: number;
    faderValue: number;
    isMuted: boolean;
}