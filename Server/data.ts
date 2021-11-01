var fs = require("fs")
var uuid = require("uuid")

//{projects:{"" : {guid:"", materialId: "", graphics:[{posX:0, posY:0, dimX:0, dimY:0, guid:"", colors:[{color:"", mode:""}] }
var documentDB = {projects: {}}

const assetDir = __dirname + "/Assets/"
const uploadDir = __dirname + "/upload/"
const materialsFile = assetDir + "materials.json"

export interface MaterialCategory {
    category: string,
    materials: Material[]
}
export interface Material  {
    id: string,
    name: string,
    image: string
}

export class Color {
    color: string
    mode: string

    public constructor(init?:Partial<Color>) {
        Object.assign(this, init);
    }
}
export class Graphic {
    guid: string
    colors: Color[]
    posX : number
    posY : number
    width: number
    height : number

    public constructor(init?:Partial<Graphic>) {
        Object.assign(this, init);
    }
}
export class Project {
    projectId: string
    material:Material
    graphics: Graphic[]

    public constructor(init?:Partial<Project>) {
        Object.assign(this, init);
    }
}

export class Repo {

    public createProject(projectId) : Project {
       documentDB[projectId] = new Project({projectId: projectId, material:undefined, graphics: [] as Graphic[]})
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

    // translateGraphic(projectId : string, graphicId: string, newX:number, newY:number)
    // {
    //
    // }
    //
    // resizeGraphic(projectId : string, graphicId: string, newX : number, newY:number)
    // {
    //
    // }

    getGraphic(projectId : string, graphicId : string) : Promise<Graphic>
    {
        return this.getProject(projectId).then(project => {
           return new Promise((resolve, reject) => {
               var graphic = project.graphics.find((value, index, obj) => {
                  if (value.guid == graphicId)
                  {
                      return value
                  }
               })

               if (graphic != undefined)
               {
                   resolve(graphic)
               }
               else
               {}

           })
        })
    }
    addGraphicTo(projectId : string, graphic: Graphic) : Promise<void>
    {
        return this.getProject(projectId).then(proj => {
           proj.graphics.push(graphic)
        })
    }

    deleteGraphicFrom(projectId : string, graphicId : string) : Promise<Project>
    {
        return this.getProject(projectId).then(proj => {
            return proj
        })
    }

    setMaterialFor(projectId, material) : Promise<Project> {

        return this.getProject(projectId).then(proj => {
            proj.material = material
            return proj
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
