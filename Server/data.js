"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repo = exports.Project = exports.Graphic = exports.Color = void 0;
var fs = require("fs");
var uuid = require("uuid");
//{projects:{"" : {guid:"", materialId: "", graphics:[{posX:0, posY:0, dimX:0, dimY:0, guid:"", colors:[{color:"", mode:""}] }
var documentDB = { projects: {} };
const assetDir = __dirname + "/Assets/";
const uploadDir = __dirname + "/upload/";
const materialsFile = assetDir + "materials.json";
class Color {
    constructor(init) {
        Object.assign(this, init);
    }
}
exports.Color = Color;
class Graphic {
    constructor(init) {
        Object.assign(this, init);
    }
}
exports.Graphic = Graphic;
class Project {
    constructor(init) {
        Object.assign(this, init);
    }
}
exports.Project = Project;
class Repo {
    createProject(projectId) {
        documentDB[projectId] = new Project({ projectId: projectId, material: { url: "", name: "none", id: "", category: "none" }, graphics: [] });
        return documentDB[projectId];
    }
    getProject(projectId) {
        return new Promise((resolve, reject) => {
            if (documentDB[projectId] == undefined) {
                this.createProject(projectId);
            }
            resolve(documentDB[projectId]);
        });
    }
    // translateGraphic(projectId : string, graphicId: string, newX:number, newY:number)
    // {
    //
    // }
    //
    // resizeGraphic(projectId : string, graphicId: string, newX : number, newY:number)
    // {
    //
    // }
    getGraphic(projectId, graphicId) {
        return this.getProject(projectId).then(project => {
            return new Promise((resolve, reject) => {
                var graphic = project.graphics.find((value, index, obj) => {
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
    }
    saveGraphicFor(projectId, buffer) {
        const guid = uuid.v4();
        //TODO: ensure uploadDir exists
        return new Promise((resolve, reject) => {
            fs.open(uploadDir + guid, 'w', (err, fd) => {
                if (err) {
                    console.log(err);
                    return;
                }
                fs.writeSync(fd, buffer);
                //TODO: Get a real width and height
                //Perhaps resize if it's too big
                let graphic = new Graphic({
                    guid: guid,
                    url: `/${projectId}/graphic/${guid}/image`,
                    colors: [new Color({ color: "blue", mode: "cut" }),
                        new Color({ color: "red", mode: "cut" })],
                    posX: 0, posY: 0,
                    height: 100, width: 100
                });
                this.addGraphicTo(projectId, graphic).then(proj => {
                    resolve(proj);
                });
            });
        });
    }
    addGraphicTo(projectId, graphic) {
        return this.getProject(projectId).then(proj => {
            proj.graphics.push(graphic);
            return proj;
        });
    }
    deleteGraphicFrom(projectId, graphicId) {
        return this.getProject(projectId).then(proj => {
            return proj;
        });
    }
    setMaterialFor(projectId, materialId) {
        return this.getProject(projectId).then(proj => {
            return this.getMaterial(materialId).then(material => {
                proj.material = material;
                return proj;
            });
        });
    }
    getMaterial(materialId) {
        return new Promise((resolve, reject) => {
            this.getMaterialCategories().then(categories => {
                for (var category of categories) {
                    for (var material of category.materials) {
                        if (material.id == materialId) {
                            resolve(material);
                        }
                    }
                }
                reject(materialId + " not found");
            }).catch(reason => {
                reject(reason);
            });
        });
    }
    getMaterialCategories() {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(materialsFile)) {
                reject(materialsFile + " Does not exist");
                return;
            }
            fs.open(materialsFile, 'r', (err, fd) => {
                fs.readFile(fd, (err, buffer) => {
                    let categories = JSON.parse(buffer);
                    resolve(categories);
                });
            });
        });
    }
}
exports.Repo = Repo;
//# sourceMappingURL=data.js.map