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

export enum DrawableObjectType {
    SubGraphic = "SvgSubGraphic",
    SvgGraphicGroup = "SvgGraphicGroup",
    TextObject = "TextObject"
}

export type SvgSubGraphic ={
    type : DrawableObjectType.SubGraphic,
    guid: string,
    url: string,
    mode: LaserMode,
    mimetype: string,
    posX : Dimension,
    posY : Dimension,
    width: Dimension,
    height : Dimension
}

export type SvgGraphicGroup = {

    type : DrawableObjectType.SvgGraphicGroup,
    guid: string,
    name: string,
    mimetype: string,
    url: string,
    subGraphics: SvgSubGraphic[],
    angle : number,
    posX : Dimension,
    posY : Dimension,
    width: Dimension,
    height : Dimension
}

export type TextObject = {
    type : DrawableObjectType.TextObject,
    text : string,
    mode: LaserMode,
    font : string,
    fontSize : number,
    textAlign: CanvasTextAlign,
    posX : Dimension,
    posY : Dimension,
}

export type DrawableObject = SvgSubGraphic | SvgGraphicGroup | TextObject

export interface Project {
        projectId: string,
        material:Material,
        boardWidth : Dimension,
        boardHeight : Dimension,
        objects : DrawableObject [],
}

export enum OrderStatus
{
    Ordered= 'Ordered',
    Paid ='Paid',
    Processing ='Processing',
    Shipped ='Shipped',
    Closed = 'Closed'
}

export interface Customer {
    name: string
    email: string
    streetAddress: string
    city: string
    state: string
    country: string
    zipcode: string
    phoneNumber: string
}

export interface Order {
    customer : Customer
    projectGuid : string,
    cost: number
    orderedDate : number | null
    orderId : string | null
    status : OrderStatus | null
}
