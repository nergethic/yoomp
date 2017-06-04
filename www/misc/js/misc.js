"use strict";

let ReturnCode = {
    Error: -1,
    Success: 0,
    Warning: 1
}

function forEach(elems, f) {
    for (let i = 0; i < elems.length; ++i) {
        f(elems[i], i)
    }
}

function isIn(arr, elem) { // linear search
    let indices = new Array()
    let found = false
    
    for (let i = 0; i < arr.length; ++i)
        if (arr[i] == elem)
            indices.push(i)

    let count = indices.length

    if (count != 0)
        found = true

    return { found: found, count: count, indices: indices }
}

function switchBool(val) {
    return (val == 0 ? 1 : 0)
}

function clone(obj) { // crazy, doesn't work for functions! :(
    let newObj = Object.assign({}, obj)

    let keys = Object.keys(obj)
    let elem
    for (let i = 0; i < keys.length; ++i) {
        elem = obj[keys[i]]
        if (elem === null || (elem instanceof WebGLBuffer) || elem instanceof WebGLProgram) continue // || (obj[keys[i]] instanceof WebGLBuffer) || (obj[keys[i]] instanceof WebGLProgram)
        else if ((elem instanceof Array) || (elem instanceof Float32Array) || (elem instanceof Uint16Array)) {
            newObj[keys[i]] = elem.slice()
        } else if (elem instanceof Object) {
            newObj[keys[i]] = clone(elem)
        }
    }

    return newObj
}