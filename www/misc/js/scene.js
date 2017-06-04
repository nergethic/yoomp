"use strict";
// NEEDS MESH, VECTOR

let ScreenType = {
    MainMenu: 0,
    LevelInfo: 1,
    Game: 2,
    LevelFinish: 3,
    GameOver: 4
}

function Screen(type) {
    this.type = type
    this.meshes = []
    this.origin = new V3(0.0, 0.0, 0.0)
}

function addMeshToScreen(screen, mesh) {
    screen.meshes.push(mesh)
}

/*
function sortScene(scene) { // TODO
    scene.sortedVertices = []
    scene.sortedIndices = []
    scene.isSorted = true

    for (let i = 0; i < scene.meshes.length; ++i) {
        scene.sortedVertices.push(scene.meshes[i].geometry.vertices)
        scene.sortedIndices.push(scene.meshes[i].geometry.indices)
    }

    console.log(scene)
}
*/