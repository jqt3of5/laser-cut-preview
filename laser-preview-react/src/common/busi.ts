import {GraphicGroup} from "./dto";
import {ConvertTo, Dimension, DimensionUnits, MultScaler} from "./Dimension";

export function ConvertGraphicToUnits(graphic : GraphicGroup, unit: DimensionUnits) : GraphicGroup
{
    return {...graphic,
        width: ConvertTo(graphic.width, unit),
        height: ConvertTo(graphic.height, unit),
        posX: ConvertTo(graphic.posX, unit),
        posY: ConvertTo(graphic.posY, unit),
        subGraphics: graphic.subGraphics.map(sub => {
            return {...sub,
                width: ConvertTo(sub.width, unit),
                height: ConvertTo(sub.height, unit),
                posX: ConvertTo(sub.posX, unit),
                posY: ConvertTo(sub.posY, unit)}
        })}
}

export function ResizeGraphicGroup(group : GraphicGroup, newWidth : Dimension, newHeight : Dimension) : GraphicGroup
{
    let scaleX = newWidth.value/group.width.value
    let scaleY = newHeight.value/group.height.value

    return ScaleGraphicGroup(group, scaleX, scaleY)
}

export function ScaleGraphicGroup(group : GraphicGroup, scaleX : number, scaleY : number) : GraphicGroup
{
    return {...group,
        subGraphics: group.subGraphics
            .map(graphic => {
                return {...graphic,
                    posX: MultScaler(graphic.posX, scaleX),
                    posY: MultScaler(graphic.posY,scaleY),
                    width: MultScaler(graphic.width, scaleX),
                    height: MultScaler(graphic.height, scaleY),
                }
            }),
        width: MultScaler(group.width, scaleX),
        height: MultScaler(group.height, scaleY)
    }
}