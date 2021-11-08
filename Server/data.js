"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repo = void 0;
const data_1 = require("../src/common/data");
var fs = require("fs");
var uuid = require("uuid");
//{projects:{"" : {guid:"", materialId: "", graphics:[{posX:0, posY:0, dimX:0, dimY:0, guid:"", colors:[{color:"", mode:""}] }
var documentDB = { projects: {} };
const assetDir = __dirname + "/Assets/";
const uploadDir = __dirname + "/upload/";
const materialsFile = assetDir + "materials.json";
class Repo {
    createProject(projectId) {
        documentDB[projectId] = new data_1.Project(projectId, { url: "", name: "none", id: "", category: "none" }, []);
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
    saveProject(project) {
        documentDB[project.projectId] = project;
        return new Promise((resolve, reject) => {
            resolve(project);
        });
    }
    // getGraphic(projectId : string, graphicId : string) : Promise<Graphic>
    // {
    //     return this.getProject(projectId).then(project => {
    //        return new Promise((resolve, reject) => {
    //            var graphic = project.graphics.find((value, index, obj) => {
    //               if (value.guid == graphicId)
    //               {
    //                   return value
    //               }
    //            })
    //
    //            if (graphic != undefined)
    //            {
    //                resolve(graphic)
    //            }
    //            else
    //            {}
    //
    //        })
    //     })
    // }
    saveGraphic(buffer) {
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
                let graphic = {
                    guid: guid,
                    url: `/graphic/${guid}/image`,
                    colors: [
                        { color: "blue", mode: "cut" },
                        { color: "red", mode: "cut" }
                    ],
                    posX: 0, posY: 0,
                    height: 100, width: 100
                };
                resolve(graphic);
            });
        });
    }
    // addGraphicTo(projectId : string, graphic: Graphic) : Promise<Project>
    // {
    //     return this.getProject(projectId).then(proj => {
    //         proj.graphics.push(graphic)
    //         return proj
    //     })
    // }
    //
    // deleteGraphicFrom(projectId : string, graphicId : string) : Promise<Project>
    // {
    //     return this.getProject(projectId).then(proj => {
    //         return proj
    //     })
    // }
    // setMaterialFor(projectId, materialId) : Promise<Project> {
    //
    //     return this.getProject(projectId).then(proj => {
    //         return this.getMaterial(materialId).then(material => {
    //             proj.material = material
    //             return proj
    //         })
    //     })
    // }
    //
    // getMaterial(materialId) : Promise<Material> {
    //
    //     return new Promise<Material>((resolve, reject) => {
    //         this.getMaterialCategories().then(categories => {
    //             for (var category of categories) {
    //                 for (var material of category.materials) {
    //                     if (material.id == materialId) {
    //                         resolve(material)
    //                     }
    //                 }
    //             }
    //             reject(materialId + " not found")
    //         }).catch(reason => {
    //             reject(reason)
    //         })
    //     })
    // }
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