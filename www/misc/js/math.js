"use strict";
// NO DEPENDENCIES

const PI = 3.1415
const TAU = 6.2832

function Rect(leftX, topY , width, height) {
    this.leftX  = leftX,
    this.topY   = topY,
    this.width  = width,
    this.height = height
}

function isInsideRect(point, rect) {
    if ((point.x >= rect.leftX) && (point.x <= rect.width) &&
        (point.y >= rect.topY)  && (point.y <= rect.height))
        return true
    else
        return false
}

function randInt(min, max) {
    return min + Math.floor(Math.random() * (max - min))
}

Math.Cos = (n) => { 
    return parseFloat(Math.cos(n).toFixed(5))
}

Math.Sin = (n) => {
    return parseFloat(Math.sin(n).toFixed(5))
}

Math.Tan = (n) => {
    return parseFloat(Math.tan(n).toFixed(5))
}

function toRadian(ang) {
    return ang * (Math.PI / 180.0)
}

function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max)
}

function lerp(a, b, t) {
    return b*t + a*(1 - t)
}

function lerpRGBA(src, dest, t) {
    return [
        lerp(src[0], dest[0], t),
        lerp(src[1], dest[1], t),
        lerp(src[2], dest[2], t),
        src[3] * dest[3]
    ]
}

function hexToRgb(hex) { // TODO study this
    let bigint = parseInt(hex, 16)
    let r = (((bigint >> 16) & 255) / 255.0)
    let g = (((bigint >> 8) & 255)  / 255.0)
    let b = ((bigint & 255)         / 255.0)

    return [r, g, b]
}