import {DrawableObject, DrawableObjectType} from "./dto";
import {ConvertTo, Dimension, DimensionUnits, MultScaler} from "./Dimension";

export function ConvertObjectUnits(object : DrawableObject, unit: DimensionUnits) : DrawableObject
{
    switch(object.type)
    {
        case DrawableObjectType.TextObject:
            return {...object,
                posX: ConvertTo(object.posX, unit),
                posY: ConvertTo(object.posY, unit)}
        case DrawableObjectType.SvgGraphicGroup:
            return {...object,
                width: ConvertTo(object.width, unit),
                height: ConvertTo(object.height, unit),
                posX: ConvertTo(object.posX, unit),
                posY: ConvertTo(object.posY, unit),
                subGraphics: object.subGraphics.map(sub => {
                    return {...sub,
                        width: ConvertTo(sub.width, unit),
                        height: ConvertTo(sub.height, unit),
                        posX: ConvertTo(sub.posX, unit),
                        posY: ConvertTo(sub.posY, unit)}
                })}
        case DrawableObjectType.SubGraphic:
            return {...object,
                width: ConvertTo(object.width, unit),
                height: ConvertTo(object.height, unit),
                posX: ConvertTo(object.posX, unit),
                posY: ConvertTo(object.posY, unit)}
        default:
            return object
    }
}

export function ResizeGraphicGroup<Graphic extends DrawableObject>(group : Graphic, newWidth : Dimension, newHeight : Dimension) : Graphic
{
    switch(group.type)
    {
        case DrawableObjectType.SubGraphic:
        case DrawableObjectType.SvgGraphicGroup:
            let scaleX = newWidth.value/group.width.value
            let scaleY = newHeight.value/group.height.value

            return ScaleGraphicGroup(group, scaleX, scaleY)
        case DrawableObjectType.TextObject:
            //TODO: TextObjects don't scale based on width/height
            return group

        default:
            return group
    }
}

export function ScaleGraphicGroup<Graphic extends DrawableObject>(object: Graphic, scaleX : number, scaleY : number) : Graphic
{
    switch(object.type)
    {
        case DrawableObjectType.TextObject:
            return {...object,
                fontSize: (object.fontSize * scaleX).toFixed(0)
            }
        case DrawableObjectType.SubGraphic:
            return {...object,
                width: MultScaler(object.width, scaleX),
                height: MultScaler(object.height, scaleY)
            }
        case DrawableObjectType.SvgGraphicGroup:
            return {
                ...object,
                width: MultScaler(object.width, scaleX),
                height: MultScaler(object.height, scaleY),
                subGraphics: object.subGraphics
                    .map(graphic => {
                        return {
                            ...graphic,
                            posX: MultScaler(graphic.posX, scaleX),
                            posY: MultScaler(graphic.posY, scaleY),
                            width: MultScaler(graphic.width, scaleX),
                            height: MultScaler(graphic.height, scaleY),
                        }
                    })
            }
        default:
            return object
    }
}