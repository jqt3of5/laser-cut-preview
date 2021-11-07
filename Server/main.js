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
    repo.getMaterialCategories().then(function (materialCategories) {
        res.send(materialCategories);
    }).catch(function (reason) {
        res.send(reason);
    });
});
//Set the material object for the currentproject
app.post('/:projectId/material/:materialId', function (req, res) {
    repo.setMaterialFor(req.params.projectId, req.params.materialId).then(function (proj) {
        res.send(proj);
    });
});
//gets the image for the graphic
app.get("/:projectId/graphic/:imageId/image", function (req, res) {
    //TODO: content-type header
    res.sendFile(uploadDir + req.params.imageId);
});
//Gets the json object on the graphic
app.get("/:projectId/graphic/:imageId", function (req, res) {
    repo.getGraphic(req.params.projectId, req.params.imageId).then(function (graphic) {
        res.send(graphic);
    });
});
//Deletes the graphic
app.delete("/:projectId/graphic/:imageId", function (req, res) {
    repo.deleteGraphicFrom(req.params.projectId, req.params.imageId).then(function (project) {
        res.send(project);
    });
});
//add a new graphic
app.post('/:projectId/graphic', function (req, res) {
    console.log(req.file);
    repo.saveGraphicFor(req.params.projectId, req.file.buffer).then(function (proj) { return res.send(proj); });
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