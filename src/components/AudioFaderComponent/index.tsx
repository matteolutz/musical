import './style.css';

import React, { type FC } from 'react';

interface AudioFaderComponentProps {
  isMuted: boolean;
  faderValue: number;
  faderChannel: string;
  faderPerson: string;
}

const AudioFaderComponent: FC<AudioFaderComponentProps> = ({
  faderValue,
  isMuted,
  faderChannel,
  faderPerson
}) => {
  // TODO: convert faderValue to transform value
  const transform = 0;

  return (
    <div className="channel">
      <div className="bus-control">
        <div
          className={`button button--bus mute-button ${
            isMuted ? 'active' : ''
          }`}
        >
          M
        </div>
        <div className="button button--bus">S</div>
      </div>
      <div className="knob knob--pan"></div>
      <div className="slider-value">
        <div className="slider-value__wrap">{faderValue}</div>
      </div>
      <div className="slider">
        <div className="fader-track">
          <div
            className="fader"
            style={{ transform: `translateY(${transform}px)` }}
          ></div>
        </div>
        <div className="vca">
          <div className="vca__meter"></div>
          <div className="vca__markers">
            <div>12</div>
            <div>6</div>
            <div>0</div>
            <div>3</div>
            <div>6</div>
            <div>9</div>
            <div>12</div>
            <div>15</div>
            <div>18</div>
            <div>21</div>
            <div>24</div>
            <div>30</div>
            <div>35</div>
            <div>40</div>
            <div>45</div>
            <div>50</div>
            <div>60</div>
          </div>
        </div>
      </div>
      <div className="fader-name">
        <div className="fader-name__channel">{faderChannel}</div>
        <div className="fader-name__person">{faderPerson}</div>
      </div>
    </div>
  );
};

export default AudioFaderComponent;
