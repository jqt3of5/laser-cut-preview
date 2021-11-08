import {Project, Graphic, Color, MaterialCategory, Material, UploadedFile} from "../src/common/data";

var fs = require("fs")
var uuid = require("uuid")

//{projects:{"" : {guid:"", materialId: "", graphics:[{posX:0, posY:0, dimX:0, dimY:0, guid:"", colors:[{color:"", mode:""}] }
var documentDB = {projects: {}}

const assetDir = __dirname + "/Assets/"
const uploadDir = __dirname + "/upload/"
const materialsFile = assetDir + "materials.json"

export class Repo {

    createProject(projectId) : Project {
       documentDB[projectId] = new Project(projectId, {url:"", name:"none", id:"", category:"none"}, [])
        return documentDB[projectId]
    }

    getProject(projectId) : Promise<Project> {
        return new Promise((resolve, reject) => {
            if (documentDB[projectId] == undefined)
            {
                this.createProject(projectId)
            }
            resolve(documentDB[projectId])
        })
    }

    saveProject(project : Project) : Promise<Project> {
        documentDB[project.projectId] = project
        return new Promise<Project>((resolve, reject) => {
            resolve(project)
        })
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

    saveGraphic(file: UploadedFile) : Promise<Graphic> {
        const guid = uuid.v4()
        //TODO: ensure uploadDir exists
        return new Promise<Graphic>((resolve, reject) => {
            fs.open(uploadDir + guid, 'w', (err, fd) => {
                if (err) {
                    console.log(err)
                    return
                }
                fs.writeSync(fd, file.buffer)

                //TODO: Get a real width and height
                //Perhaps resize if it's too big
                let graphic = {
                    guid:guid,
                    type: file.mimetype,
                    name: file.originalname,
                    url:`/graphic/${guid}/image`,
                    colors:
                        [
                            {color:"blue", mode:"cut"},
                            {color:"red", mode:"cut"}
                        ],
                    posX:0, posY:0,
                    height:100, width:100}
                resolve(graphic)
            })
        })
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

    getMaterialCategories() : Promise<MaterialCategory[]> {

        return new Promise<MaterialCategory[]>((resolve, reject) => {
            if (!fs.existsSync(materialsFile))
            {
                reject(materialsFile + " Does not exist")
                return
            }
            fs.open(materialsFile, 'r', (err, fd) => {
                fs.readFile(fd, (err, buffer) => {
                    let categories : [MaterialCategory] = JSON.parse(buffer)
                    resolve(categories)
                })
            })
        })
    }


}
