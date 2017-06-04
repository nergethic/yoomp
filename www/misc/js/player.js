"use strict";
// DEPENDS ON VECTOR, MATH

function jump(position, direction, height, time) {
    let jumpFunctionResult = height * Math.Sin(PI * time)
    let vec = direction.mul(new V3(jumpFunctionResult, jumpFunctionResult, 1.0))
    let newPosition = new V3(vec.x, vec.y, position.z)
    
    return newPosition
}