const express = require('express')
const cors = require("cors")
const formData = require("form-data")
const bodyParser = require('body-parser');
const multer = require('multer');
var fs = require("fs")
var uuid = require("uuid")

import {Repo, Graphic, Color} from "./data"

const assetDir = __dirname + "/Assets/"
const uploadDir = __dirname + "/upload/"

const upload = multer();
const app = express()
const port = 3001
let repo = new Repo();

app.use(cors())
app.use(express.json())
app.use(upload.single("file"))
app.use('/static',express.static(assetDir))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/materials', (req, res) => {
    repo.getMaterials().then(materialCategories => {
        res.send(materialCategories)
    }).catch(reason => {
        res.send(reason)
    })
})

app.post('/:projectId/material', (req, res) => {
    //TODO: Should probably do some kind of parsing of the body before blindly passing it to the repo
    repo.setMaterialFor(req.params.projectId, req.body.material).then(proj => {
        res.send(proj)
    })
})

app.get("/:projectId/graphic/:imageId/image", (req, res) => {
    res.sendFile(uploadDir + req.params.imageId)
})

//Gets the details on the graphic
app.get("/:projectId/graphic/:imageId", (req, res) => {
    repo.getGraphic(req.params.projectId, req.params.imageId).then(graphic => {
       res.send(graphic)
    })
})
app.delete("/:projectId/graphic/:imageId", (req, res) => {
    repo.deleteGraphicFrom(req.params.projectId, req.params.imageId).then(project => {
        res.send(project)
    })
})
//add a new graphic
app.post('/:projectId/graphic', (req, res) => {
    console.log(req.file)
    const guid = uuid.v5()
    fs.open(uploadDir + guid, 'w', (err, fd) => {
        fs.write(fd, req.file.buffer)
        //TODO: Get a real width and height
        //Perhaps resize if it's too big
        let graphic = new Graphic({guid:guid, colors:[new Color({color:"ffaabb", mode:"cut"})], posX:0, posY:0, height:100, width:100})
        repo.addGraphicTo(req.params.projectId, graphic).then(v => {
            res.send(graphic)
        })
    })
})

app.post("/:projectId", (req, res) => {
    var project = repo.createProject(req.params.projectId)
    res.send(project)
})

app.get("/:projectId", (req, res) => {
    repo.getProject(req.params.projectId).then(project => {
        res.send(project)
    });
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})