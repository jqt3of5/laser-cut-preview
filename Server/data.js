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
        documentDB[projectId] = new Project({ projectId: projectId, material: undefined, graphics: [] });
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
    // translateGraphic(projectId : string, graphicId: string, newX:number, newY:number)
    // {
    //
    // }
    //
    // resizeGraphic(projectId : string, graphicId: string, newX : number, newY:number)
    // {
    //
    // }
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
            return proj;
        });
    };
    Repo.prototype.deleteGraphicFrom = function (projectId, graphicId) {
        return this.getProject(projectId).then(function (proj) {
            return proj;
        });
    };
    Repo.prototype.setMaterialFor = function (projectId, materialId) {
        var _this = this;
        return this.getProject(projectId).then(function (proj) {
            return _this.getMaterial(materialId).then(function (material) {
                proj.material = material;
                return proj;
            });
        });
    };
    Repo.prototype.getMaterial = function (materialId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.getMaterialCategories().then(function (categories) {
                for (var _i = 0, categories_1 = categories; _i < categories_1.length; _i++) {
                    var category = categories_1[_i];
                    for (var _a = 0, _b = category.materials; _a < _b.length; _a++) {
                        var material = _b[_a];
                        if (material.id == materialId) {
                            resolve(material);
                        }
                    }
                }
                reject(materialId + " not found");
            }).catch(function (reason) {
                reject(reason);
            });
        });
    };
    Repo.prototype.getMaterialCategories = function () {
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