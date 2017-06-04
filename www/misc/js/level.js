"use strict";
// DEPENDS ON OBJECTS

function getLevelLength(gs, level) {
    if (level.length % gs.tunnelWidth != 0) {
        console.log("ERROR: Level is incompatible with current state!")
        return ReturnCode.Error
    } else {
        return level.length/gs.tunnelWidth
    }
}