
export interface UploadedFile {
    fieldname: string,
    originalname: string,
    encoding: string,
    mimetype: string,
    buffer: Buffer,
    size: number
}
export interface MaterialCategory {
    category: string,
    materials: Material[]
}

export interface Material  {
    category: string,
    id: string,
    name: string,
}

export class ColorMode {
    constructor (
        public color: string,
        public guid: string,
        public url: string,
        public mode: string
    ) {}
}

export class Graphic {
    constructor(
        public guid: string,
        public name: string,
        public mimetype: string,
        public url: string,
        public colorModes: ColorMode[],
        public posX : number,
        public posY : number,
        public width: number,
        public height : number) {}
}
export class Project {
    constructor(
        public projectId: string,
        public material:Material,
        public graphics: Graphic[]) {}
}
