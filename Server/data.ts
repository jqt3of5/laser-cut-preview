var fs = require("fs")
var uuid = require("uuid")

//{projects:{"" : {guid:"", materialId: "", graphics:[{posX:0, posY:0, dimX:0, dimY:0, guid:"", colors:[{color:"", mode:""}] }
var documentDB = {projects: {}}

const assetDir = __dirname + "/Assets/"
const uploadDir = __dirname + "/upload/"
const materialsFile = assetDir + "materials.json"

interface MaterialCategory {
    category: string,
    materials: Material[]
}
interface Material  {
    id: string,
    name: string,
    image: string
}

class Color {
    color: string
    mode: string
}
class Graphic {
    guid: string
    colors: Color[]
    posX : number
    posY : number
    dimX : number
    dimY : number

    public constructor(init?:Partial<Graphic>) {
        Object.assign(this, init);
    }
}
class Project {
    projectId: string
    materialId: string
    graphics: Graphic[]

    public constructor(init?:Partial<Project>) {
        Object.assign(this, init);
    }
}

class Repo {

    createProject(projectId) : void {
       documentDB[projectId] = new Project({projectId: projectId, materialId:"", graphics: [] as Graphic[]})
    }

    getProject(projectId) : Promise<Project> {
        return new Promise((resolve, reject) => {
            if (documentDB[projectId] == undefined)
            {
                reject(projectId + " not found")
            }
            else
            {
                resolve(documentDB[projectId])
            }
        })
    }

    moveGraphic(projectId : string, graphicId: string, newX:number, newY:number)
    {

    }

    resizeGraphic(projectId : string, graphicId: string, newX : number, newY:number)
    {

    }

    addGraphicTo(projectId : string, graphic: Graphic)
    {
        //TODO: the user is going to upload an image, and we then need to calculate the colors.
    }

    deleteGraphicFrom(projectId : string, graphicId : string)
    {

    }

    setMaterialFor(projectId, materialId) : Promise<boolean> {
        documentDB.projects[projectId].materialId = materialId

        return new Promise((resolve, reject) => {
           resolve(true)
        })
    }

    getMaterials() : Promise<[MaterialCategory]> {

        return new Promise<[MaterialCategory]>((resolve, reject) => {
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

module.exports = Repo
