"use strict";
// DEPENDS ON MATRIX, VECTOR

let camera = {
    position: new V3(0.0, 0.0, 0.0),
    lookPoint: new V3(0.0, 0.0, 0.0),
    fov: 50,
    viewMatrix: new Float32Array(16),
    worldMatrix: new Float32Array(16),
    projMatrix: new Float32Array(16),
    up: new V3(0.0, 1.0, 0.0),
    minDistance: 0.1,
    maxDistance: 5.5
}

function initCamera(camera, x, y, z) {
    identity(camera.worldMatrix)
    identity(camera.viewMatrix)

    if (x != undefined && y != undefined && z != undefined) {
        camera.position = new V3(x, y, z)
    }
    lookAt(camera, new V3(0.0, 0.0, 0.0))
    changePerspective(camera, camera.fov)
    updateCamera(camera)
}

function setCameraPosition(camera, x, y, z) {
    camera.position = new V3(x, y, z)
    updateCamera(camera)
}

function moveCamera(camera, x, y, z) {
    camera.position = camera.position.add(new V3(x, y, z))
    updateCamera(camera)
}

function updateCamera(camera) {
    setMatrix4Translation(camera.worldMatrix, mapCoords(camera.position, gs.metersToPixels))
    inverse(camera.viewMatrix, camera.worldMatrix)
}

function lookAt(camera, pos) {
    camera.lookPoint = new V3(pos.x, pos.y, pos.z)
    xlookAt(camera.viewMatrix, camera.position.toArray(), camera.lookPoint.toArray(), camera.up.toArray())
}

function changePerspective(camera, fov) {
    camera.fov = fov
    perspective(camera.projMatrix, toRadian(camera.fov), gs.canvas.width/gs.canvas.height, camera.minDistance, camera.maxDistance) // fov 75
}