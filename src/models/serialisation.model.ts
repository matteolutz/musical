import type Fader from './fader.model';
import type Scene from './scene.model';

interface Serialisation {
  faders: Fader[];
  scenes: Scene[];
}

export default Serialisation;
