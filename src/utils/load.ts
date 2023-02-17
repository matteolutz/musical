import Serialisation from "../models/serialisation.model";

export const loadFromJson = (json: string): Serialisation => {
    const jsonObj = JSON.parse(json);

    if(!("faders" in jsonObj) || !("scenes" in jsonObj)) {
        throw new Error("Invalid JSON");
    }

    if(!Array.isArray(jsonObj.faders) || !Array.isArray(jsonObj.scenes)) {
        throw new Error("Invalid JSON");
    }

    return {
        faders: jsonObj.faders,
        scenes: jsonObj.scenes
    };
};

export const toJson = (serialisation: Serialisation): string => {
    return JSON.stringify(serialisation);
}