'use strict';
// REQUIRES MESH, SHADER, POSITION

let font1 = {
    letterDim:  new V2(8, 8),
    textureDim: new V2(100, 100),
    spacing: 0.75,
    glyphOffsets: {
        'a': new V2(0, 0),
        'b': new V2(8, 0),
        'c': new V2(16, 0),
        'd': new V2(24, 0),
        'e': new V2(32, 0),
        'f': new V2(40, 0),
        'g': new V2(48, 0),
        'h': new V2(56, 0),
        'i': new V2(64, 0),
        'j': new V2(72, 0),
        'k': new V2(80, 0),
        'l': new V2(88, 0),
        'm': new V2(0, 8),
        'n': new V2(8, 8),
        'o': new V2(16, 8),
        'p': new V2(24, 8),
        'q': new V2(32, 8),
        'r': new V2(40, 8),
        's': new V2(48, 8),
        't': new V2(56, 8),
        'u': new V2(64, 8),
        'v': new V2(72, 8),
        'w': new V2(80, 8),
        'x': new V2(88, 8),
        'y': new V2(0, 16),
        'z': new V2(8, 16),
        '0': new V2(16, 16),
        '1': new V2(24, 16),
        '2': new V2(32, 16),
        '3': new V2(40, 16),
        '4': new V2(48, 16),
        '5': new V2(56, 16),
        '6': new V2(64, 16),
        '7': new V2(72, 16),
        '8': new V2(80, 16),
        '9': new V2(88, 16),
        ':': new V2(0, 24),
        '!': new V2(8, 24),
        ' ': new V2(1000, 1000)
    }
}

// TODO attibs stay from container, merging does nothing to them
function Text(fontInfo, length, size) {
    let letterWidth  = fontInfo.letterDim.x
    let letterHeight = fontInfo.letterDim.y

    let leftX = 0

    let text = ""

    let textContainer = new Entity({
        geometry: new Geometry({
            attributes: new Attributes([
                new Attribute("VertexPos", 3, new Float32Array(), AttributeType.Float32),
                new Attribute("uv", 2, new Float32Array(), AttributeType.Float32)
            ]),
            type: GeometryType.Empty
        }),
        material: new Material({
            type: "texture",
            program: gs.fontProgram,
            uniforms: new Uniforms([
                new Uniform("ModelPos", new Float32Array(16), UniformType.Matrix4),
                new Uniform("ScreenResolution", new Float32Array(2), UniformType.V2),
                new Uniform("texture", gs.textures.font, UniformType.Texture),
                new Uniform("color", new Float32Array(4), UniformType.V4),
                new Uniform("time", 0.0, UniformType.Float)
            ])
        }),
        font: fontInfo,
        text: "",
        length: length,
        size: size,
        time: 0.0,
        type: EntityType.Text
    })

    textContainer.material.setUniform("time", 0.0)
    textContainer.material.setUniform("color", [0.7, 0.7, 0.7, 1.0])

    let letterGeometry = new Geometry({
        origin: Origin.Corner,
        width:  letterWidth * size,
        height: letterHeight * size,
        attributes: new Attributes([]),
        type: GeometryType.Plane
    })

    let letterMaterial = new Material({
        type: "texture",
        program: gs.fontProgram,
        uniforms: new Uniforms([])
    })

    let letterBlueprint = new Entity({
        geometry: letterGeometry,
        material: letterMaterial,
        type: EntityType.Text // TODO
    })

    for (let i = 0; i < textContainer.length; ++i) {

        let letter = cloneMesh(letterBlueprint)
        letter.position.x = leftX
        mergeMesh(textContainer, letter)

        text += " "
        leftX += letterWidth + fontInfo.spacing
    }

    textContainer.text = text
    textContainer.geometry.uv = new Float32Array(textContainer.length * 8) // letters * 4 rect verices * 2 u,v
    textContainer.material.setUniform("ScreenResolution", gs.screenResolution.toArray())

    return textContainer
}

let _generateFontUV = new Array(4) // [ux, uy, vx, vy]
function updateText(textEntity, newText) {

    if (newText.length > textEntity.length) {
        newText = newText.substr(0, textEntity.length)
    }

    let fontInfo = textEntity.font
    let uv = textEntity.geometry.uv

    let maxX = fontInfo.textureDim.x
    let maxY = fontInfo.textureDim.y

    let offset = 0

    if (newText.length < textEntity.length) {
        for (let i = newText.length; i < textEntity.length; ++i) {
            newText += " "
        }
    }

    for (let i = 0; i < newText.length; ++i) {
        
        if (newText[i] != textEntity.text[i]) {
            if (newText[i] == " ") {

                _generateFontUV[0] = 100.0
                _generateFontUV[1] = 100.0

                _generateFontUV[3] = 100.0
                _generateFontUV[4] = 100.0
            } else {

                let glyphTextureOffset = fontInfo.glyphOffsets[newText[i]]

                _generateFontUV[0] =  glyphTextureOffset.x / maxX                             // left
                _generateFontUV[1] = (glyphTextureOffset.x + fontInfo.letterDim.x - 1) / maxX // right

                _generateFontUV[3] =  glyphTextureOffset.y / maxY                             // top
                _generateFontUV[4] = (glyphTextureOffset.y + fontInfo.letterDim.y - 1) / maxY // bottom
            }

            // left down
            uv[offset + 0] = _generateFontUV[0]
            uv[offset + 1] = _generateFontUV[4]

            // left top
            uv[offset + 2] = _generateFontUV[0]
            uv[offset + 3] = _generateFontUV[3]

            // right top
            uv[offset + 4] = _generateFontUV[1]
            uv[offset + 5] = _generateFontUV[3]

            // right down
            uv[offset + 6] = _generateFontUV[1]
            uv[offset + 7] = _generateFontUV[4]
        }

        offset += 8
    }

    textEntity.text = newText
}