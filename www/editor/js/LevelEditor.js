function getEntityColor(entityType) {
    let color = "white"

    switch (entityType) {
        case "wall":     color = "green";  break;
        case "enemy":    color = "red";    break;
        case "treasure": color = "blue";   break;
        case "light":    color = "yellow"; break;
    }
    
    return color
}

let tiles = []

window.onload = () => {
    startEditor()
    gs.pauseCameraMovement = true
    gs.clearColor = [1.0, 1.0, 1.0] // TOOD why its not working
    Config.Debug = false
    Config.CanvasWidth  = 600
    Config.CanvasHeight = 500
    
    startGame()
    gs.camera.position.z = 2 * gs.tileWidth
    updateCamera(gs.camera)
    //level1 = getGameFormat() // is texture in level array??
    reloadLevel(gs)

    let panel = $("#panel")

    for (let i = 0; i < panel.children().length; ++i) {
        let btn = panel.children().eq(i)[0].childNodes[0]
        let minature = panel.children().eq(i)[0].childNodes[2]
        
        let offset = getTextureAtlasOffset(EntityType[btn.id]).mul(new V2(-32, -32))
        minature.style.backgroundPosition = offset.x + "px " + offset.y + "px"
    }
}

function startEditor() {
    let tileContainer = document.getElementById("tileContainer")
    let textArea = document.getElementById("text")
    let previousButton = null

    let selectedType = EntityType.Empty // default
    let levelDataArray = []

    let levelData = {
        "level": 0,
        "name": "level",
        "data": levelDataArray
    }

    updateTextArea()

    let lookup = [4, 5, 6, 7, 0, 1, 2, 3]
    function generatePanel(tileContainer, levelLength) {
        tiles = []
        tileContainer.innerHTML = ""
        for (let i = 0; i < Config.TunnelWidth*levelLength; ++i) {
            let tile = document.createElement("div")
            tile.classList.add("tile")

            if (i % Config.TunnelWidth == 0) {
                tile.classList.add("break")
            }

            tile.x = i % Config.TunnelWidth
            tile.y = levelLength - Math.floor(i / Config.TunnelWidth) - 1

            tile.id = tile.y*Config.TunnelWidth + lookup[tile.x]

            tile.type = EntityType.Empty

            tile.addEventListener("click", function() {
                let offset = getTextureAtlasOffset(selectedType).mul(new V2(-64, -64))
                //$(this).css("background-position", ())
                this.style.backgroundPosition = offset.x + "px " + offset.y + "px"

                let data = {
                    "id":   this.id,
                    "x":    this.x,
                    "y":    this.y,
                    "type": selectedType
                }

                let update = false
                for (let i = 0; i < levelDataArray.length; ++i) {
                    if (levelDataArray[i].id == data.id) {
                        levelDataArray[i] = data
                        update = true
                        break;
                    }
                }

                if (!update) {
                    levelDataArray.push(data)
                }
            
                updateTextArea()
                let gameFormat = getGameFormat()
                console.log(gameFormat)
                level1 = gameFormat
                reloadLevel(gs)

                gs.camera.position.z = -(tile.y-2) * gs.tileWidth
                updateCamera(gs.camera)
            }, false)

            tiles.push(tile)
            tileContainer.appendChild(tile)
        }
    }

    let levelLength = document.getElementById("levelLengthInput")
    levelLength.addEventListener("change", function(e) {
        generatePanel(tileContainer, levelLength.value)
        updatePanel()
    }, false)
    generatePanel(tileContainer, levelLength.value)

    $(".entity-type-button").click(function() {
        selectedType = EntityType[this.id]
        if (previousButton) {
            previousButton.style.borderColor = "lightgray"
            previousButton.style.fontWeight = "300"
        }
        
        this.style.borderColor = "black"
        this.style.fontWeight = "bold"

        previousButton = this
    })

    document.getElementById('fileInput').addEventListener('change', readFile, false)

    function readFile(e) {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            let file = e.target.files[0]
            if (file) {
                let reader = new FileReader()
                
                reader.onload = function(e) { 
	                let fileContents = e.target.result
                    load(fileContents)
                }

                reader.readAsText(file)
            } else {
                alert('Failed to load file')
            }
        } else {
            alert('The File APIs are not fully supported by your browser')
        }
    }

    function updatePanel() {
        for (let i = 0; i < Config.TunnelWidth*levelLength.value; ++i) {
            let tile = tiles[i]
            let color = "white"
            let entityType = EntityType.Empty

            for (let j = 0; j < levelDataArray.length; ++j) {
                if (tile.id == levelDataArray[j].id) {
                    entityType = levelDataArray[j].type
                    break;
                }
            }
            
            let offset = getTextureAtlasOffset(entityType).mul(new V2(-64, -64))
            tile.style.backgroundPosition = offset.x + "px " + offset.y + "px"
        }

        //for (let i = 0; i < levelDataArray.length; ++i) { // TODO update array when level shrinks
            //if (levelDataArray.id >= ) {
            //    levelDataArray.splice(i, 1)
           //}
        //}
    }

    function updateTextArea() {
        textArea.value = JSON.stringify(levelData, null, 4)
    }

    function load(data) {
        let obj = JSON.parse(data)
        let level = obj.data
        levelDataArray = level
        levelData.data = levelDataArray

        updateTextArea()
        updatePanel()        
    }

    function download(filename, data) {
        let element = document.createElement('a')
        element.setAttribute('href', 'data:text/javascript;charset=utf-8,' + encodeURIComponent(data))
        element.setAttribute('download', filename)

        element.style.display = 'none'
        document.body.appendChild(element)

        element.click()

        document.body.removeChild(element)
    }

    function getGameFormat() {
        let result = []
        
        for (let i = 0; i < Config.TunnelWidth*levelLength.value; ++i) {
            let tile = tiles[i]
            let color = "white"
            let entityType = EntityType.Empty
            let found = false

            for (let j = 0; j < levelDataArray.length; ++j) {
                if (tile.id == levelDataArray[j].id) {
                    if (levelDataArray[j].type == undefined) {
                        entityType = EntityType.Empty
                    } else {
                        entityType = levelDataArray[j].type
                    }
                    
                    found = true
                    result[tile.id] = entityType
                    break;
                }
            }

            //if (!found)
              //  entityType = EntityType.Empty

            //result[i] = entityType
        }

        for (let i = 0; i < result.length; ++i) { // fill empty records with empty entity
            if (result[i] == undefined)
                result[i] = EntityType.Empty
        }

        return result
    }

    function save() {
        if (levelDataArray.length != Config.TunnelWidth*levelLength) {
            console.log(levelDataArray.length)
            //alert("You must fill every tile for your level to be compatible with the game!")
            //return
        }
        if (textArea.value == "") return
        let obj = JSON.parse(textArea.value)
        let level = obj.data
        levelDataArray = level
        levelData.data = levelDataArray

        let result = getGameFormat()

        let name = levelData.name
        download(name +           ".js", "let " + name + "=[" + result + "]")
        download(name + "EditorData.js", JSON.stringify(levelData, null, 4))
    }

    $("#save").click(function() {
        save()
    })

    textArea.addEventListener("keydown", processUserInput, true)
    textArea.addEventListener("paste",   processUserInput, true)

    function processUserInput(e) {
        try {
            JSON.parse(textArea.value)
            textArea.style.color = "black"
        } catch(e) {
            console.log("JSON parsing error")
            textArea.style.color = "red"
            return
        }

        let obj = JSON.parse(textArea.value)
        let level = obj.data
        levelDataArray = level
        levelData.data = levelDataArray

        updatePanel()
    }
}