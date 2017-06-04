"use strict";

function generateLevelMesh(gs) {
    let tubeBlueprints = []

    for (let i = 0; i < 8; ++i) { // todo
        if (i % 2 == 0)
            tubeBlueprints[i] = new Geometry({
                radius: gs.tileWidth,
                depth: gs.tileWidth,
                outerSegments: 8,
                innerSegments: 8,
                n: i+1,
                attributes: gs.textureAttributes,
                type: GeometryType.TubeFragment
            })
        else
            tubeBlueprints[i] = new Geometry({
                radius: gs.tileWidth,
                depth: gs.tileWidth,
                outerSegments: 8,
                innerSegments: 8,
                n: i+1,
                attributes: gs.textureAttributes,
                type: GeometryType.TubeFragment
            })
    }

    let id = 0
    for (let i = 0; i < (level1.length/8); ++i) {
        for (let j = 7; j >= 0; --j) {
            let type = level1[id]

            let entity
            let entityGeometry = clone(tubeBlueprints[j])
            //let entityGeometry = new createTubeGeometry(100.0, 100.0, 8) // 100.0, 100.0, 8
            
            switch (type) {
                //case EntityType.Empty: { // long
                    
                //} break;

                default: {
                    entity = new Entity({
                        geometry: entityGeometry,
                        material: gs.textureMaterial,
                        type: type})
                } break;
            }

            entity.id = id
            setPosition(entity, 0.0, 100.0, i*100.0 + 500)

            gs.entities[id] = entity
            mergeMesh(gs.tileContainer, entity)
            //addMeshToScreen(gs.scene, entity)
            //console.log(entity.geometry.uv)
            
            id++
        }
    }

    gs.tileContainer.material.colorData = []
    setPosition(gs.tileContainer, 0.0, 0.0, 0.0)
    addMeshToScreen(gs.scene, gs.tileContainer)
}

function reloadLevel(gs) {
    console.log("reload")
    gs.tileContainer = new Entity({
        geometry: new Geometry({
            attributes: gs.textureAttributes,
            type: GeometryType.Empty
        }),
        material: gs.textureMaterial,
        type:     EntityType.Object
    })

    gs.scene.meshes = []
    for (let i = 0; i < gs.scene.meshes.length; ++i) {
        console.log(gs.scene.meshes[i].type)
        if (gs.scene.meshes[i].type == EntityType.Object) {
            gs.scene.meshes.splice(i, 1)
        }
    }
    generateLevelMesh(gs)
}

function startGame(gs) {
    generateHTML(gs)
    updateProportions(gs)

    window.onkeydown = handleKeyDown
    window.onkeyup = handleKeyUp

    initGL(gs)
    if (!gl) return ReturnCode.Error // TODO logger

    let screenResolution = new Float32Array(2)
    screenResolution[0] = gs.screenResolution.x
    screenResolution[1] = gs.screenResolution.y
    console.log("res:" + screenResolution)

    // INIT
    let scene = new Screen(ScreenType.Game)
    gs.screens[ScreenType.Game] = scene

    gs.scene = scene
    gs.camera = camera
    
    // INIT SHADERS
    let ballShader      = initShaders(gl, "vertex-shader-ball",         "fragment-shader-ball")
    let textureShader   = initShaders(gl, "vertex-shader-texture",      "fragment-shader-texture")
    let pixelShader     = initShaders(gl, "vertex-shader-pixel",        "fragment-shader-pixel")
    let UITextureShader = initShaders(gl, "vertex-shader-ui-texture",   "fragment-shader-ui-texture")
    let fontShader      = initShaders(gl, "vertex-shader-font",         "fragment-shader-font")
    
    // COMPILE PROGRAMS
    gs.ballProgram      = createProgram(gl, ballShader.vertex,      ballShader.fragment)
    gs.pixelProgram     = createProgram(gl, pixelShader.vertex,     pixelShader.fragment)
    gs.UITextureProgram = createProgram(gl, UITextureShader.vertex, UITextureShader.fragment)
    gs.textureProgram   = createProgram(gl, textureShader.vertex,   textureShader.fragment)
    gs.fontProgram      = createProgram(gl, fontShader.vertex,      fontShader.fragment)

    // LOAD TEXTURES
    createTexture(gs, "textureAtlas")
    createTexture(gs, "bgBlue")
    createTexture(gs, "circle")
    createTexture(gs, "water")
    createTexture(gs, "font")
    createTexture(gs, "bg1")


    // ------------------
    // CREATE MATERIALS:
    // ------------------

    let textureUniforms = new Uniforms([
        new Uniform("modelPosition", new Float32Array(16), UniformType.Matrix4),
        new Uniform("view",          new Float32Array(16), UniformType.Matrix4),
        new Uniform("projection",    new Float32Array(16), UniformType.Matrix4),
        new Uniform("lightColor", gs.currentComputedColorPalette.light, UniformType.V4),
        new Uniform("mediumColor", gs.currentComputedColorPalette.medium, UniformType.V4),
        new Uniform("darkColor", gs.currentComputedColorPalette.dark, UniformType.V4),
        //new Uniform("time", 0.0, UniformType.Float),
        new Uniform("texture", gs.textures.textureAtlas, UniformType.Texture),
    ])

    let textureAttributes = new Attributes([
        new Attribute("position", 3, new Float32Array(), AttributeType.Float32),
        new Attribute("uv", 2, new Float32Array(), AttributeType.Float32)
        // todo add normals
    ])
    gs.textureAttributes = textureAttributes

    // STANDARD TEXTURE
    let textureMaterial = new Material({
        type: "texture",
        program: gs.textureProgram,
        uniforms: textureUniforms
    })
    gs.textureMaterial = textureMaterial

    // SOLID UI RECT
    let solidUIElementMaterial = new Material({
        type: "texture",
        program: gs.pixelProgram,
        uniforms: new Uniforms([
            new Uniform("ModelPos", new Float32Array(16), UniformType.Matrix4),
            new Uniform("color", new Float32Array(3), UniformType.V3),
            new Uniform("ScreenResolution", new Float32Array(2), UniformType.V2)
        ])
    })
    solidUIElementMaterial.setUniform("ScreenResolution", gs.screenResolution.toArray())

    // TEXTURED UI RECT
    let textureUIElementMaterial = new Material({
        type: "texture",
        program: gs.UITextureProgram,
        uniforms: new Uniforms([
            new Uniform("ModelPos", new Float32Array(16), UniformType.Matrix4),
            new Uniform("ScreenResolution", new Float32Array(2), UniformType.V2),
            new Uniform("texture", gs.textures.bg1, UniformType.Texture)
        ])
    })
    textureUIElementMaterial.setUniform("ScreenResolution", gs.screenResolution.toArray())

    // BALL
    let ballMaterial = new Material({
        type: "texture",
        program: gs.ballProgram,
        uniforms: new Uniforms([
            //new Uniform("color", new Float32Array(), UniformType.V3),
            new Uniform("modelPosition", new Float32Array(16), UniformType.Matrix4),
            new Uniform("texture", gs.textures.bgBlue, UniformType.Texture),
            new Uniform("view",          new Float32Array(16), UniformType.Matrix4),
            new Uniform("projection",    new Float32Array(16), UniformType.Matrix4)
        ])
    })


    // ------------------
    //  CREATE GEOMETRY:
    // ------------------

    // UI RECT
    // TEXTURE UI TODO - move attribs to material???
    let textureUIElementGeometry = new Geometry({
        width: gs.screenResolution.x,
        height: 170,
        attributes: new Attributes([
            new Attribute("VertexPos", 3, new Float32Array(), AttributeType.Float32),
            new Attribute("uv", 2, new Float32Array(), AttributeType.Float32)
        ]),
        origin: Origin.Corner, // Corner
        type: GeometryType.Plane
    })

    // BALL
    let ballGeometry = new Geometry({
        radius: 14,
        verticalSegments: 8,
        horizontalSegments: 8,
        attributes: new Attributes([
            new Attribute("position", 3, new Float32Array(), AttributeType.Float32),
            new Attribute("uv", 2, new Float32Array(), AttributeType.Float32)
        ]),
        type: GeometryType.Sphere
    })


    // ------------------
    // CREATE ENTITIES:
    // ------------------

    let hudPos = new V3(35, -137, 0.0)

    let textureUIElement = new Entity({
        geometry: textureUIElementGeometry,
        material: textureUIElementMaterial,
        type:     EntityType.Texture
    })

    // BALL
    let ball = new Entity({
        geometry: ballGeometry,
        material: ballMaterial,
        type:     EntityType.Ball
    })
    ball.position.z = scene.origin.z + gs.tileWidth
    updatePosition(ball)

    gs.camera.fov = 75.0
    initCamera(gs.camera, 0.0, 100.0, ball.position.z - 300.0)

    gs.entities = new Array(level1.length)

    let tileContainer = new Entity({
        geometry: new Geometry({
            attributes: textureAttributes,
            type: GeometryType.Empty
        }),
        material: textureMaterial,
        type:     EntityType.Object
    })
    gs.tileContainer = tileContainer

    // BACKGROUND CIRCLE TEXTURE
    let bgTextureGeometry = new Geometry({
        width: 2.0,
        height: 2.0,
        attributes: textureAttributes,
        type: GeometryType.Plane
    })


    // ------------------
    // CREATE SCREENS:
    // ------------------

    // MAIN MENU
    let mainMenuScreen = new Screen(ScreenType.MainMenu)
    gs.screens[mainMenuScreen.type] = mainMenuScreen

    let mainMenuTexts = [
        new Text(font1, 20, 0.9), // level:
        new Text(font1, 20, 0.9), // level nr
        new Text(font1, 20, 0.9),
        new Text(font1, 20, 0.9),
        new Text(font1, 20, 0.9)
    ]

    updateText(mainMenuTexts[0], "level:")
    setPosition(mainMenuTexts[0], 50.0, -92.0, 0.0)

    updateText(mainMenuTexts[1], "0")
    setPosition(mainMenuTexts[1], 120.0, -92.0, 0.0)
 
    updateText(mainMenuTexts[2], "name")
    setPosition(mainMenuTexts[2], 70.0, -102.0, 0.0)

    updateText(mainMenuTexts[3], "music volume")
    setPosition(mainMenuTexts[3], 50.0, -112.0, 0.0)

    updateText(mainMenuTexts[4], "fx volume")
    setPosition(mainMenuTexts[4], 50.0, -122.0, 0.0)

    addMeshToScreen(mainMenuScreen, textureUIElement)

    for (let i = 0; i < mainMenuTexts.length; ++i) {
        addMeshToScreen(mainMenuScreen, mainMenuTexts[i])
    }

    //let menuBall = cloneMesh(ball)
    //addMeshToScreen(mainMenuScreen, menuBall)

    // LEVEL INFO
    let levelInfoScreen = new Screen(ScreenType.LevelInfo)
    gs.screens[levelInfoScreen.type] = levelInfoScreen

    let levelInfoTexts = [
        new Text(font1, 10, 1), // level: x
        new Text(font1, 10, 1), // level name
        new Text(font1, 10, 1), // code
        new Text(font1, 10, 1), // x lives left
        new Text(font1, 10, 1), // press fire
        new Text(font1, 10, 1)  // to yoomp
    ]

    updateText(levelInfoTexts[0], "level: name")
    setPosition(levelInfoTexts[3], 70.0, -122.0, 0.0)

    updateText(levelInfoTexts[1], "x lives left")
    setPosition(levelInfoTexts[3], 70.0, -122.0, 0.0)

    updateText(levelInfoTexts[2], "code")
    setPosition(levelInfoTexts[3], 70.0, -122.0, 0.0)

    updateText(levelInfoTexts[3], "aaaaa")
    setPosition(levelInfoTexts[3], 70.0, -122.0, 0.0)

    updateText(levelInfoTexts[4], "press fire")
    setPosition(levelInfoTexts[3], 70.0, -122.0, 0.0)

    updateText(levelInfoTexts[5], "to yoomp")
    setPosition(levelInfoTexts[3], 70.0, -122.0, 0.0)

    addMeshToScreen(levelInfoScreen, levelInfoTexts[0])
    addMeshToScreen(levelInfoScreen, levelInfoTexts[1])
    addMeshToScreen(levelInfoScreen, levelInfoTexts[2])
    addMeshToScreen(levelInfoScreen, levelInfoTexts[3])
    addMeshToScreen(levelInfoScreen, levelInfoTexts[4])
    addMeshToScreen(levelInfoScreen, levelInfoTexts[5])

    // LEVEL FINISH
    let levelFinishScreen = new Screen(ScreenType.LevelFinish)
    gs.screens[levelFinishScreen.type] = levelFinishScreen

    // GAME OVER
    let gameOverScreen = new Screen(ScreenType.GameOver)
    gs.screens[gameOverScreen.type] = gameOverScreen

    let youDiedText = new Text(font1, 30, 1)
    updateText(youDiedText, "you died!")

    addMeshToScreen(gameOverScreen, youDiedText)

    // GAME SCREEN
    let livesCountText = new Text(font1, 30, 0.7)
    updateText(livesCountText, "lives:" + gs.lifeCount)
    livesCountText.position = hudPos.clone()
    livesCountText.position.x -= 22
    livesCountText.position.y -= 3

    let scoreText = new Text(font1, 30, 0.7)
    updateText(scoreText, "00000")
    scoreText.position = hudPos.clone()
    scoreText.position.x += 53
    scoreText.position.y -= 3

    let jumpCountText = new Text(font1, 30, 0.7)
    updateText(jumpCountText, "jumps:" + gs.jumpCount)
    jumpCountText.position = hudPos.clone()
    jumpCountText.position.x += 110
    jumpCountText.position.y -= 3

    let levelProgressBar = new Entity({
        geometry: new Geometry({
        width: 146,
        height: 1,
        attributes: new Attributes([
            new Attribute("VertexPos", 3, new Float32Array(), AttributeType.Float32)
        ]),
        origin: Origin.Corner, // Corner
        type: GeometryType.Plane
    }),
        material: solidUIElementMaterial,
        type:     EntityType.UIElement
    })
    levelProgressBar.color = [0.596, 0.525, 0.0]
    levelProgressBar.position = hudPos.clone()
    levelProgressBar.position.y -= 15

    let levelProgressBarBg = new Entity({
        geometry: new Geometry({
        width: 146,
        height: 1,
        attributes: new Attributes([
            new Attribute("VertexPos", 3, new Float32Array(), AttributeType.Float32)
        ]),
        origin: Origin.Corner, // Corner
        type: GeometryType.Plane
    }),
        material: solidUIElementMaterial,
        type:     EntityType.UIElement
    })
    levelProgressBarBg.position = levelProgressBar.position.clone()
    levelProgressBarBg.color = [0.337, 0.262, 0.0]

    let levelProgressBarMarker = new Entity({
        geometry: new Geometry({
        width: 2,
        height: 1,
        attributes: new Attributes([
            new Attribute("VertexPos", 3, new Float32Array(), AttributeType.Float32)
        ]),
        origin: Origin.Corner, // Corner
        type: GeometryType.Plane
    }),
        material: solidUIElementMaterial,
        type:     EntityType.UIElement
    })
    levelProgressBarMarker.position = levelProgressBar.position.clone()
    levelProgressBarMarker.color = [0.894, 0.819, 0.215]

    addMeshToScreen(scene, levelProgressBarBg)
    addMeshToScreen(scene, levelProgressBar)
    addMeshToScreen(scene, levelProgressBarMarker)
    addMeshToScreen(scene, livesCountText)
    addMeshToScreen(scene, scoreText)
    addMeshToScreen(scene, jumpCountText)

    addMeshToScreen(scene, ball) // NOTE: if there is no ball, the camera is not moving and you can't see the tunnel!

    generateLevelMesh(gs)
    // reloadLevel()


    // INIT VARIABLES
    let dt = 0
    let acceleration = new V3(0.0, 0.0, 0.0)
    let timeInSeconds
    let lastTimeInSeconds = performance.now() * 0.001
    let frames = 0

    let hz  = Config.MainSoundBPM / 60.0

    let jumpDirNormalized = new V3(ball.position.x, 100.0, ball.position.z).sub(ball.position).normalize()
    let jumpHeight = 50.0
    //let jumpSpeed = 1/hz // sec
    let tempPos = new V3(0.0, 0.0, 0.0)

    let acc = new V3(0.0, 0.0, 0.0)
    let vel = new V3(0.0, 0.0, 0.0)
    let gravity = new V3(0.0, -1000.0, 0.0)

    let ang = PI*1.5 + 0.05
    let lastTab = false

    let intro = 0
    let timer = new Timer(hz, 10.0)
    let jumpTimer = new Timer(hz, 1.0)
    jumpTimer.pause = true
    let flyTimer = new Timer(hz, 0.0) // NOTE: timeToTick is defined later
    flyTimer.pause = true
    let shifterTimer = new Timer(hz, 1.0)
    shifterTimer.pause = true
    let lastJumpSign = true
    let currentJumpSign = true
    let requestedAudio = []
    let fall = false
    let mapToTunnelSpace = false
    let updateCameraMovement = false

    let absTilePos = new V3(6, 0, -5)
    let relTilePos = new V2(0.0, 0.0)

    let mainMenuIndex = 0
    let keyUpWasReleased = true
    let keyDownWasReleased = true

    gs.currentLevel = level1
    gs.longJumpRequested = false
    gs.longJumpActive = false
    gs.groundTouchCounter = 0
    gs.superJumpRequested = false
    gs.currentScreen = gs.screens[ScreenType.MainMenu]

    let collision = false
    let maxDt = 0.0

    initAudio(gs)
    let clock = new Clock()

    // main menu screen
    let textSelectTimer = new Timer(20, 1.0)
    let selectedText = mainMenuTexts[0]

    // game over screen
    let gameOverTimer = new Timer(hz/2.0, 1.0)

    // GAME LOOP
    function step() {
        requestAnimationFrame(step)

        dt = clock.getDt()

        if (dt > maxDt) {
            maxDt = dt
            log(gs, "max dt:", maxDt)
        }

        if (dt > 0.15) {
            dt = 0.15
            // HARDCORE TODO: back one tile, sync music by using delta??
            //currentTile.position
            //gs.audio.main.currentTime = 0.0
        }

        switch (gs.currentScreen.type) {

            case ScreenType.Game: {
                // updateGame()
                // TIME
                timer.advance(dt)
                jumpTimer.advance(dt)
                flyTimer.advance(dt)
                shifterTimer.advance(dt)

                // INPUT
                let val = 6
                if (Input.keyLeft.pressed) {
                    ang -= 0.7854 * dt*hz
                    if (ang < 0.0) ang = 6.283185 - ang
                    mapToTunnelSpace = true
                }

                if (Input.keyRight.pressed) {
                    ang += 0.7854 * dt*hz
                    if (ang > 6.283185) ang -= 6.283185
                    mapToTunnelSpace = true
                }

                if (Input.keyUp.pressed) {
                }

                if (Input.keyDown.pressed) {
                }

                if (Input.keyW.pressed) {
                    acceleration.y -= val
                    updateCameraMovement = true
                }

                if (Input.keyS.pressed) {
                    acceleration.y += val
                    updateCameraMovement = true
                }

                if (Input.keyA.pressed) {
                    acceleration.x -= val
                    updateCameraMovement = true
                }

                if (Input.keyD.pressed) {
                    acceleration.x += val
                    updateCameraMovement = true
                }

                if (Input.keyQ.pressed) {
                    acceleration.z += val
                    updateCameraMovement = true
                }

                if (Input.keyE.pressed) {
                    acceleration.z -= val
                    updateCameraMovement = true
                }

                if (Input.keySpacebar.pressed) {
                    if (!gs.longJumpRequested && !gs.longJumpActive && !gs.superJumpRequested) {
                        gs.longJumpRequested = true
                        
                        gs.groundTouchCounter = 0
                    }
                }

                if (!lastTab && Input.keyTab.pressed) {
                }

                lastTab = Input.keyTab.pressed

                if (!gs.pauseCameraMovement) { // TODO
                    if (Config.Debug) {
                        let maxCameraDistance = (getLevelLength(gs, gs.currentLevel)+2)*gs.tileWidth
                        if (gs.camera.position.z <= -maxCameraDistance) {
                            ball.position.z = 0.0
                            jumpTimer.reset()
                            flyTimer.reset()
                        }
                    }

                    let distanceFromCamera = 300
                    let boxHalf = 20.0/2.0
                    let tileHalf = gs.tileWidth/2.0

                    setCameraPosition(camera, 0.0, gs.camera.position.y, -ball.position.z + gs.tileWidth*2.5)

                    absTilePos.z = Math.ceil((ball.position.z / gs.tileWidth) - 0.5) - 5 // TODO function -5 for relative to tunnel
                    //console.log(absTilePos.z)
                   // updateRelTilePos(relTilePos, ball.position, ang, tileAng)
                   relTilePos.x = (ang - absTilePos.x*tileAng) / tileAng
                    console.log(tileAng)
                }
                
                // INPUT LOGIC
                if (updateCameraMovement) {
                    updateCameraMovement = false
                    moveCamera(gs.camera, acceleration.x, -acceleration.y, acceleration.z)
                    
                    ball.position.z = -gs.camera.position.z + 300.0
                    ball.needsUpdate = true

                    absTilePos.z = Math.ceil((ball.position.z / gs.tileWidth) - 0.5) - 5

                    log(gs, "Z: ", absTilePos.z)

                    acceleration.x = 0.0
                    acceleration.y = 0.0
                    acceleration.z = 0.0
                }

                if (true) { // mapToTunnelSpace // TODO
                    mapToTunnelSpace = false

                    function mapCoordsToTunnelTileSpace(val) {
                        if (val < 0) val = 7
                        else if (val > 7) val = 0

                        return val
                    }

                    let toLeft = angles[mapCoordsToTunnelTileSpace(absTilePos.x - 1)]
                    let toRight = angles[absTilePos.x]
                    
                    if (absTilePos.x == 7) { // TODO simplify it!
                        if (ball.position.y > 100.0) { // right
                            absTilePos.x = 0 // mapCoordsToTunnelTileSpace(absTilePos.x + 1)
                        } else if ((ang < toLeft) && (ball.position.y < 100.0)) {
                            absTilePos.x = mapCoordsToTunnelTileSpace(absTilePos.x - 1)
                        }
                    } else if (absTilePos.x == 0) {
                        if (ball.position.y < 100.0) { // left
                            absTilePos.x = mapCoordsToTunnelTileSpace(absTilePos.x - 1)
                        } else if (ang > toRight && (ball.position.y > 100.0)) {
                            absTilePos.x = mapCoordsToTunnelTileSpace(absTilePos.x + 1)
                        }
                    } else {
                        if (ang < toLeft) {
                            absTilePos.x = mapCoordsToTunnelTileSpace(absTilePos.x - 1)
                        } else if (ang > toRight) {
                            absTilePos.x = mapCoordsToTunnelTileSpace(absTilePos.x + 1)
                        }
                    }

                    { // update position and jump direction based on a new angle
                        ball.position.x = Math.Cos(ang) * 100.0
                        ball.position.y = 100.0 + Math.Sin(ang) * 100.0
                        ball.needsUpdate = true

                        relTilePos.x = (ang - absTilePos.x*tileAng) / tileAng
                        log(gs, "c:", relTilePos.x)

                        jumpDirNormalized = new V3(0.0, 100.0, ball.position.z).sub(ball.position).normalize()
                        tempPos = new V3(ball.position.x, ball.position.y, 0.0)
                    }

                    log(gs, "X: ", absTilePos.x)
                }

                // TIMER LOGIC
                flyTimer.ifTick(() => {
                    gs.longJumpRequested = false
                    gs.longJumpActive = false
                    gs.superJumpRequested = false
                    gs.groundTouchCounter = 0
                }, gs.longJumpActive)

                jumpTimer.ifTick(() => {
                    collision = true
                }, !gs.longJumpActive)

                timer.ifTick(() => {
                    intro++
                    if (intro > 4) intro = 0
                }, !gs.longJumpActive)

                // COLLISION LOGIC
                let tileX = (absTilePos.x + 2) % 8
                let steppedTileIndex = absTilePos.z*8 + tileX
                if ((absTilePos.z >= 0) && (absTilePos.z < gs.entities.length/8)) { // ball is in tunnel TODO: eventually remove it? or only on debug
                    log(gs, "Z: ", absTilePos.z)

                    let e = gs.entities[steppedTileIndex]

                    if (collision) { // && !e.stepped // TODOOOO!!! only on debug
                        collision = false
                        fall = false
                        gs.groundTouchCounter++
                        relTilePos.y = 0.5

                        for (let i = 0; i < e.deathArea.length; ++i) {
                            if (isInsideRect(relTilePos, e.deathArea[i])) {
                                fall = true
                            }
                        }

                        if (fall) {
                            gs.currentScreen = gs.screens[ScreenType.GameOver]
                        }
                        log(gs, "fall: ", fall)
                        log(gs, "tileId: ", e.type)
                        //changeMaterial(tileContainer, redMaterial)

                        // audio
                        if (gs.superJumpRequested) {
                            requestedAudio.push("superjump")
                        } else if (gs.longJumpRequested) {
                            requestedAudio.push("longjump")
                        } else {

                            if (e.sound) {
                                requestedAudio.push(e.sound)
                            } else {
                                requestedAudio.push("jump")
                            }
                        }

                        if (Config.Bananas) {
                            if (gs.currentLevelColorPalette == ColorPalette.blue) {
                                gs.currentLevelColorPalette = ColorPalette.green
                            } else {
                                gs.currentLevelColorPalette = ColorPalette.blue
                            }
                        }

                        gs.currentComputedColorPalette = gs.currentLevelColorPalette

                        let tileName = ""
                        switch (gs.entities[steppedTileIndex].type) {
                            case EntityType.Empty: {
                                tileName = "empty"
                            } break;

                            case EntityType.FloorTile1: {
                                tileName = "floor1"
                                gs.score += 50
                            } break;

                            case EntityType.FloorTile2: {
                                tileName = "floor2"
                                gs.score += 50
                            } break;

                            case EntityType.SmallHole: {
                                tileName = "small hole"
                            } break;

                            case EntityType.BigHole: {
                                tileName = "big hole"
                            } break;

                            case EntityType.Savepoint: {
                                tileName = "savepoint"
                                gs.savePointPosition = absTilePos.clone()
                            } break;

                            case EntityType.LongJump: {
                                tileName = "long jump"
                                if (gs.longJumpRequested == true) {
                                    gs.superJumpRequested = true
                                    requestedAudio.push("superjump")
                                } else {
                                    gs.longJumpRequested = true
                                    requestedAudio.push("longjump")
                                }
                                gs.groundTouchCounter++
                            } break;

                            case EntityType.ExtraLife: {
                                tileName = "extra life"
                            } break;

                            case EntityType.ExtraJump: {
                                tileName = "extra jump"
                            } break;

                            case EntityType.Shifter: {
                                tileName = "shifter"
                                if (relTilePos.x < 0.5) {
                                    gs.shifterLeft  = true
                                } else {
                                    gs.shifterRight = true
                                }
                                //shifterTimer.time = 0.0
                            } break;

                            case EntityType.Teleport: {
                                tileName = "teleport"
                                ang += PI
                                if (ang > 6.283185) ang -= 6.283185
                                mapToTunnelSpace = true
                            } break;

                            case EntityType.TunnelStart: {
                                tileName = "tunnel start"
                                gs.pauseBallMovement = true
                            } break;

                            case EntityType.TunnelStop: {
                                tileName = "tunnel stop"
                                gs.pauseBallMovement = false
                            } break;

                            case EntityType.BrightnessPlus: {
                                tileName = "brightness plus"
                                
                                if (gs.brightnessLevel <= 4) {
                                    gs.brightnessLevel++                            
                                    let val = gs.brightnessLevel * 0.19
                                    let dest

                                    if (gs.brightnessLevel > 0) {
                                        dest = Colors.White
                                    } else {
                                        val = -val
                                        dest = Colors.Black
                                    }

                                    gs.currentComputedColorPalette.light  = lerpRGBA(ColorPalette.green.light,  dest, val)
                                    gs.currentComputedColorPalette.medium = lerpRGBA(ColorPalette.green.medium, dest, val)
                                    gs.currentComputedColorPalette.dark   = lerpRGBA(ColorPalette.green.dark,   dest, val)

                                    textureMaterial.setUniform("lightColor", gs.currentComputedColorPalette.light)
                                    textureMaterial.setUniform("mediumColor", gs.currentComputedColorPalette.medium)
                                    textureMaterial.setUniform("darkColor", gs.currentComputedColorPalette.dark)
                                }
                                
                            } break;

                            case EntityType.BrightnessMinus: {
                                tileName = "brightness minus"

                                
                                if (gs.brightnessLevel >= -4) {
                                    gs.brightnessLevel--
                                    let val = gs.brightnessLevel * 0.19
                                    let dest

                                    if (gs.brightnessLevel > 0) {
                                        dest = Colors.White
                                    } else {
                                        val = -val
                                        dest = Colors.Black
                                    }

                                    gs.currentComputedColorPalette.light  = lerpRGBA(gs.currentLevelColorPalette.light,  dest, val)
                                    gs.currentComputedColorPalette.medium = lerpRGBA(gs.currentLevelColorPalette.medium, dest, val)
                                    gs.currentComputedColorPalette.dark   = lerpRGBA(gs.currentLevelColorPalette.dark,   dest, val)

                                    textureMaterial.setUniform("lightColor", gs.currentComputedColorPalette.light)
                                    textureMaterial.setUniform("mediumColor", gs.currentComputedColorPalette.medium)
                                    textureMaterial.setUniform("darkColor", gs.currentComputedColorPalette.dark)
                                }
                                                       
                            } break;

                            case EntityType.Lightning: {
                                tileName = "lightning"
                                gs.brightnessLevel = 0
                            } break;

                            case EntityType.Earthquake: {
                                tileName = "earthquake"
                            } break;

                            case EntityType.NextLevel: {
                                tileName = "next level"
                            } break;
                        }

                        log(gs, "tile: ", tileName)
                        gs.entities[steppedTileIndex].stepped = true
                    } else { // NO GROUND COLLISION
                        let signTest = Math.Cos(PI * jumpTimer.time) // rate of change (derivative) of jump (sin' => cos)
                        if (signTest < 0.0)
                            currentJumpSign = true
                        else
                            currentJumpSign = false

                        if ((lastJumpSign != currentJumpSign) && (signTest < 0.0)) { // max top
                            if (gs.longJumpRequested && gs.groundTouchCounter > 0) {
                                gs.longJumpActive = true
                                gs.groundTouchCounter = 0
                            }
                        }

                        lastJumpSign = currentJumpSign
                    }
                }

                // TODO is this good place?
                if (gs.superJumpRequested) {
                    flyTimer.timeToTick = 2.0
                } else if (gs.longJumpRequested) {
                    shifterTimer.timeToTick = 2.0
                    flyTimer.timeToTick = 1.0
                } else { // normal jump
                    flyTimer.timeToTick = 1.0
                    shifterTimer.timeToTick = 1.0
                }

                // AUDIO
                if (!gs.muteAudio && requestedAudio.length) {
                    for (let i = 0; i < requestedAudio.length; ++i) {
                        playSound(requestedAudio.pop())
                    }
                }

                if (gs.shifterLeft) { // TODO move it to entity handling
                    ang -= 0.7854*dt * hz
                    if (ang < 0.0) ang = 6.283185 - ang
                    mapToTunnelSpace = true
                }

                if (gs.shifterRight) {
                    ang += 0.7854*dt * hz
                    if (ang > 6.283185) ang -= 6.283185
                    mapToTunnelSpace = true
                }
            
                shifterTimer.ifTick(() => {
                    gs.shifterLeft  = false
                    gs.shifterRight = false
                }, gs.shifterLeft || gs.shifterRight) // continue condition


                // ENTITY LOOP
                for (let i = 0; i < gs.currentScreen.meshes.length; ++i) {
                    let entity = scene.meshes[i]
                    let geo = entity.geometry
                    let meshMatrix = entity.worldMatrix

                    // ENTITY LOGIC
                    if (entity.type == EntityType.Ball) {
                        //entity.position.y = entity.position.y + Math.Sin(angle) * 5
                        //entity.position.z = gs.camera

                    // mat4.rotate(meshMatrix, meshMatrix, TAU*dt, [jumpDirNormalized.y, 0, -jumpDirNormalized.x])

                        entity.position = jump(entity.position, jumpDirNormalized, jumpHeight, jumpTimer.time)
                        entity.position = entity.position.add(tempPos)

                        if (!gs.pauseBallMovement) {
                            entity.position.z += gs.tileWidth*hz*dt
                        }

                        if (entity.position.z > 500.0) { // todo
                            changePlaneWidth(levelProgressBar, lerp(0.0, 146.0, (entity.position.z - 500.0)/((gs.currentLevel.length-1)/Config.TunnelWidth*gs.tileWidth)))
                            levelProgressBarMarker.position.x = levelProgressBar.geometry.width + hudPos.x;
                            levelProgressBarMarker.needsUpdate = true
                            updatePosition(levelProgressBar)
                        }

                        entity.needsUpdate = true
                    }

                    updatePosition(entity)
                }

                // TIMING
                frames++
                if (frames == frames.MAX_SAFE_INTEGER) frames = 0
                
                // LOGGER
                log(gs, "score: ", gs.score)
                //if (frames % 5 == 0) {
                //    if (Config.Debug)
                //        drawUI(gs)
            // }
            } break;

            // UPDATE MAIN MENU
            case ScreenType.MainMenu: {
                let selectionChanged = false

                // INPUT
                if (Input.keyEnter.pressed) {
                    switch (mainMenuIndex) {
                        case 0: {
                            console.log("select 0")
                            gs.currentScreen = gs.screens[ScreenType.Game]
                        } break;

                        case 1: {
                            console.log("select 1")
                        } break;

                        case 2: {
                            console.log("select 2")
                        } break;

                        case 3: {
                            console.log("select 3")
                        } break;
                    }
                }

                if (Input.keyUp.pressed) {
                    if (keyUpWasReleased) {
                        keyUpWasReleased = false
                        mainMenuIndex--
                        selectionChanged = true
                    }
                } else {
                    keyUpWasReleased = true
                }

                if (Input.keyDown.pressed) {
                    if (keyDownWasReleased) {
                        keyDownWasReleased = false
                        mainMenuIndex++
                        selectionChanged = true
                    }
                } else {
                    keyDownWasReleased = true
                }

                if (mainMenuIndex < 0) mainMenuIndex = 3
                else if (mainMenuIndex > 3) mainMenuIndex = 0

                //setPosition(ball, 100.0, 100.0, -10.0)
                if (selectionChanged) {
                    selectedText.time = 0.0
                    selectedText = mainMenuTexts[mainMenuIndex]
                }

                textSelectTimer.advance(dt)
                selectedText.time = textSelectTimer.totalTime
            } break;

            case ScreenType.GameOver: {

                gameOverTimer.advance(dt)
                gameOverTimer.ifTick(() => {
                    gs.currentScreen = gs.screens[ScreenType.MainMenu]
                }, true) // continue condition
            } break;
        }

        // DRAW
        gl.clearColor(gs.clearColor[0], gs.clearColor[1], gs.clearColor[2], 0.0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        draw(gs.currentScreen.meshes, gs.camera)
        
    } // END OF STEP
    

    gl.clearColor(gs.clearColor[0], gs.clearColor[1], gs.clearColor[2], 0.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    // drawScene(gs, gs.camera)

    setTimeout(() => {
        if (!gs.muteAudio) playSound("main")
        clock.start()
        step()
    }, 1500.0)
}

function updateProportions(gs) {
    gs.canvas.style.left = (Math.round(window.innerWidth/2) - Math.round(gs.canvas.offsetWidth/2)) + "px"
    gs.canvas.style.top  = ((window.innerHeight - gs.canvas.offsetHeight) / 2 - 30) + "px"
}

function generateHTML(gs) {
    gs.canvas     = document.createElement("canvas")
    let canvas    = gs.canvas
    canvas.id     = "glcanvas"
    canvas.width  = Config.CanvasWidth
    canvas.height = Config.CanvasHeight
    canvas.style.border = "1px solid #007FFF"
    canvas.innerHTML = "Your browser doesn't appear to support the TODO add error alert" +
                        "<code>&lt;canvas&gt;</code> element."

    document.getElementById("container").appendChild(canvas)
}

window.onresize = (e) => {
    updateProportions(gs)
}