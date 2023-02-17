import Serialisation from "../models/serialisation.model";

export const TEST_SERIALIZATION_DATA: Serialisation = {
    faders: [
        {
            id: 1,
            channel: "CH 1",
            person: "Max Mustermann"
        },
        {
            id: 2,
            channel: "CH 30",
            person: "Erika Mustermann"
        },
        {
            id: 101,
            channel: "G 1",
            person: "Headsets"
        }
    ],
    scenes: [
        {
            order: 0,
            name: "Scene 1",
            faderStates: [
                {
                    faderId: 1,
                    faderValue: -60,
                    isMuted: false,
                },
                {
                    faderId: 2,
                    faderValue: -10,
                    isMuted: true
                }
            ],
            lightPreset: {
                name: "Szene 1",
                isBlackout: false,
                masterValue: 0.7,
            },
            soundEffects: [
                {
                    name: "Handy",
                    keyword: "Ein magisches Geräusch",
                    file: "https://www.kozco.com/tech/piano2.wav"
                },
                {
                    name: "Schulgong",
                    keyword: "Schule",
                    file: "https://www.kozco.com/tech/organfinale.wav"
                }
            ],
            notes: "Wachseim sein",
            keyword: "Er schläft"
        },
        {
            order: 1,
            name: "Scene 2",
            faderStates: [
                {
                    faderId: 2,
                    faderValue: -20,
                    isMuted: false
                }
            ],
            lightPreset: {
                name: "Szene 2",
                isBlackout: true,
                masterValue: 0.7,
            },
            soundEffects: [],
            notes: "",
            keyword: "Er wacht auf"
        },
        {
            order: 2,
            name: "Szene 3",
            faderStates: [],
            lightPreset: {
                name: "Szene 3",
                isBlackout: true,
                masterValue: 0
            },
            soundEffects: [],
            notes: "Blackout is important",
            keyword: "Die Schule beginnt"
        }
    ]
};