"use strict";
// NO DEPENDENCIES

// RIGHT NOW CREATING MULTIPLE ATTRIBUTE CONTAINERS WITH THE SAME ATTRIBS DOESN'T WORK!!!
// YOU WILL GET AN ERROR: 'GlDrawElements: attempt to access out of range vertices'
// THERE IS NO NEED FOR CREATING MULTIPLE CLONES, SO THERE'S THAT


let AttributeType = {
    Float32: 0,
    Float64: 1,
    Int8:    2,
    Int16:   3,
    Int32:   4,
    Uint8:   5,
    Uint16:  6, 
    Uint32:  7
}

let UniformType = {
    Int:     0,
    Float:   1,
    V2:      2,
    V3:      3,
    V4:      4,
    Matrix3: 5,
    Matrix4: 6,
    Texture: 7
}

function Attribute(name, elementsPerVertex, data, type) {
    this.name = name
    this.elementsPerVertex = elementsPerVertex

    switch (type) {
        case AttributeType.Float32: {
            this.type = Float32Array
        } break;

        case AttributeType.Float64: {
            this.type = Float32Array
        } break;

        case AttributeType.Int8: {
            this.type = Int8Array
        } break;

        case AttributeType.Int16: {
            this.type = Int16Array
        } break;

        case AttributeType.Int32: {
            this.type = Int32Array
        } break;

        case AttributeType.Uint8: {
            this.type = Uint8Array
        } break;

        case AttributeType.Uint16: {
            this.type = Uint16Array
        } break;

        case AttributeType.Uint32: {
            this.type = Uint32Array
        } break;

        default: {
            console.log("UNRECOGNIZED ATTRIBUTE TYPE!!!")
        } break;
    }
    
    this.data = data
}

function Attributes(attributesArr) {
    this.attribBufferInfo = attributesArr
    this.index = {}

    for (let i = 0; i < attributesArr.length; ++i) {
        this.index[this.attribBufferInfo[i].name] = i
        extendAttributeInfo(this.attribBufferInfo[i])
    }
}

function uniformExtension(e, uniformsInfo) {
    e.uniforms = uniformsInfo.uniforms

    if (e.uniformsIndex == undefined) {
        e.uniformsIndex = uniformsInfo.index
    } else {
        e.uniformsIndex = Object.assign({}, e.uniformsIndex, uniformsInfo.index) // merge
    }

    e.getUniform = (name) => {
        return e.uniforms[e.uniformsIndex[name]]
    }

    e.setUniform = (name, value) => {
        e.uniforms[e.uniformsIndex[name]].value = value
        e.uniforms[e.uniformsIndex[name]].needsUpdate = true
    }

    e.addUniform = (uniform) => {
        let found = false
        for (let i = 0; i < e.uniforms.length; ++i) {
            if (e.uniforms[i].name == uniform.name) {
                found = true
                break;
            }
        }

        if (!found) {
            e.uniforms.push(uniform)
        }

        if (e.uniformsIndex[uniform.name] == undefined) {
            e.uniformsIndex[uniform.name] = e.uniforms.length-1
        }
    }
}

function extendAttributeInfo(attrib) {
    attrib.location = null
    attrib.buffer = gl.createBuffer()
    attrib.stride = attrib.elementsPerVertex * attrib.type.BYTES_PER_ELEMENT
    attrib.needsUpdate = true
}

function Uniform(name, value, type) {
    this.name  = name
    this.value = value
    this.type  = type
    this.location = null
    this.shaderName = "u_" + this.name
    this.set = null
    this.needsUpdate = true

    switch (type) {
        case UniformType.Matrix4: {
            this.set = gl.uniformMatrix4fv
        } break;

        case UniformType.Matrix3: {
            this.set = gl.uniformMatrix3fv
        } break;

        case UniformType.V3: {
            this.set = gl.uniform3fv
        } break;

        case UniformType.V2: {
            this.set = gl.uniform2fv
        } break;

        case UniformType.V4: {
            this.set = gl.uniform4fv
        } break;

        case UniformType.Float: {
            this.set = gl.uniform1f
        } break;
        
        case UniformType.Texture:
        case UniformType.Int: {
            this.set = gl.uniform1i
        } break;

        default: {
            console.log("UNKNOWN UNIFORM TYPE!")
        }
    }
}

function Uniforms(uniformsArr) {
    this.index = {}
    for (let i = 0; i < uniformsArr.length; ++i) {
        this.index[uniformsArr[i].name] = i
    }

    this.uniforms = uniformsArr
}

function attributeExtension(e, attributes) {
    if (e.indices == undefined) return

    e.indicesAttribute = new Attribute("indices",  3, new Uint16Array(),  AttributeType.Uint16)
    extendAttributeInfo(e.indicesAttribute)

    if (e.attribIndex == undefined) {
        e.attribIndex = {}
    }

    if (attributes != undefined && attributes) {
        e.attributes = attributes.attribBufferInfo
        e.attribIndex = attributes.index
    }

    e.getAttrib = (name) => {
        return e.attributes[e.attribIndex[name]]
    }

    e.setAttrib = (name, data) => {
        //console.log(name, data)
        e.attributes[e.attribIndex[name]].data = data
        e.attributes[e.attribIndex[name]].needsUpdate = true
    }

    e.addAttrib = (attrib) => {
        let found = false
        for (let i = 0; i < e.attributes.length; ++i) {
            if (e.attributes[i].name == attrib.name) {
                found = true
                break;
            }
        }

        if (!found) {
            extendAttributeInfo(attrib)
            e.attributes.push(attrib)

            if (e.attribIndex[attrib.name] == undefined) {
                e.attribIndex[attrib.name] = e.attributes.length-1
            }
        }
    }
}

function sendUniform(uniform) {
    switch (uniform.type) {
        case UniformType.Matrix4: {
            gl.uniformMatrix4fv(uniform.location, gl.FALSE, uniform.value)
        } break;

        case UniformType.Matrix3: {
            gl.uniformMatrix3fv(uniform.location, gl.FALSE, uniform.value)
        } break;

        case UniformType.V4: {
            gl.uniform4fv(uniform.location, uniform.value)
        } break;

        case UniformType.V3: {
            gl.uniform3fv(uniform.location, uniform.value)
        } break;

        case UniformType.V2: {
            gl.uniform2fv(uniform.location, uniform.value)
        } break;

        case UniformType.Float: {
            gl.uniform1f(uniform.location, uniform.value)
        } break;
        
        case UniformType.Int: {
            gl.uniform1i(uniform.location, uniform.value)
        } break;

        default: {
            console.log("UNKNOWN UNIFORM TYPE!")
        }
    }
}

// bindBuffer - skąd gpu ma brać dane
// vertexAttribPointer - jak gpu ma interpretować te dane, jakich bufferów używają dane atrybuty
// when you call vertexAttribPointer it copies current value of buffer to the specified attribute
function sendAttributes(mesh) {
    let attribs = mesh.geometry.attributes

    // indices
    if (mesh.geometry.indicesAttribute != undefined) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.geometry.indicesAttribute["buffer"])
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.geometry.indices), gl.STATIC_DRAW) // TODO array
    }

    //gl.enableVertexAttribArray(0) // todo better performance? why? where should it go?

    // other attributes
    let attrib
    for (let i = 0; i < attribs.length; ++i) {
        attrib = attribs[i]
        if (attrib.needsUpdate) {
            attribs[i].needsUpdate = false

            gl.enableVertexAttribArray(attrib["location"])

            gl.bindBuffer(gl.ARRAY_BUFFER, attrib["buffer"])
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(attrib["data"]), gl.STATIC_DRAW) // TODO ARRAY

            gl.vertexAttribPointer(
                attrib["location"],          // location
                attrib["elementsPerVertex"], // size (elements per vertex)
                gl.FLOAT,                        // type      // TODO parametrize this
                gl.FALSE,                        // normalize // TODO parametrize this
                attrib["stride"],            // stride, number of elements per vertex
                0                                // offset
            )
        }
    }
}

function sendUniforms(mesh) {
    let uniform
    let texUnit = 0
    for (let i = 0; i < mesh.material.uniforms.length; ++i) {
        uniform = mesh.material.uniforms[i]

        if (uniform.type == UniformType.Texture) {
            gl.activeTexture(gl.TEXTURE0 + texUnit)
            gl.bindTexture(gl.TEXTURE_2D, uniform.value)
            gl.uniform1i(uniform.location, texUnit++)
        } else if (uniform.needsUpdate) {
            mesh.material.uniforms[i].needsUpdate = false

            //let func = uniform.set.bind(uniform.location, gl.FALSE, uniform.value)
            //func()
            //uniform.set(uniform.location, gl.FALSE, uniform.value)

            switch (uniform.type) {
                case UniformType.Matrix4: {
                    gl.uniformMatrix4fv(uniform.location, gl.FALSE, uniform.value)
                } break;

                case UniformType.Matrix3: {
                    gl.uniformMatrix3fv(uniform.location, gl.FALSE, uniform.value)
                } break;

                case UniformType.V3: {
                    gl.uniform3fv(uniform.location, uniform.value)
                } break;

                case UniformType.V2: {
                    gl.uniform2fv(uniform.location, uniform.value)
                } break;

                case UniformType.V4: {
                    gl.uniform4fv(uniform.location, uniform.value)
                } break;

                case UniformType.Float: {
                    gl.uniform1f(uniform.location, uniform.value)
                } break;
                
                case UniformType.Int: {
                    gl.uniform1i(uniform.location, uniform.value)
                } break;

                default: {
                    console.log("UNKNOWN UNIFORM TYPE!")
                }
            }
        }
    }
}

function getUniformLocations(mesh, program) {
    for (let i = 0; i < mesh.material.uniforms.length; ++i) {
        let uniform = mesh.material.uniforms[i]
        uniform.location = gl.getUniformLocation(program, uniform.name)
        if (Config.Debug) {
            if (uniform.location == null) {
                console.log("NULL uniform '" + uniform.name + "' location in shader!!!")
            }
        }
    }
}

function getAttributeLocations(mesh, program) {
    for (let i = 0; i < mesh.geometry.attributes.length; ++i) {
        let attrib = mesh.geometry.attributes[i]
        attrib.location = gl.getAttribLocation(program, "a_" + attrib.name)
        if (Config.Debug) {
            if (attrib.location == -1 || attrib.location == null) {
                console.log("NULL attrib '" + attrib.name + "' location in shader!!!")
            }
        }
    }
}