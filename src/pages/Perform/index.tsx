import {createRef, FC, RefObject, useEffect, useRef, useState} from "react";
import Serialisation from "../../models/serialisation.model";
import {TEST_SERIALIZATION_DATA} from "../../utils/testData";
import "./style.css";
import Fader, {FaderState} from "../../models/fader.model";
import AudioFaderComponent from "../../components/AudioFaderComponent";
import Scene from "../../models/scene.model";
import SoundEffect from "../../models/soundEffect.model";
import SoundEffectComponent from "../../components/SoundEffectComponent";
import {useRefState} from "../../utils/state";
import {convertMilliseconds} from "../../utils/time";
import ModalComponent from "../../components/ModalComponent";

type PerformProps = {
    initialSceneIndex?: number;
    isPeek?: boolean;
}

const Perform: FC<PerformProps> = ({initialSceneIndex, isPeek = false}) => {

    const [serialisation, setSerialisation, serialisationRef] = useRefState<Serialisation | undefined>(undefined);

    const [currentSceneIndex, setCurrentSceneIndex, currentSceneIndexRef] = useRefState<number>(initialSceneIndex || 0);

    const [currentSoundEffectIndex, setCurrentSoundEffectIndex, currentSoundEffectIndexRef] = useRefState<number>(-1);
    const [soundEffectRefs, setSoundEffectRefs, soundEffectRefsRef] = useRefState<RefObject<HTMLAudioElement>[]>([]);

    const [sceneTime, setSceneTime] = useState<number>(0);

    const [showNextSceneModal, setShowNextSceneModal] = useState<boolean>(false);

    const nextScene = () => {
        if (!serialisationRef.current) return;
        if (currentSceneIndexRef.current < serialisationRef.current.scenes.length - 1) {
            setCurrentSceneIndex(currentSceneIndexRef.current + 1);
        }
    }

    const previousScene = () => {
        if (currentSceneIndexRef.current > 0) {
            setCurrentSceneIndex(currentSceneIndexRef.current - 1);
        }
    }

    const keyHandler = (e: KeyboardEvent) => {
        switch (e.key) {
            case "ArrowRight":
                e.preventDefault();
                nextScene();
                break;
            case "ArrowLeft":
                e.preventDefault();
                previousScene();
                break;
            case " ":
                e.preventDefault();
                if (!serialisationRef.current) return;

                if (currentSoundEffectIndexRef.current === serialisationRef.current.scenes[currentSceneIndexRef.current].soundEffects.length - 1) return;

                if (currentSoundEffectIndexRef.current >= 0
                    && soundEffectRefsRef.current[currentSoundEffectIndexRef.current].current) {
                    soundEffectRefsRef.current[currentSoundEffectIndexRef.current].current?.pause();
                    soundEffectRefsRef.current[currentSoundEffectIndexRef.current].current!.currentTime = 0;
                }

                setCurrentSoundEffectIndex(currentSoundEffectIndexRef.current + 1);

                const audioElem = soundEffectRefsRef.current[currentSoundEffectIndexRef.current].current;
                if (!audioElem) return;

                audioElem.addEventListener("ended", () => {
                    audioElem.pause();
                    audioElem.currentTime = 0;
                }, {once: true});

                audioElem.play();

                break;
            case "r":
                if (currentSoundEffectIndexRef.current >= 0 && soundEffectRefsRef.current[currentSoundEffectIndexRef.current].current) {
                    soundEffectRefsRef.current[currentSoundEffectIndexRef.current].current?.pause();
                    soundEffectRefsRef.current[currentSoundEffectIndexRef.current].current!.currentTime = 0;
                }

                setCurrentSoundEffectIndex(-1);
                break;
        }
    }

    useEffect(() => {
        const serialisationData = {...TEST_SERIALIZATION_DATA};
        setSerialisation(serialisationData);

        !isPeek && document.addEventListener("keydown", keyHandler);

        return isPeek ? () => {
        } : () => {
            document.removeEventListener("keydown", keyHandler);
        }
    }, []);

    useEffect(() => {
        if (!serialisation || isPeek) return;
        setSoundEffectRefs(
            Array(serialisation.scenes[currentSceneIndex].soundEffects.length)
                .fill(undefined)
                .map((_, i) => soundEffectRefs[i] || createRef<HTMLAudioElement>())
        );
    }, [serialisation]);

    useEffect(() => {
        setShowNextSceneModal(false);

        if (isPeek) return;

        const sceneBegin = Date.now();
        const interval = setInterval(() => {
            setSceneTime(Date.now() - sceneBegin);
        }, 1000);

        if (serialisation) {
            if (currentSoundEffectIndex >= 0 && currentSoundEffectIndex < serialisation.scenes[currentSceneIndex].soundEffects.length - 1) {
                const audioElem = soundEffectRefs[currentSoundEffectIndex].current!;
                audioElem.pause();
                audioElem.currentTime = 0;
            }
            setCurrentSoundEffectIndex(-1);
        }

        return () => clearInterval(interval);
    }, [currentSceneIndex]);

    if (!serialisation) {
        return <div>Loading...</div>;
    }

    const currentScene = serialisation.scenes.find((s) => s.order === currentSceneIndex)!;

    const getFaderState = (faderId: number, sceneIndex: number): FaderState => {
        if (!serialisation) throw new Error("Serialisation is undefined");

        let faderState: FaderState | null = null;
        for (let i = sceneIndex; i >= 0; i--) {
            const scene = serialisation.scenes.find(s => s.order === i)!;
            const fader = scene.faderStates.find(f => f.faderId === faderId);
            if (fader) {
                faderState = fader;
                break;
            }
        }

        return faderState ?? {faderId, isMuted: false, faderValue: 0};
    }

    const getFader = (faderId: number): Fader => {
        if (!serialisation) throw new Error("Serialisation is undefined");
        return serialisation.faders.find(f => f.id === faderId)!;
    }

    const hasChanged = <T, >(sceneIndex: number, propertySelector: (scene: Scene) => T): boolean => {
        if (!serialisation) throw new Error("Serialisation is undefined");

        if (sceneIndex === 0) return true;

        const scene = serialisation.scenes.find(s => s.order === sceneIndex)!;
        const previousScene = serialisation.scenes.find(s => s.order === sceneIndex - 1);
        if (!previousScene) return true;
        return propertySelector(scene) !== propertySelector(previousScene);
    }

    return (
        <div className="perform__grid__container">
            {(showNextSceneModal && currentSceneIndex < serialisation.scenes.length - 1) &&
                <ModalComponent title={"123"} closeModal={() => setShowNextSceneModal(false)}>
                    <Perform initialSceneIndex={currentSceneIndex + 1} isPeek={true}/>
                </ModalComponent>}
            <div className="perform__grid__row">
                <div className="perform__grid__row__title">Audio</div>
                <div className="perform__grid__sound">
                    <div className="perform__grid__sound__changed">
                        {currentScene.faderStates.length === 0 ? (<>No changes</>) : currentScene.faderStates
                            .sort((a, b) => getFader(a.faderId).channel.localeCompare(getFader(b.faderId).channel))
                            .map((faderState: FaderState) => {
                                const fader = getFader(faderState.faderId);
                                return (
                                    <AudioFaderComponent faderChannel={fader.channel} faderPerson={fader.person}
                                                         isMuted={faderState.isMuted}
                                                         faderValue={faderState.faderValue}/>);
                            })}
                    </div>
                    <div className="perform__grid__sound__unchanged">
                        {serialisation.faders
                            .sort((a, b) => a.channel.localeCompare(b.channel))
                            .map((fader: Fader) => {
                                const faderState = getFaderState(fader.id, currentSceneIndex);
                                return (
                                    <AudioFaderComponent faderChannel={fader.channel} faderPerson={fader.person}
                                                         isMuted={faderState.isMuted}
                                                         faderValue={faderState.faderValue}/>
                                );
                            })}
                    </div>
                </div>
            </div>
            <div className="perform__grid__row">
                <div className="perform__grid__row__title">Lighting</div>
                <div className="perform__grid__lighting">
                    <div className="perform__grid__lighting__column">
                        <div className="perform__grid__lighting__column__title">Preset</div>
                        <div
                            className={`perform__grid__lighting__column__content ${hasChanged(currentSceneIndex, (s) => s.lightPreset.name) ? "perform__grid__changed" : ""}`}
                        >
                            {currentScene.lightPreset.name ?? "No preset"}
                        </div>
                    </div>
                    <div className="perform__grid__lighting__column">
                        <div className="perform__grid__lighting__column__title">Blackout</div>
                        <div
                            className={`perform__grid__lighting__column__content ${hasChanged(currentSceneIndex, (s) => s.lightPreset.isBlackout) ? "perform__grid__changed" : ""}`}
                        >
                            {currentScene.lightPreset.isBlackout ? "BLACKOUT" : "No blackout"}
                        </div>
                    </div>
                    <div className="perform__grid__lighting__column">
                        <div className="perform__grid__lighting__column__title">Master Value</div>
                        <div
                            className={`perform__grid__lighting__column__content ${hasChanged(currentSceneIndex, (s) => s.lightPreset.masterValue) ? "perform__grid__changed" : ""}`}>{`${currentScene.lightPreset.masterValue * 100}%`}</div>
                    </div>
                </div>
            </div>
            <div className="perform__grid__row">
                <div className="perform__grid__row__title">Sound Effects</div>
                <div className="perform__grid__sound-effects">
                    {currentScene.soundEffects.length === 0 ? (<>No sound effects in this
                        scene</>) : currentScene.soundEffects
                        .map((soundEffect: SoundEffect, i) => (
                            <SoundEffectComponent shouldBePlaying={currentSoundEffectIndex === i}
                                                  soundEffect={soundEffect} isNext={currentSoundEffectIndex + 1 === i}
                                                  ref={soundEffectRefs[i]}/>
                        ))
                    }
                </div>
            </div>
            <div className="perform__grid__row">
                <div className="perform__grid__row__title">Notes</div>
                {currentScene.notes ? (
                    <textarea className="perform__grid__notes" disabled>
                        {currentScene.notes ?? "No notes"}
                    </textarea>
                ) : (
                    <div className="perform__grid__notes">No notes</div>
                )
                }
            </div>
            <div className="perform__grid__bottom-bar">
                <div className="perform__grid__bottom-bar__scene-name">{currentScene.name}</div>
                <div className="perform__grid__bottom-bar__line"></div>
                <div
                    className="perform__grid__bottom-bar__scene-number">{currentSceneIndex + 1}/{serialisation.scenes.length}</div>
                <div className="perform__grid__bottom-bar__line"></div>
                <div
                    className="perform__grid__bottom-bar__time">{convertMilliseconds(sceneTime).map((s) => s.toString().padStart(2, "0")).join(":")}</div>
                <div className="perform__grid__bottom-bar__line"></div>
                {currentSceneIndex < serialisation.scenes.length - 1 && (
                    <div
                        className="perform__grid__bottom-bar__next-scene">
                        <div role="button" tabIndex={0} onClick={() => setShowNextSceneModal(true)}
                             style={{cursor: "pointer"}}
                             className="perform__grid__bottom-bar__next-scene__name">{serialisation.scenes[currentSceneIndex + 1].name}</div>
                        <div
                            className="perform__grid__bottom-bar__next-scene__keyword">{serialisation.scenes[currentSceneIndex + 1].keyword}</div>
                    </div>
                )}
                <div className="perform__grid__bottom-bar__line"></div>
                <button className={currentSceneIndex > 0 ? "" : "disabled"}
                        onClick={previousScene}>Previous
                </button>
                <button className={currentSceneIndex < serialisation.scenes.length - 1 ? "" : "disabled"}
                        onClick={nextScene}>Next
                </button>
            </div>
        </div>
    );
};

export default Perform;