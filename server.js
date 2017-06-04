var http = require("http")
var fs = require("fs")
var qs = require("querystring")
var socket = require("socket.io")
var p = require('path')

function fileExists(path) {
  try {
    fs.accessSync(path)
        return true
  } catch (e) {
      return false
  }
}

var server = http.createServer(function (req, res) {
    console.log(req.url)
    switch (req.method) {
        case "GET": {
            var path = ""
            var contentType = "text/html"
            var isAudio = false

            //if (req.url == "/favicon.ico") {

            //    break;
            //}
            if (req.url == "/") {
                path = "www/index.html"
            } else if (req.url == "/editor") {
                path = "www/editor/editor.html"
            } else {
                path = "www" + req.url
                if (!fileExists(path)) {
                    console.log("file " + path + " doesn't exist!!!")
                    res.writeHead(400, {"Content-Type": "text/plain"})
                    res.end("ERROR File does NOT Exists")
                    return
                }

                var fileName = p.basename(path)
                var dirName = p.dirname(path)
                console.log("fileName: " + fileName)
                var ext = fileName.split(".")[1]
                switch (ext) {
                    case "html": {
                        contentType = "text/html"                       
                    } break;

                    case "css": {
                        contentType = "text/css"  
                    } break;

                    case "js": {
                        contentType = "text/javascript"  
                    } break;

                    case "png": {
                        contentType = "image/png"  
                    } break;

                    case "jpg": {
                        contentType = "image/jpeg"  
                    } break;

                    case "wav": {
                        contentType = "audio/wav"
                        isAudio = true
                    } break;

                    case "ogg": {
                        contentType = "audio/ogg"
                        isAudio = true
                    } break;

                    case "mp3": {
                        contentType = "audio/mpeg3"
                        isAudio = true
                    } break;

                    case "ico": {
                        contentType = "image/x-icon"
                    } break;

                    default: {
                        contentType = "text/plain"  
                    } break;
                }
            }

            contentType += "; charset=utf-8"
            console.log("contentType: " + contentType)

            fs.readFile(path, function (error, data) {
                if (isAudio) {
                    res.writeHead(200, {
                        'Content-Length': fs.statSync(path).size,
                        'Content-Type': contentType,
                        'Content-Disposition': "attachment; filename=" + fileName
                    })
                    fs.createReadStream(path).pipe(res)
                } else {
                    res.writeHead(200, {
                        'Content-Length': Buffer.byteLength(data, 'utf8'),
                        'Content-Type': contentType,
                    })
                    res.write(data, 'utf8')
                    res.end()
                }
            })
        } break;

        case "POST": {
            servResp(req, res)
        } break;
    }
})
server.listen(3000);
console.log("serwer startuje na porcie 3000 - ten komunikat zobaczysz tylko raz")
var io = socket.listen(server)

io.sockets.on("connection", function(client) {    
    console.log("klient sie podłączył" + client.id) 
    
    client.emit("onconnect", {
        clientName:client.id
    })

    client.on("disconnect", function() {
        console.log("klient się rozłącza")
    })
})

function servResp(req, res) {
    var allData = "";
    var result = null
    var type = 'text/html'

    req.on("data", function (data) {
        allData += data;
    })

    req.on("end", function (data) {
        var request = qs.parse(allData)
        var result = {success: false, message: "", data: null}

        switch (request.action) {
            case "CREATE_FILE": {
                fs.writeFile(__dirname + request.path, request.data, function(error) {
                    if (error) {
                        console.log("file error:" + error)
                        result.message = "file error"
                    } else {
                        console.log("file created successfully!")
                        result.message = "file created successfully!"
                        result.success = true
                    }
                });
            } break;

            case "READ_FILE": {
                result.data = fs.readFileSync(__dirname + request.path, "utf8");
                result.success = true // TODO
                type = "application/json"
            } break;

            default: {
                console.log("request.action not recognized!!!")
                result.message = "request.action not recognized!!!"
            } break;
        }

        result.action = request.action
        var data = JSON.stringify(result)
         res.writeHead(200, {
             'Content-Length': Buffer.byteLength(data, 'utf8'),
             'Content-Type': (type + '; charset=utf-8')
        })
        res.write(data, 'utf8')
        res.end();
    })
}