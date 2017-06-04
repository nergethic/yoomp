"use strict";
// DEPENDS ON SHADER, OBJECT(gl) | NEEDS, CAMERA

let gl = null

function initGL(gs) {
    gl = gs.canvas.getContext("webgl",              { antialias: true }) ||
         gs.canvas.getContext("experimental-webgl", { antialias: true }) ||
         gs.canvas.getContext("moz-webgl",          { antialias: true }) ||
         gs.canvas.getContext("webkit-3d",          { antialias: true })

    if (!gl || gl == undefined) {
        alert("Unable to initialize WebGL. Your browser may not support it.") // TODO logger
    }

    let extensions = gl.getSupportedExtensions()
    console.log(extensions)

    gl.enable(gl.SCISSOR_TEST)
    gl.enable(gl.DEPTH_TEST)
    //gl.cullFace(gl.FRONT)
    //gl.enable(gl.CULL_FACE)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND)
    //gl.disable(gl.DEPTH_TEST);
    gl.frontFace(gl.CCW)
    gl.depthFunc(gl.LEQUAL)

    // TODO
    gs.screenResolution = new V2(Config.CanvasWidth, Config.CanvasHeight)

    let viewportOffset = 100//1300
    if (Config.CanvasWidth == 2048) {
        gl.viewport(370, gs.canvas.height-1300, 1300, 1300)
        gl.scissor(370, gs.canvas.height-1300, 1300, 1300)
    } else {
        gl.viewport(43, Config.CanvasHeight-120, 108, gs.canvas.height)
        gl.scissor(43, Config.CanvasHeight-120, 108, gs.canvas.height)
    }
    
    gl.clearColor(1.0, 0.9, 0.7, 1.0)

    gl.enableVertexAttribArray(0) // ???

    // ???
    gl.imageSmoothingEnabled = false
    gl.mozImageSmoothingEnabled = false
    gl.webkitImageSmoothingEnabled = false
    //gl.failIfMajorPerformanceCaveat = true
    //gl.antialias = true
    //console.log(gl.getContextAttributes())
    //

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    return gl
}

function buildShader(gl, shaderSource, typeOfShader) {
    let shader = gl.createShader(typeOfShader)

    gl.shaderSource(shader, shaderSource)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader)) // TODO Logger
        return ReturnCode.Error
    }

    return shader
}

function initShaders(gl, vertexShaderName, fragmentShaderName) {
    let vertexShaderSource, fragmentShaderSource
    vertexShaderSource = document.getElementById(vertexShaderName).text
    fragmentShaderSource = document.getElementById(fragmentShaderName).text

    let shaders = {}
    shaders.vertex = buildShader(gl, vertexShaderSource, gl.VERTEX_SHADER)
    shaders.fragment = buildShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER)

    return shaders
}

function createProgram(gl, vertexShader, fragmentShader) {
    let program = gl.createProgram()

    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        // TODO LOGGER
        console.log("LINKING ERROR!")
        console.log(gl.getProgramInfoLog(program))
        gl.deleteProgram(program)

        return ReturnCode.Error
    }

    if (Config.Debug) {
        gl.validateProgram(program)

        if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
            // TODO LOGGER
            console.log("VALIDATION ERROR!")
            gl.deleteProgram(program)
            return ReturnCode.Error
        }
    }

    return program
}

function Texture(textureInfo) {
    setProperties(this, textureInfo)
}

function createTexture(gs, name) {
    gs.textures[name] = gl.createTexture()

    // gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, gs.textures[name])
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

    // upload image to texture
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        document.getElementById(name)
    )

    gl.bindTexture(gl.TEXTURE_2D, null)
}

// todo renderer.setSize

let _drawCurrentProgram
let _mesh

//CanvasWidth: 216,
//CanvasHeight: 162,

function draw(meshes, camera) {
    for (let i = 0; i < meshes.length; ++i) {
        _mesh = meshes[i]

        // switching programs
        //if (_drawCurrentProgram !== _mesh.material.program) {
            _drawCurrentProgram = _mesh.material.program
            gl.useProgram(_drawCurrentProgram)
            
            getAttributeLocations(_mesh, _drawCurrentProgram)
            getUniformLocations(_mesh, _drawCurrentProgram)

            if (_drawCurrentProgram === gs.pixelProgram || _drawCurrentProgram  === gs.UITextureProgram || _drawCurrentProgram == gs.fontProgram) {
                gl.viewport(0, 0, gs.canvas.width, gs.canvas.height)
                gl.scissor( 0, 0, gs.canvas.width, gs.canvas.height)
            } else {
                let viewportOffset = 100//1300
                gl.viewport(35, 25, 146, 130)
                gl.scissor(35,  25, 146, 130)
            }
        //}

        switch (_drawCurrentProgram) {

            case gs.textureProgram: {
                _mesh.geometry.setAttrib("position", _mesh.geometry.vertices)
                _mesh.geometry.setAttrib("uv", _mesh.geometry.uv)

                _mesh.material.setUniform("view",       camera.viewMatrix)
                _mesh.material.setUniform("projection", camera.projMatrix)
                _mesh.material.setUniform("modelPosition", _mesh.worldMatrix)
            }

            case gs.ballProgram: {
                _mesh.geometry.setAttrib("position", _mesh.geometry.vertices)
                _mesh.geometry.setAttrib("uv", _mesh.geometry.uv)

                _mesh.material.setUniform("view",       camera.viewMatrix)
                _mesh.material.setUniform("projection", camera.projMatrix)
                _mesh.material.setUniform("modelPosition", _mesh.worldMatrix)
            } break;

            case gs.pixelProgram: {
                _mesh.geometry.setAttrib("VertexPos", _mesh.geometry.vertices)
                
                _mesh.material.setUniform("ModelPos", _mesh.worldMatrix)
                _mesh.material.setUniform("color", _mesh.color)
            } break;

            
            case gs.UITextureProgram: {
                _mesh.geometry.setAttrib("VertexPos", _mesh.geometry.vertices)
                _mesh.geometry.setAttrib("uv", _mesh.geometry.uv)

                _mesh.material.setUniform("ModelPos", _mesh.worldMatrix)
            } break;

            case gs.fontProgram: {
                _mesh.material.setUniform("ModelPos", _mesh.worldMatrix)
                _mesh.material.setUniform("time", _mesh.time)

                _mesh.geometry.setAttrib("VertexPos", _mesh.geometry.vertices)
                _mesh.geometry.setAttrib("uv", _mesh.geometry.uv)
            } break;
            

            default: {
                //console.log("DEFAULT CURRENT PROGRAM") // TODO LOGGER
            } break;
        }

        sendAttributes(_mesh)
        sendUniforms(_mesh)

        gl.drawElements(gl.TRIANGLES, _mesh.geometry.indices.length, gl.UNSIGNED_SHORT, 0)
    }
}