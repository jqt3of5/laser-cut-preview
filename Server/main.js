"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require('express');
var cors = require("cors");
var formData = require("form-data");
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require("fs");
var uuid = require("uuid");
var data_1 = require("./data");
var assetDir = __dirname + "/Assets/";
var uploadDir = __dirname + "/upload/";
var upload = multer();
var app = express();
var port = 3001;
var repo = new data_1.Repo();
app.use(cors());
app.use(express.json());
app.use(upload.single("file"));
app.use('/static', express.static(assetDir));
app.get('/', function (req, res) {
    res.send('Hello World!');
});
app.get('/materials', function (req, res) {
    repo.getMaterials().then(function (materialCategories) {
        res.send(materialCategories);
    }).catch(function (reason) {
        res.send(reason);
    });
});
app.post('/:projectId/material', function (req, res) {
    console.log(req.body);
    repo.setMaterialFor(req.params.projectId, req.body.materialId).then(function (proj) {
        res.send(proj);
    });
});
app.get("/:projectId/graphic/:imageId/image", function (req, res) {
    res.sendFile(uploadDir + req.params.imageId);
});
//Gets the details on the graphic
app.get("/:projectId/graphic/:imageId", function (req, res) {
    repo.getGraphic(req.params.projectId, req.params.imageId).then(function (graphic) {
        res.send(graphic);
    });
});
//TODO: Posts new details on the graphic.
app.post("/:projectId/graphic/:imageId", function (req, res) {
});
//add a new graphic
app.post('/:projectId/graphic', function (req, res) {
    console.log(req.file);
    var guid = uuid.v5();
    fs.open(uploadDir + guid, 'w', function (err, fd) {
        fs.write(fd, req.file.buffer);
        //TODO: Get a real width and height
        //Perhaps resize if it's too big
        var graphic = new data_1.Graphic({ guid: guid, colors: [new data_1.Color({ color: "ffaabb", mode: "cut" })], posX: 0, posY: 0, height: 100, width: 100 });
        repo.addGraphicTo(req.params.projectId, graphic).then(function (v) {
            res.send(graphic);
        });
    });
});
app.post("/:projectId", function (req, res) {
    var project = repo.createProject(req.params.projectId);
    res.send(project);
});
app.get("/:projectId", function (req, res) {
    repo.getProject(req.params.projectId).then(function (project) {
        res.send(project);
    });
});
app.listen(port, function () {
    console.log("Example app listening at http://localhost:" + port);
});
//# sourceMappingURL=main.js.map