import './style.css';

import React, { forwardRef, type MutableRefObject } from 'react';

import type SoundEffect from '../../models/soundEffect.model';

interface SoundEffectComponentProps {
  soundEffect: SoundEffect;
  isNext: boolean;
  shouldBePlaying: boolean;
}

const SoundEffectComponent = forwardRef<
  HTMLAudioElement,
  SoundEffectComponentProps
>(({ soundEffect, isNext, shouldBePlaying }, ref) => {
  const isPlaying =
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    ref != null && (ref as MutableRefObject<HTMLAudioElement>).current
      ? !(ref as MutableRefObject<HTMLAudioElement>).current.paused
      : false;

  return (
    <div
      className={`sound-effect ${isNext ? 'is-next' : ''} ${
        isPlaying ? 'is-playing' : ''
      } ${shouldBePlaying ? 'should-be-playing' : ''}`}
    >
      <div className="sound-effect__name">{soundEffect.name}</div>
      <div className="sound-effect__keyword">{soundEffect.keyword}</div>
      <audio ref={ref} controls={false} src={soundEffect.file} />
    </div>
  );
});

SoundEffectComponent.displayName = 'SoundEffectComponent';

export default SoundEffectComponent;
