"use strict";
// REQUIRES MISC

let AudioInfo = [
    //{name: "main",       path: "main.wav",       loop: true},
    {name: "main",            path: "dronelogic.ogg",      loop: true, offset: 0.9},
    {name: "jump",            path: "jump.ogg",            volume: 0.5},
    {name: "longjump",        path: "longjump.ogg",        volume: 0.5},
    {name: "superjump",       path: "superjump.ogg",       volume: 0.5},
    {name: "lightning1",      path: "lightning1.ogg",      volume: 0.5},
    {name: "lightning2",      path: "lightning2.ogg",      volume: 0.5},
    {name: "lightning3",      path: "lightning3.ogg",      volume: 0.5},
    {name: "earthquake1",     path: "earthquake1.ogg",     volume: 0.5},
    {name: "earthquake2",     path: "earthquake2.ogg",     volume: 0.5},
    {name: "shifter",         path: "shifter.ogg",         volume: 0.5},
    {name: "teleport",        path: "teleport.ogg",        volume: 0.5},
    {name: "extralife",       path: "extralife.ogg",       volume: 0.5},
    {name: "extrajump",       path: "extrajump.ogg",       volume: 0.5},
    {name: "savepoint",       path: "savepoint.ogg",       volume: 0.5},
    {name: "brightnessminus", path: "brightnessminus.ogg", volume: 0.5},
    {name: "brightnessplus",  path: "brightnessplus.ogg",  volume: 0.5}
]

function initAudio(gs) {
    forEach(AudioInfo, (e, i) => {
        let newAudio = new Audio(Config.SoundDir + e.path)
        let newAudio2 = newAudio.cloneNode(true)

        if (e.volume != undefined) {
            newAudio.volume = e.volume
            newAudio2.volume = e.volume
        }

        if (e.loop != undefined) {
            newAudio.loops = e.loop
            newAudio2.loops = e.loop
        }

        if (e.offset != undefined) {
            newAudio.offset = e.offset
            newAudio2.offset = e.offset
        } else {
            newAudio.offset = 0.0
            newAudio2.offset = 0.0
        }

        // ugh...
        newAudio.onended = () => {
            newAudio.src = newAudio.src
            if (newAudio.loops) {
                //newAudio.play()
                //newAudio2.play()
                //newAudio.currentTime = 0.3
            }
        }
        
        gs.audio[e.name] = {samples: [newAudio, newAudio2], index: 0}
    })
}

function playSound(soundName) {
    gs.audio[soundName].samples[gs.audio[soundName].index].play()
    gs.audio[soundName].index = switchBool(gs.audio[soundName].index)
}