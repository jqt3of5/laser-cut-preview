"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repo = exports.Project = exports.Graphic = exports.Color = void 0;
var fs = require("fs");
var uuid = require("uuid");
//{projects:{"" : {guid:"", materialId: "", graphics:[{posX:0, posY:0, dimX:0, dimY:0, guid:"", colors:[{color:"", mode:""}] }
var documentDB = { projects: {} };
var assetDir = __dirname + "/Assets/";
var uploadDir = __dirname + "/upload/";
var materialsFile = assetDir + "materials.json";
var Color = /** @class */ (function () {
    function Color(init) {
        Object.assign(this, init);
    }
    return Color;
}());
exports.Color = Color;
var Graphic = /** @class */ (function () {
    function Graphic(init) {
        Object.assign(this, init);
    }
    return Graphic;
}());
exports.Graphic = Graphic;
var Project = /** @class */ (function () {
    function Project(init) {
        Object.assign(this, init);
    }
    return Project;
}());
exports.Project = Project;
var Repo = /** @class */ (function () {
    function Repo() {
    }
    Repo.prototype.createProject = function (projectId) {
        documentDB[projectId] = new Project({ projectId: projectId, materialId: "none", graphics: [] });
        return documentDB[projectId];
    };
    Repo.prototype.getProject = function (projectId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (documentDB[projectId] == undefined) {
                _this.createProject(projectId);
            }
            resolve(documentDB[projectId]);
        });
    };
    Repo.prototype.translateGraphic = function (projectId, graphicId, newX, newY) {
    };
    Repo.prototype.resizeGraphic = function (projectId, graphicId, newX, newY) {
    };
    Repo.prototype.getGraphic = function (projectId, graphicId) {
        return this.getProject(projectId).then(function (project) {
            return new Promise(function (resolve, reject) {
                var graphic = project.graphics.find(function (value, index, obj) {
                    if (value.guid == graphicId) {
                        return value;
                    }
                });
                if (graphic != undefined) {
                    resolve(graphic);
                }
                else { }
            });
        });
    };
    Repo.prototype.addGraphicTo = function (projectId, graphic) {
        return this.getProject(projectId).then(function (proj) {
            proj.graphics.push(graphic);
        });
    };
    Repo.prototype.deleteGraphicFrom = function (projectId, graphicId) {
        this.getProject(projectId).then(function (proj) {
            //TODO:
        });
    };
    Repo.prototype.setMaterialFor = function (projectId, materialId) {
        return this.getProject(projectId).then(function (proj) {
            proj.materialId = materialId;
            return proj;
        });
    };
    Repo.prototype.getMaterials = function () {
        return new Promise(function (resolve, reject) {
            if (!fs.existsSync(materialsFile)) {
                reject(materialsFile + " Does not exist");
                return;
            }
            fs.open(materialsFile, 'r', function (err, fd) {
                fs.readFile(fd, function (err, buffer) {
                    var categories = JSON.parse(buffer);
                    resolve(categories);
                });
            });
        });
    };
    return Repo;
}());
exports.Repo = Repo;
//# sourceMappingURL=data.js.map