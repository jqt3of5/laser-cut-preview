const express = require('express')
const cors = require("cors")
const formData = require("form-data")
const bodyParser = require('body-parser');
const multer = require('multer');
var fs = require("fs")
var uuid = require("uuid")

import {Repo} from "./data"

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
    repo.getMaterialCategories().then(materialCategories => {
        res.send(materialCategories)
    }).catch(reason => {
        res.send(reason)
    })
})
//
// //Set the material object for the currentproject
// app.post('/:projectId/material/:materialId', (req, res) => {
//     repo.setMaterialFor(req.params.projectId, req.params.materialId).then(proj => {
//         res.send(proj)
//     })
// })

//gets the image for the graphic
app.get("/graphic/:imageId/image", (req, res) => {
    //TODO: content-type header
    repo.getGraphic(req.params.imageId).then(graphic => {
        res.sendFile(uploadDir + graphic.guid, {headers:{"content-type": graphic.mimetype}})
    })
})
//
// //Gets the json object on the graphic
// app.get("/:projectId/graphic/:imageId", (req, res) => {
//     repo.getGraphic(req.params.projectId, req.params.imageId).then(graphic => {
//        res.send(graphic)
//     })
// })
//
// //Deletes the graphic
// app.delete("/:projectId/graphic/:imageId", (req, res) => {
//     repo.deleteGraphicFrom(req.params.projectId, req.params.imageId).then(project => {
//         res.send(project)
//     })
// })

//upload a new graphic and perform the processing
app.post('/graphic', (req, res) => {

    if (req.file.mimetype !=="image/svg+xml" && req.file.mimetype !=="image/pdf")
    {
        res.statusCode = 402
        res.send("File type " + req.file.mimetype + " not supported")
        return
    }
    repo.saveGraphic(req.file).then(graphic => {
        res.send(graphic)
    })
})

app.post("/:projectId", (req, res) => {
    //TODO: Validate project data is correct
    repo.saveProject(req.body).then(project => {
        res.send(project)
    })
})

app.get("/:projectId", (req, res) => {
    repo.getProject(req.params.projectId).then(project => {
        res.send(project)
    })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})