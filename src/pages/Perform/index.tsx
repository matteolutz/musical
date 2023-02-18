import './style.css';

import React, {
  createRef,
  type FC,
  type RefObject,
  useEffect,
  useState
} from 'react';

import AudioFaderComponent from '../../components/AudioFaderComponent';
import ModalComponent from '../../components/ModalComponent';
import SoundEffectComponent from '../../components/SoundEffectComponent';
import type Fader from '../../models/fader.model';
import { type FaderState } from '../../models/fader.model';
import type Scene from '../../models/scene.model';
import type Serialisation from '../../models/serialisation.model';
import type SoundEffect from '../../models/soundEffect.model';
import { useRefState } from '../../utils/state';
import { TEST_SERIALIZATION_DATA } from '../../utils/testData';
import { convertMilliseconds } from '../../utils/time';

interface PerformProps {
  initialSceneIndex?: number;
  isPeek?: boolean;
}

const Perform: FC<PerformProps> = ({ initialSceneIndex, isPeek = false }) => {
  const [serialisation, setSerialisation, serialisationRef] = useRefState<
    Serialisation | undefined
  >(undefined);

  const [currentSceneIndex, setCurrentSceneIndex, currentSceneIndexRef] =
    useRefState<number>(initialSceneIndex != null ? initialSceneIndex : 0);

  const [
    currentSoundEffectIndex,
    setCurrentSoundEffectIndex,
    currentSoundEffectIndexRef
  ] = useRefState<number>(-1);
  const [soundEffectRefs, setSoundEffectRefs, soundEffectRefsRef] = useRefState<
    Array<RefObject<HTMLAudioElement>>
  >([]);

  const [sceneTime, setSceneTime] = useState<number>(0);

  const [showNextSceneModal, setShowNextSceneModal] = useState<boolean>(false);

  const nextScene = (): void => {
    if (serialisationRef.current == null) return;
    if (
      currentSceneIndexRef.current <
      serialisationRef.current.scenes.length - 1
    ) {
      setCurrentSceneIndex(currentSceneIndexRef.current + 1);
    }
  };

  const previousScene = (): void => {
    if (currentSceneIndexRef.current > 0) {
      setCurrentSceneIndex(currentSceneIndexRef.current - 1);
    }
  };

  const keyHandler = (e: KeyboardEvent): void => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        nextScene();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        previousScene();
        break;
      case ' ': {
        e.preventDefault();
        if (serialisationRef.current == null) return;

        if (
          currentSoundEffectIndexRef.current ===
          serialisationRef.current.scenes[currentSceneIndexRef.current]
            .soundEffects.length -
            1
        )
          return;

        if (
          currentSoundEffectIndexRef.current >= 0 &&
          soundEffectRefsRef.current[currentSoundEffectIndexRef.current]
            .current != null
        ) {
          soundEffectRefsRef.current[
            currentSoundEffectIndexRef.current
          ].current?.pause();
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          soundEffectRefsRef.current[
            currentSoundEffectIndexRef.current
          ].current!.currentTime = 0;
        }

        setCurrentSoundEffectIndex(currentSoundEffectIndexRef.current + 1);

        const audioElem =
          soundEffectRefsRef.current[currentSoundEffectIndexRef.current]
            .current;
        if (audioElem == null) return;

        audioElem.addEventListener(
          'ended',
          () => {
            audioElem.pause();
            audioElem.currentTime = 0;
          },
          { once: true }
        );

        void audioElem.play();

        break;
      }
      case 'r':
        if (
          currentSoundEffectIndexRef.current >= 0 &&
          soundEffectRefsRef.current[currentSoundEffectIndexRef.current]
            .current != null
        ) {
          soundEffectRefsRef.current[
            currentSoundEffectIndexRef.current
          ].current?.pause();
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          soundEffectRefsRef.current[
            currentSoundEffectIndexRef.current
          ].current!.currentTime = 0;
        }

        setCurrentSoundEffectIndex(-1);
        break;
    }
  };

  useEffect(() => {
    const serialisationData = { ...TEST_SERIALIZATION_DATA };
    setSerialisation(serialisationData);

    !isPeek && document.addEventListener('keydown', keyHandler);

    return isPeek
      ? () => 0
      : () => {
          document.removeEventListener('keydown', keyHandler);
        };
  }, []);

  useEffect(() => {
    if (serialisation == null || isPeek) return;
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

    if (serialisation != null) {
      if (
        currentSoundEffectIndex >= 0 &&
        currentSoundEffectIndex <
          serialisation.scenes[currentSceneIndex].soundEffects.length - 1
      ) {
        const audioElem = soundEffectRefs[currentSoundEffectIndex].current;
        if (audioElem) {
          audioElem.pause();
          audioElem.currentTime = 0;
        }
      }
      setCurrentSoundEffectIndex(-1);
    }

    return () => {
      clearInterval(interval);
    };
  }, [currentSceneIndex]);

  if (serialisation == null) {
    return <div>Loading...</div>;
  }

  const currentScene = serialisation.scenes.find(
    (s) => s.order === currentSceneIndex
  );
  if (!currentScene) throw new Error('Scene not found');

  const getFaderState = (faderId: number, sceneIndex: number): FaderState => {
    if (!serialisation) throw new Error('Serialisation is undefined');

    let faderState: FaderState | null = null;
    for (let i = sceneIndex; i >= 0; i--) {
      const scene = serialisation.scenes.find((s) => s.order === i);
      if (!scene) throw new Error('Scene not found');
      const fader = scene.faderStates.find((f) => f.faderId === faderId);
      if (fader != null) {
        faderState = fader;
        break;
      }
    }

    return faderState ?? { faderId, isMuted: false, faderValue: 0 };
  };

  const getFader = (faderId: number): Fader => {
    if (!serialisation) throw new Error('Serialisation is undefined');
    const fader = serialisation.faders.find((f) => f.id === faderId);
    if (!fader) throw new Error('Fader not found');
    return fader;
  };

  const hasChanged = <T,>(
    sceneIndex: number,
    propertySelector: (scene: Scene) => T
  ): boolean => {
    if (!serialisation) throw new Error('Serialisation is undefined');

    if (sceneIndex === 0) return true;

    const scene = serialisation.scenes.find((s) => s.order === sceneIndex);
    if (!scene) return true;
    const previousScene = serialisation.scenes.find(
      (s) => s.order === sceneIndex - 1
    );
    if (previousScene == null) return true;
    return propertySelector(scene) !== propertySelector(previousScene);
  };

  return (
    <div className="perform__grid__container">
      {showNextSceneModal &&
        currentSceneIndex < serialisation.scenes.length - 1 && (
          <ModalComponent
            title={'123'}
            closeModal={() => {
              setShowNextSceneModal(false);
            }}
          >
            <Perform initialSceneIndex={currentSceneIndex + 1} isPeek={true} />
          </ModalComponent>
        )}
      <div className="perform__grid__row">
        <div className="perform__grid__row__title">Audio</div>
        <div className="perform__grid__sound">
          <div className="perform__grid__sound__changed">
            {currentScene.faderStates.length === 0 ? (
              <>No changes</>
            ) : (
              currentScene.faderStates
                .sort((a, b) =>
                  getFader(a.faderId).channel.localeCompare(
                    getFader(b.faderId).channel
                  )
                )
                .map((faderState: FaderState) => {
                  const fader = getFader(faderState.faderId);
                  return (
                    <AudioFaderComponent
                      key={fader.id}
                      faderChannel={fader.channel}
                      faderPerson={fader.person}
                      isMuted={faderState.isMuted}
                      faderValue={faderState.faderValue}
                    />
                  );
                })
            )}
          </div>
          <div className="perform__grid__sound__unchanged">
            {serialisation.faders
              .sort((a, b) => a.channel.localeCompare(b.channel))
              .map((fader: Fader) => {
                const faderState = getFaderState(fader.id, currentSceneIndex);
                return (
                  <AudioFaderComponent
                    key={fader.id}
                    faderChannel={fader.channel}
                    faderPerson={fader.person}
                    isMuted={faderState.isMuted}
                    faderValue={faderState.faderValue}
                  />
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
              className={`perform__grid__lighting__column__content ${
                hasChanged(currentSceneIndex, (s) => s.lightPreset.name)
                  ? 'perform__grid__changed'
                  : ''
              }`}
            >
              {currentScene.lightPreset.name ?? 'No preset'}
            </div>
          </div>
          <div className="perform__grid__lighting__column">
            <div className="perform__grid__lighting__column__title">
              Blackout
            </div>
            <div
              className={`perform__grid__lighting__column__content ${
                hasChanged(currentSceneIndex, (s) => s.lightPreset.isBlackout)
                  ? 'perform__grid__changed'
                  : ''
              }`}
            >
              {currentScene.lightPreset.isBlackout ? 'BLACKOUT' : 'No blackout'}
            </div>
          </div>
          <div className="perform__grid__lighting__column">
            <div className="perform__grid__lighting__column__title">
              Master Value
            </div>
            <div
              className={`perform__grid__lighting__column__content ${
                hasChanged(currentSceneIndex, (s) => s.lightPreset.masterValue)
                  ? 'perform__grid__changed'
                  : ''
              }`}
            >{`${currentScene.lightPreset.masterValue * 100}%`}</div>
          </div>
        </div>
      </div>
      <div className="perform__grid__row">
        <div className="perform__grid__row__title">Sound Effects</div>
        <div className="perform__grid__sound-effects">
          {currentScene.soundEffects.length === 0 ? (
            <>No sound effects in this scene</>
          ) : (
            currentScene.soundEffects.map((soundEffect: SoundEffect, i) => (
              <SoundEffectComponent
                key={i}
                shouldBePlaying={currentSoundEffectIndex === i}
                soundEffect={soundEffect}
                isNext={currentSoundEffectIndex + 1 === i}
                ref={soundEffectRefs[i]}
              />
            ))
          )}
        </div>
      </div>
      <div className="perform__grid__row">
        <div className="perform__grid__row__title">Notes</div>
        {currentScene.notes ? (
          <textarea className="perform__grid__notes" disabled>
            {currentScene.notes ?? 'No notes'}
          </textarea>
        ) : (
          <div className="perform__grid__notes">No notes</div>
        )}
      </div>
      <div className="perform__grid__bottom-bar">
        <div className="perform__grid__bottom-bar__scene-name">
          {currentScene.name}
        </div>
        <div className="perform__grid__bottom-bar__line"></div>
        <div className="perform__grid__bottom-bar__scene-number">
          {currentSceneIndex + 1}/{serialisation.scenes.length}
        </div>
        <div className="perform__grid__bottom-bar__line"></div>
        <div className="perform__grid__bottom-bar__time">
          {convertMilliseconds(sceneTime)
            .map((s) => s.toString().padStart(2, '0'))
            .join(':')}
        </div>
        <div className="perform__grid__bottom-bar__line"></div>
        {currentSceneIndex < serialisation.scenes.length - 1 && (
          <div className="perform__grid__bottom-bar__next-scene">
            <div
              role="button"
              tabIndex={0}
              onClick={() => {
                setShowNextSceneModal(true);
              }}
              style={{ cursor: 'pointer' }}
              className="perform__grid__bottom-bar__next-scene__name"
            >
              {serialisation.scenes[currentSceneIndex + 1].name}
            </div>
            <div className="perform__grid__bottom-bar__next-scene__keyword">
              {serialisation.scenes[currentSceneIndex + 1].keyword}
            </div>
          </div>
        )}
        <div className="perform__grid__bottom-bar__line"></div>
        <button
          className={currentSceneIndex > 0 ? '' : 'disabled'}
          onClick={previousScene}
        >
          Previous
        </button>
        <button
          className={
            currentSceneIndex < serialisation.scenes.length - 1
              ? ''
              : 'disabled'
          }
          onClick={nextScene}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Perform;
