"use strict";
// DEPENDS ON CONFIG

let ColorPalette = {
    "green": {
        "light":  [0.6784, 0.8313, 0.3019, 1.0],
        "medium": [0.349, 0.5607, 0.1803, 1.0],
        "dark":   [0.0, 0.3215, 0.3215, 1.0]
    },

    "blue": {
        "dark":   [1.0, 0.7, 0.3215, 1.0],
        "medium": [0.6784, 1.0, 0.3019, 1.0],
        "light":  [0.549, 0.3607, 0.2803, 1.0]
    }
}

let TextureType = {
    "floor": null,
    "save": null
}

let Colors = {
    White: [1.0, 1.0, 1.0, 1.0],
    Black: [0.0, 0.0, 0.0, 1.0]
}

let gs = {
    canvas: null,
    scene: null,
    camera: null,
    entities: null,
    lastUsedProgramInfo: null,
    lastUsedBufferInfo: null,
    currentProgram: null,
    screens : [],
    currentScreen: null,
    metersToPixels: 100.0,
    tunnelWidth: 8,
    tileWidth: 100.0,
    textBuffer: [],
    score: 0,
    lifeCount: 3,
    jumpCount: 3,
    currentLevel: null,
    currentLevelColorPalette: Object.assign({}, ColorPalette.green),
    currentComputedColorPalette: Object.assign({}, ColorPalette.green),
    clearColor: [0.0, 0.0, 0.0],
    brightnessLevel: 0, // normal
    shifterLeft: false,
    shifterRight: false,
    pauseBallMovement: false,
    savePointPosition: new V3(0, 0, 0),
    muteAudio: Config.MuteAudio,
    textures: {},
    pauseCameraMovement: false,
    audio: {}
}