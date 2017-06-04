"use strict";
// NO DEPENDENCIES

function Key() {
    this.pressed = false
    this.halfState = 0
}

let Input = {
    keyUp: new Key(),
    keyDown: new Key(),
    keyLeft: new Key(),
    keyRight: new Key(),
    keyW: new Key(),
    keyS: new Key(),
    keyA: new Key(),
    keyD: new Key(),
    keyQ: new Key(),
    keyE: new Key(),
    keySpacebar: new Key(),
    keyEnter: new Key(),
    keyTab: new Key()
}

function handleKeyDown(e) {
    switch (e.key) {
        case "ArrowLeft": {
            e.preventDefault()
            Input.keyLeft.pressed = true
        } break;

        case "ArrowRight": {
            e.preventDefault()
            Input.keyRight.pressed = true
        } break;

        case "ArrowUp": {
            e.preventDefault()
            Input.keyUp.pressed = true
        } break;

        case "ArrowDown": {
            e.preventDefault()
            Input.keyDown.pressed = true
        } break;

        case "Enter": {
            e.preventDefault()
            Input.keyEnter.pressed = true
        } break;

        case "Tab": {
            e.preventDefault()
            Input.keyTab.pressed = true
        } break;

        case "w": {
            Input.keyW.pressed = true
        } break;

        case "s": {
            Input.keyS.pressed = true
        } break;

        case "a": {
            Input.keyA.pressed = true
        } break;

        case "d": {
            Input.keyD.pressed = true
        } break;

        case "q": {
            Input.keyQ.pressed = true
        } break;

        case "e": {
            Input.keyE.pressed = true
        } break;

        case " ": {
            Input.keySpacebar.pressed = true
        } break;
    }
}

function handleKeyUp(e) {
    switch (e.key) {
        case "ArrowLeft": {
            Input.keyLeft.pressed = false
        } break;

        case "ArrowRight": {
            Input.keyRight.pressed = false
        } break;

        case "ArrowUp": {
            Input.keyUp.pressed = false
        } break;

        case "ArrowDown": {
            Input.keyDown.pressed = false
        } break;

        case "Enter": {
            e.preventDefault()
            Input.keyEnter.pressed = false
        } break;

        case "Tab": {
            e.preventDefault()
            Input.keyTab.pressed = false
        } break;

        case "w": {
            Input.keyW.pressed = false
        } break;

        case "s": {
            Input.keyS.pressed = false
        } break;

        case "a": {
            Input.keyA.pressed = false
        } break;

        case "d": {
            Input.keyD.pressed = false
        } break;

        case "q": {
            Input.keyQ.pressed = false
        } break;

        case "e": {
            Input.keyE.pressed = false
        } break;
    }

    if (e.which == 32) { // SPACEBAR
        Input.keySpacebar.pressed = false
    }
}