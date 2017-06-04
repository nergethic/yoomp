"use strict";
// DEPENDS ON MATRIX, VECTOR | NEEDS MESH

let Origin = {
    Center: 0,
    Corner: 1
}

function updatePosition(mesh) {
    if (mesh.needsUpdate) {
        mesh.needsUpdate = false
        setMatrix4Translation(mesh.worldMatrix, mesh.position)
    }
}

function setPosition(mesh, x, y, z) {
    mesh.position.x = x
    mesh.position.y = y
    mesh.position.z = z

    updatePosition(mesh)
}

function updateRelTilePos(relPos, pos, ang, tileAng) { // TODO
    relPos.x = ang % tileAng
    let y = (pos.z-50.0) / gs.tileWidth // -50 is hardcoded relative to tunnel
    relPos.y = y - Math.floor(y)
}

function getRelTilePos() {

}

function getAbsTilePos() {

}

function getWorldPosition(absPos) {
    //return new V3(absPos.x*gs.tileWidth, absPos0.0)
}

function mapCoords(v3, val) {
    assert(val != 0.0)
    return new V3(v3.x/val, v3.y/val, v3.z/val)
}