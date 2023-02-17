import {FC, forwardRef, MutableRefObject} from "react";
import SoundEffect from "../../models/soundEffect.model";
import "./style.css";

type SoundEffectComponentProps = {
    soundEffect: SoundEffect;
    isNext: boolean;
    shouldBePlaying: boolean;
}

const SoundEffectComponent = forwardRef<HTMLAudioElement, SoundEffectComponentProps>(({
                                                                                                                         soundEffect,
                                                                                                                         isNext,
                                                                                                                         shouldBePlaying
                                                                                                                     }, ref) => {

    const isPlaying = ref && (ref as MutableRefObject<HTMLAudioElement>).current ? (!(ref as MutableRefObject<HTMLAudioElement>).current.paused) : false;

    return (
        <div className={`sound-effect ${isNext ? "is-next" : ""} ${isPlaying ? "is-playing" : ""} ${shouldBePlaying ? "should-be-playing" : ""}`}>
            <div
                className="sound-effect__name">{soundEffect.name}</div>
            <div className="sound-effect__keyword">{ soundEffect.keyword }</div>
            <audio ref={ref} controls={false} src={soundEffect.file}/>
        </div>
    );
});

export default SoundEffectComponent;