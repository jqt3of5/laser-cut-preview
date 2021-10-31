const express = require('express')
const cors = require("cors")
const formData = require("form-data")
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require("fs")
var uuid = require("uuid")
const Repo = require("./data")

var upload = multer();

const app = express()
const port = 3001

const assetDir = __dirname + "/Assets/"

app.use(cors())
app.use(upload.single("file"))
app.use('/static',express.static(assetDir))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/materials', (req, res) => {
   Repo.getMaterials().then(materialCategories => {
      res.send(materialCategories)
   }).catch(reason => {
       res.send(reason)
   })
})

app.post('/:projectId/material', (req, res) => {

})

//Gets the details on the graphic
app.get("/:projectId/graphic/:imageId", (req, res) => {
    res.sendFile(uploadDir + req.params.imageId)
})
//Posts new details on the graphic.
app.post("/:projectId/graphic/:imageId", (req, res) => {
    res.sendFile(uploadDir + req.params.imageId)
})
//add a new graphic
app.post('/:projectId/graphic', (req, res) => {
    console.log(req.file)
    const image = uuid.v5()
    documentDB.projects[req.params.projectId].images.add(image)
    fs.open(uploadDir + image, 'w', (err, fd) => {
        fs.write(fd, req.file.buffer)
        // documentDB
        res.send({guid:image, colors:[{color:"0xffffff", mode:"Cut"}]})
    })
})

app.post("/:projectId", (req, res) => {
    if (documentDB.projects[req.params.projectId] == undefined)
    {
        documentDB.projects[req.params.projectId] = {images:[]}
    }
    res.send()
})

app.get("/:projectId", (req, res) => {
    res.send(documentDB.projects[req.params.projectId])
})


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})