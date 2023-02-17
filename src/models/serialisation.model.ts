import Fader from "./fader.model";
import Scene from "./scene.model";

interface Serialisation {
    faders: Array<Fader>;
    scenes: Array<Scene>;
}

export default Serialisation;