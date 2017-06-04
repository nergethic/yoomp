"use strict";
// NO DEPENDENCIES

function assert(expr) {
    // todo graphics log
    if (Config.Debug){
        if (typeof(expr) == "bool") {
            if (!expr) {
                console.log("Assertion failed!")
                gs = "ASSERTION FAILURE"
            }
        } else {
            //console.log("ERROR: Invalid assert argument")
        }
    }
}

function log(gs, label, str) {
    for (let i = 0; i < gs.textBuffer.length; ++i) {
        if (label == gs.textBuffer[i][0]) {
            gs.textBuffer[i][1] = str
            return
        } 
    }
    gs.textBuffer.push([label, str])
}

function drawUI(gs) {
    let board = document.getElementById("debugInfo")
    board.innerHTML = ""
    
    for (let i = 0; i < gs.textBuffer.length; ++i) {
        board.innerHTML += gs.textBuffer[i][0] + gs.textBuffer[i][1]
        board.innerHTML += "<br>"
    }
}