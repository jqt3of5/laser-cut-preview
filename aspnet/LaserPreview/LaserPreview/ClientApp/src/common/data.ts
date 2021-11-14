import {Dimension} from "./Dimension";

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

export enum LaserMode {
    Cut,
    Score,
    Engrave
}
export class SvgSubGraphic {
    constructor (
        public color: string,
        public guid: string,
        public url: string,
        public mode: LaserMode,
        public mimetype: string,
        public posX : Dimension,
        public posY : Dimension,
        public width: Dimension,
        public height : Dimension
    ) {}
}

export class SvgGraphic {
    constructor(
        public guid: string,
        public name: string,
        public mimetype: string,
        public url: string,
        public colorModes: SvgSubGraphic[],
        public posX : Dimension,
        public posY : Dimension,
        public width: Dimension,
        public height : Dimension) {}
}
export class Project {
    constructor(
        public projectId: string,
        public material:Material,
        public boardWidth : Dimension,
        public boardHeight : Dimension,
        public graphics: SvgGraphic[]) {}
}
