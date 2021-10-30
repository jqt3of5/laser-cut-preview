const express = require('express')
const cors = require("cors")
const formData = require("form-data")
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require("fs")
var uuid = require("uuid")
var upload = multer();

const app = express()
const port = 3001

const assetDir = __dirname + "/Assets/"
const uploadDir = __dirname + "/upload/"

//{projects:{images:[{guid:"", colors:[{color:"", mode:""]] }
var documentDB = {projects: {}}

app.use(cors())
app.use(upload.single("file"))
app.use('/static',express.static(assetDir))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/materials', (req, res) => {
    fs.open(assetDir, 'r', (err, fd) => {
        fs.readFile(fd, (err, buffer) => {
            res.send(buffer)
        })
    })
})

app.post('/:projectId/uploadgraphic', (req, res) => {
    console.log(req.file)
    const image = uuid.v5()
    documentDB.projects[req.params.projectId].images.add(image)
    fs.open(uploadDir + image, 'w', (err, fd) => {
        fs.write(fd, req.file.buffer)
        documentDB
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

app.get("/:projectId/image/:imageId", (req, res) => {
    res.sendFile(uploadDir + req.params.imageId)
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})