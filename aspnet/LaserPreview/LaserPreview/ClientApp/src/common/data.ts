
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

export enum DimensionUnits {
    Inches,
    Millimeters,
    Centimeters,
    Pixels
}
export class Dimension {
    constructor(
        public value : number,
        public unit : DimensionUnits
    ) {
    }
}

export function ToType(d : Dimension, t: DimensionUnits ): Dimension
{
    if (t == d.unit)
    {
        return d 
    }

    let value = d.value
    switch (d.unit)
    {
        case DimensionUnits.Centimeters:
            //Convert to an intermetiate centimeters in every case
            break;
        case DimensionUnits.Millimeters:
            value = value/10;
            break;
        case DimensionUnits.Inches:
            value = value * 2.54;
            break;
        case DimensionUnits.Pixels:
            return d
    }

    switch(t)
    {
        case DimensionUnits.Centimeters:
            //Already in centimeteres
            break;
        case DimensionUnits.Inches:
            value = value /2.54;
            break;
        case DimensionUnits.Millimeters:
            value = value * 10;
            break;
        case DimensionUnits.Pixels:
            return d
    }

    return new Dimension(value, t)
}

export function ToPixels(d : Dimension, pxPerUnit : number, unit : DimensionUnits) : number {
    return ToType(d, unit).value * pxPerUnit
}

export function ToUnitName(unit : DimensionUnits) : string
{
   switch(unit)
    {
        case DimensionUnits.Millimeters:
            return "mm"
        case DimensionUnits.Inches:
            return "in"
        case DimensionUnits.Centimeters:
            return "cm"
        case DimensionUnits.Pixels:
            return "px"
    }
}
export enum LaserMode {
    Cut,
    Score,
    Engrave
}
export class ColorMode {
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

export class Graphic {
    constructor(
        public guid: string,
        public name: string,
        public mimetype: string,
        public url: string,
        public colorModes: ColorMode[],
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
        public graphics: Graphic[]) {}
}
