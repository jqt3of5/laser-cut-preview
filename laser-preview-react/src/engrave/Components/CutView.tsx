import React, {Dispatch, MouseEvent, useEffect, useReducer} from "react";
import {
    DrawableObject,
    DrawableObjectType, LaserMode,
    Material,
    SvgGraphicGroup,
    SvgSubGraphic,
    TextObject,
} from "../../common/dto";
import {Dimension, DimensionUnits, FromPixels, ToPixels, ToUnitName} from "../../common/Dimension";
import {EngraveActionType, EngraveAppAction} from "../Views/EngraveAppState";
import {ScaleGraphicGroup} from "../../common/busi";

interface LoadedGraphicGroup {
    type: DrawableObjectType.GraphicGroup
    object: SvgGraphicGroup
    loadedGraphics : LoadedGraphic []
    //Canvas pixels
    width : number
    height : number
    translateX : number
    translateY : number
    scaleX : number
    scaleY : number
    startX : number
    startY : number
}

interface LoadedGraphic {
    type: DrawableObjectType.SubGraphic
    image : HTMLImageElement | null
    object : SvgSubGraphic

    //Canvas pixels
    width : number
    height : number
    translateX : number
    translateY : number
    scaleX : number
    scaleY : number
    startX : number
    startY : number
}

interface LoadedTextObject {
    type: DrawableObjectType.TextObject
    object : TextObject

    //Canvas pixels
    width : number
    height : number
    translateX : number
    translateY : number
    scaleX : number
    scaleY : number
    startX : number
    startY : number
}

type LoadedDrawableObject = LoadedGraphicGroup | LoadedTextObject | LoadedGraphic

export enum SnapTo {
    Continuous,
    OneHalf,
    OneQuarter,
    OneEighth,
    OneSixteenth,
    OneCentimeter,
    OneMillimeter
}
export interface CutViewProps {
    snapTo : SnapTo
    boardWidth: Dimension
    boardHeight: Dimension
    material: Material
    objects: DrawableObject[]
    dispatch: Dispatch<EngraveAppAction>
}
enum MouseMode {
    Translate,
   ScaleTopLeft,
   ScaleTopRight,
   ScaleBottomRight,
   ScaleBottomLeft,
   Rotate,
   None
}
export interface CutViewState {
    mouseMode : MouseMode
    mouseX : number
    mouseY : number
    selectedGraphicIndex: number
    hoverGraphicIndex: number
    objects: LoadedDrawableObject[]
    background : HTMLImageElement | null
}

enum CutViewActionType {
    GraphicsLoaded,
    BackgroundLoaded,
    Select,
    Transform,
    Hover,
    Finish
}
type CutViewAction =
    | {type: CutViewActionType.GraphicsLoaded, objects: LoadedDrawableObject[]}
    | {type: CutViewActionType.BackgroundLoaded, background: HTMLImageElement}
    | {type: CutViewActionType.Select, mouseX: number, mouseY: number}
    | {type: CutViewActionType.Hover, mouseX: number, mouseY: number}
    | {type: CutViewActionType.Transform, mousedX: number, mousedY: number}
    | {type: CutViewActionType.Finish}

export function ConvertLoadedObjectToObject(loadedObject : LoadedDrawableObject, pxPerUnit : number, unit: DimensionUnits) : DrawableObject
{
    switch(loadedObject.type) {
        case DrawableObjectType.GraphicGroup:
            return {...loadedObject.object,
                posX: new Dimension((loadedObject.startX + loadedObject.translateX) / pxPerUnit, unit),
                posY: new Dimension((loadedObject.startY + loadedObject.translateY) / pxPerUnit, unit),
                width: new Dimension(loadedObject.width / pxPerUnit, unit),
                height:  new Dimension(loadedObject.height / pxPerUnit, unit),
                subGraphics: loadedObject.loadedGraphics.map(graphic => {
                        return {...graphic.object,
                            posX: new Dimension(graphic.translateX / pxPerUnit, unit),
                            posY: new Dimension(graphic.translateY / pxPerUnit, unit),
                            width: new Dimension(graphic.width / pxPerUnit, unit),
                            height: new Dimension(graphic.height / pxPerUnit, unit),
                        }
                    })
            }
            break;
        case DrawableObjectType.SubGraphic:
            return {...loadedObject.object,
                    posX: new Dimension((loadedObject.startX + loadedObject.translateX) / pxPerUnit, unit),
                    posY: new Dimension((loadedObject.startY + loadedObject.translateY) / pxPerUnit, unit),
                    width: new Dimension(loadedObject.width / pxPerUnit, unit),
                    height: new Dimension(loadedObject.height / pxPerUnit, unit),
                    }
        case DrawableObjectType.TextObject:
            return {...loadedObject.object,
                posX: new Dimension((loadedObject.startX + loadedObject.translateX) / pxPerUnit, unit),
                posY: new Dimension((loadedObject.startY + loadedObject.translateY) / pxPerUnit, unit),
                }
    }
}

function reduce(state: CutViewState, action: CutViewAction)
{
    //TODO: How do we pass state up to the parent component?
   switch(action.type)
   {
       case CutViewActionType.GraphicsLoaded:
           return {...state, objects:action.objects}
       case CutViewActionType.BackgroundLoaded:
           return {...state, background:action.background}
       case CutViewActionType.Select:
           //Locate the first graphic that surrounds the cursor
           let selectedGraphicIndex = state.objects.findIndex(object => {
               return IsOnGraphicHandle(action.mouseX, action.mouseY, object) !==MouseMode.None
           })

           let mouseMode = selectedGraphicIndex===-1 ? MouseMode.None : IsOnGraphicHandle(action.mouseX, action.mouseY, state.objects[selectedGraphicIndex])

           return {...state, selectedGraphicIndex: selectedGraphicIndex, mouseX: action.mouseX, mouseY: action.mouseY, mouseMode: mouseMode}
       case CutViewActionType.Hover:
           let hoverGraphicIndex = state.objects.findIndex(group => {
               return IsOnGraphicHandle(action.mouseX, action.mouseY, group) !==MouseMode.None
           })

           return {...state, hoverGraphicIndex: hoverGraphicIndex, selectedGraphicIndex: -1}
       case CutViewActionType.Finish:
           return {...state, selectedGraphicIndex: -1,  mouseMode: MouseMode.None}
       case CutViewActionType.Transform:

           let translateX = 0, translateY = 0, scaleX = 1, scaleY = 1
           let width = state.objects[state.selectedGraphicIndex].width
           let height = state.objects[state.selectedGraphicIndex].height

           switch(state.mouseMode)
           {
               case MouseMode.None:
                   break;
               case MouseMode.Translate:
                   translateX = action.mousedX
                   translateY = action.mousedY
                   break;
               case MouseMode.ScaleBottomRight:
                   scaleX = (width + action.mousedX) / width
                   scaleY = (height + action.mousedY) / height
                   scaleX = scaleX < .05 ? .05 : scaleX
                   scaleY = scaleY < .05 ? .05 : scaleY
                   scaleY = scaleX = Math.min(scaleY, scaleX)
                   break;
               case MouseMode.ScaleBottomLeft:
                   scaleX = (width - action.mousedX) / width
                   scaleY = (height + action.mousedY) / height

                   scaleX = scaleX < .05 ? .05 : scaleX
                   scaleY = scaleY < .05 ? .05 : scaleY
                   //aspect lock
                   scaleY = scaleX = Math.min(scaleY, scaleX)
                   translateX = width * (1 - scaleX)
                   translateY = 0
                   break;
               case MouseMode.ScaleTopRight:
                   scaleX = (width + action.mousedX) / width
                   scaleY = (height - action.mousedY) / height

                   scaleX = scaleX < .05 ? .05 : scaleX
                   scaleY = scaleY < .05 ? .05 : scaleY
                   //aspect lock
                   scaleY = scaleX = Math.min(scaleY, scaleX)

                   translateX = 0
                   translateY = height * (1 - scaleY)
                   break;
               case MouseMode.ScaleTopLeft:
                   scaleX = (width - action.mousedX) / width
                   scaleY = (height - action.mousedY) / height
                   scaleX = scaleX < .05 ? .05 : scaleX
                   scaleY = scaleY < .05 ? .05 : scaleY
                   //aspect lock
                   scaleY = scaleX = Math.min(scaleY, scaleX)

                   translateX = width * (1 - scaleX)
                   translateY = height * (1 - scaleY)
                   break;
               case MouseMode.Rotate:
                   break;
           }

           console.log(state.selectedGraphicIndex)
           console.log(translateY)
           console.log(translateX)
           return {...state, objects: state.objects.map(group => {
                   if (group === state.objects[state.selectedGraphicIndex])
                   {
                       return {...group,
                           translateX: translateX, translateY: translateY,
                           scaleX: scaleX, scaleY: scaleY}
                   }
                   return group
               })}
   }
}

CutView.resizeHandleWidth = 15;
CutView.pxPerUnit = 100;
CutView.shadowBlur = 15;

export function CutView (props : CutViewProps) {

    const [state, dispatch] = useReducer(reduce, {
        mouseMode: MouseMode.None,
        selectedGraphicIndex: -1,
        hoverGraphicIndex: -1,
        //In canvas pixels, not client pixels
        mouseX: 0,
        mouseY: 0,
        objects: [],
        background: null
    })

    let canvasRef = React.createRef<HTMLCanvasElement>()

    useEffect(() => {

    }, [])
    useEffect(() => {
        if (canvasRef.current !==null) {
            canvasRef.current.width = props.boardWidth.value * CutView.pxPerUnit + CutView.shadowBlur*2
            canvasRef.current.height = props.boardHeight.value * CutView.pxPerUnit + CutView.shadowBlur*2
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.boardWidth, props.boardHeight])

    useEffect(() => {
        //load all a graphics
        loadGraphics()
    }, [props.objects, props.boardWidth, props.boardHeight])

    useEffect(() => {
        loadImage(`/materials/${props.material.id}`).then(background => {
            //TODO: Does setstate do a diff on the state? Or will this change the whole thing?
            dispatch({type: CutViewActionType.BackgroundLoaded, background:background})
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.material])

    useEffect(() => {
        if (canvasRef.current !== null)
        {
            let ctx = canvasRef.current.getContext("2d")
            if (ctx !== null) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

                if (state.background !== null) {
                    ctx.shadowBlur = CutView.shadowBlur
                    ctx.shadowColor = 'gray'
                    ctx.drawImage(state.background, CutView.shadowBlur, CutView.shadowBlur)
                    ctx.shadowBlur = 0
                }
                ctx.textBaseline = "bottom"
                drawGraphics(ctx)
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.background, state.objects, state.hoverGraphicIndex, state.selectedGraphicIndex])

    return (
        <canvas ref={canvasRef} className={"cut-material"} onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseMove={onMouseMove}/>
    )

    function loadGraphics() {
        let promises = props.objects.map(object => {
            return new Promise<LoadedDrawableObject>(resolve => {
                switch(object.type)
                {
                    case DrawableObjectType.GraphicGroup:
                        let promises = object.subGraphics.map(graphic => {
                            return loadImage(graphic.url).then<LoadedGraphic>(image => {
                                return {
                                    type: DrawableObjectType.SubGraphic,
                                    image: image, object: graphic,
                                    height: ToPixels(graphic.height, CutView.pxPerUnit, props.boardHeight.unit),
                                    width: ToPixels(graphic.width, CutView.pxPerUnit, props.boardWidth.unit),
                                    translateX: ToPixels(graphic.posX, CutView.pxPerUnit, props.boardHeight.unit),
                                    translateY: ToPixels(graphic.posY, CutView.pxPerUnit, props.boardWidth.unit),
                                    scaleX : 1,
                                    scaleY : 1,
                                    startX: ToPixels(object.posX, CutView.pxPerUnit, props.boardHeight.unit),
                                    startY: ToPixels(object.posY, CutView.pxPerUnit, props.boardWidth.unit),
                                }
                            })
                        })

                        Promise.all(promises).then<LoadedGraphicGroup>(loadedGraphics => {
                            return {
                                type: DrawableObjectType.GraphicGroup,
                                loadedGraphics: loadedGraphics, object: object,
                                height: ToPixels(object.height, CutView.pxPerUnit, props.boardHeight.unit),
                                width: ToPixels(object.width, CutView.pxPerUnit, props.boardWidth.unit),
                                startX: ToPixels(object.posX, CutView.pxPerUnit, props.boardHeight.unit),
                                startY: ToPixels(object.posY, CutView.pxPerUnit, props.boardWidth.unit),
                                translateX: 0,
                                translateY: 0,
                                scaleX: 1,
                                scaleY: 1
                            }
                        }).then(value => resolve(value))
                        break;
                    case DrawableObjectType.SubGraphic:
                        loadImage(object.url).then<LoadedGraphic>(image => {
                            return {
                                type: DrawableObjectType.SubGraphic,
                                image: image, object: object,
                                height: ToPixels(object.height, CutView.pxPerUnit, props.boardHeight.unit),
                                width: ToPixels(object.width, CutView.pxPerUnit, props.boardWidth.unit),
                                translateX: ToPixels(object.posX, CutView.pxPerUnit, props.boardHeight.unit),
                                translateY: ToPixels(object.posY, CutView.pxPerUnit, props.boardWidth.unit),
                                scaleX : 1,
                                scaleY : 1,
                                startX: ToPixels(object.posX, CutView.pxPerUnit, props.boardHeight.unit),
                                startY: ToPixels(object.posY, CutView.pxPerUnit, props.boardWidth.unit),
                            }
                        }).then(value => resolve(value))
                        break;
                    case DrawableObjectType.TextObject:

                        let width = 0
                        let height = 0
                        if (canvasRef.current !== null)
                        {
                            let ctx = canvasRef.current.getContext("2d")
                            if (ctx !==null) {
                                ctx.font = `${object.fontSize}px ${object.font}`
                                let linesMeasures = object.text.split("\n").map(line => ctx!.measureText(line))

                                width  = Math.max(...linesMeasures.map(m => m.width))
                                height = linesMeasures.map(measure => measure.actualBoundingBoxAscent).reduce((previousValue, currentValue) => {
                                    return previousValue + currentValue
                                })
                            }
                        }
                        resolve({
                            type: DrawableObjectType.TextObject, object: object,
                            height: height,
                            width: width,
                            startX: ToPixels(object.posX, CutView.pxPerUnit, props.boardHeight.unit),
                            startY: ToPixels(object.posY, CutView.pxPerUnit, props.boardWidth.unit),
                            translateX: 0,
                            translateY: 0,
                            scaleX: 1,
                            scaleY: 1
                        })
                        break;
                }
            })
        })

        Promise.all(promises).then(groups => {
            dispatch({type: CutViewActionType.GraphicsLoaded, objects:groups})
        })
    }

    function drawGraphics(ctx : CanvasRenderingContext2D)  {
        for (const object of state.objects) {
            let startX = object.startX + object.translateX
            let startY = object.startY + object.translateY
            let width = object.width * object.scaleX
            let height = object.height * object.scaleY

            //draw boundary rectangle
            ctx.beginPath()
            ctx.lineWidth = 2
            ctx.strokeStyle = '#7777ff'
            ctx.rect(startX, startY, width, height)
            ctx.stroke()

            drawScaleHandles(startX, startY, width,height)

            switch (object.type) {
                case DrawableObjectType.GraphicGroup:
                    for (const graphic of object.loadedGraphics) {
                        if (graphic.image !== null) {
                            //draw image
                            ctx.drawImage(graphic.image,
                                startX + graphic.translateX * object.scaleX,
                                startY + graphic.translateY * object.scaleY,
                                graphic.width * object.scaleX,
                                graphic.height * object.scaleY)
                        }
                    }
                    break;
                case DrawableObjectType.SubGraphic:
                    if (object.image !== null) {
                        //draw image
                        ctx.drawImage(object.image,
                            startX + object.translateX * object.scaleX,
                            startY + object.translateY * object.scaleY,
                            object.width * object.scaleX,
                            object.height * object.scaleY)
                    }
                    break;
                case DrawableObjectType.TextObject:
                    ctx.font = `${object.object.fontSize*object.scaleX}px ${object.object.font}`
                    ctx.strokeStyle = 'black'
                    ctx.fillStyle = 'black'
                    ctx.lineWidth = 1

                    ctx.save()
                    ctx.translate(startX, startY)
                    ctx.textAlign =  object.object.textAlign
                    for (const line of object.object.text.split('\n')) {

                        ctx.translate(0, ctx.measureText(line).actualBoundingBoxAscent)

                        let textStart = 0
                        switch(object.object.textAlign)
                        {
                            case "center":
                                textStart = width/2
                                break;
                            case "end":
                            case "right":
                                textStart = width
                                break;
                            case "left":
                            case "start":
                                break;
                        }

                        switch(object.object.mode)
                        {
                            case LaserMode.Cut:
                            case LaserMode.Score:
                                ctx.strokeText(line, textStart, 0, width)
                                break;
                            case LaserMode.Engrave:
                                ctx.fillText(line, textStart, 0, width)
                                break;
                        }
                    }
                    ctx.restore()
                    break;
            }

            if (state.selectedGraphicIndex !==-1 && object===state.objects[state.selectedGraphicIndex])
                {
                    // if (state.mouseMode===MouseMode.Translate)
                    // {
                    //     drawTranslation(ctx, startX, startY, width, height)
                    // }
                    // else
                    // {
                        drawDimensions(ctx, startX, startY, width, height)
                    // }
                }
                else if (state.hoverGraphicIndex !==-1 && object===state.objects[state.hoverGraphicIndex]) {
                    //draw measurements
                    drawDimensions(ctx, startX, startY, width, height)
                }
            }
            function drawScaleHandles(startX : number, startY : number, width : number,height : number){
                //draw scale handles
                ctx.beginPath()
                ctx.fillStyle = "white"
                ctx.lineWidth = 4
                let halfSize = CutView.resizeHandleWidth / 2
                ctx.rect(startX - halfSize, startY - halfSize, CutView.resizeHandleWidth, CutView.resizeHandleWidth)
                ctx.rect(startX + width - halfSize, startY - halfSize, CutView.resizeHandleWidth, CutView.resizeHandleWidth)
                ctx.rect(startX - halfSize, startY + height - halfSize, CutView.resizeHandleWidth, CutView.resizeHandleWidth)
                ctx.rect(startX + width - halfSize, startY + height- halfSize, CutView.resizeHandleWidth, CutView.resizeHandleWidth)
                ctx.stroke()
                ctx.fill()
            }
        }

    // function drawTranslation(ctx : CanvasRenderingContext2D, startX : number, startY : number, width: number, height: number)
    // {
    //     ctx.beginPath()
    //     ctx.fillStyle = "black"
    //     ctx.font = "25px Arial"
    //     ctx.strokeStyle = "black"
    //     ctx.lineWidth = 2
    //
    //     let y = FromPixels(startY, CutView.pxPerUnit, props.boardHeight.unit)
    //     ctx.moveTo(startX, startY)
    //     ctx.lineTo(startX, 0)
    //     ctx.save()
    //     ctx.translate(startX, startY/2)
    //     ctx.rotate(-Math.PI/2)
    //     ctx.fillText(`${y.value.toFixed(3)}${ToUnitName(y.unit)}`, -45, -8)
    //     ctx.fill()
    //     ctx.restore()
    //
    //     let x = FromPixels(startX, CutView.pxPerUnit, props.boardWidth.unit)
    //     ctx.moveTo(startX, startY)
    //     ctx.lineTo(0, startY)
    //     ctx.fillText(`${x.value.toFixed(3)}${ToUnitName(x.unit)}`, startX/2 - 45, startY - 8)
    //
    //     ctx.stroke()
    // }

    function drawDimensions(ctx : CanvasRenderingContext2D, startX : number, startY : number, width: number, height: number) {
        //draw measurements
        ctx.beginPath()
        ctx.fillStyle = "black"
        ctx.font = "25px Arial"

        ctx.strokeStyle = "black"
        ctx.lineWidth = 2

        ctx.moveTo(startX, startY)
        ctx.lineTo(startX, startY - 64)
        ctx.moveTo(startX, startY - 32)
        ctx.lineTo(startX + width, startY - 32)

        ctx.moveTo(startX + width, startY)
        ctx.lineTo(startX + width, startY - 64)

        ctx.moveTo(startX, startY)
        ctx.lineTo(startX - 64, startY)
        ctx.moveTo(startX - 32, startY)
        ctx.lineTo(startX - 32, startY + height)

        ctx.moveTo(startX, startY + height)
        ctx.lineTo(startX - 64, startY + height)

        ctx.stroke()

        //Draw width
        let w = FromPixels(width, CutView.pxPerUnit, props.boardWidth.unit)
        ctx.fillText(`${w.value.toFixed(3)}${ToUnitName(w.unit)}`, startX + width / 2 - 45, startY - 38)

        //draw height
        let h = FromPixels(height, CutView.pxPerUnit, props.boardHeight.unit)
        ctx.save()
        ctx.translate(startX, startY + height / 2)
        ctx.rotate(-Math.PI / 2)
        ctx.fillText(`${h.value.toFixed(3)}${ToUnitName(h.unit)}`, -45, -38)
        ctx.fill()
        ctx.restore()
    }

    function onMouseDown (event : MouseEvent<HTMLCanvasElement>) {
        if (canvasRef.current !==null)
        {
            let rect = canvasRef.current.getBoundingClientRect()
            let canvasX = (event.clientX - rect.x) / rect.width * canvasRef.current.width
            let canvasY = (event.clientY - rect.y) / rect.height * canvasRef.current.height

            dispatch({type: CutViewActionType.Select, mouseX: canvasX,  mouseY:canvasY})
        }
    }

    function onMouseUp (event : MouseEvent<HTMLCanvasElement>) {
        if (state.selectedGraphicIndex !==-1)
        {
            let object = state.objects[state.selectedGraphicIndex]

            let newGraphic = ConvertLoadedObjectToObject(object, CutView.pxPerUnit, props.boardWidth.unit)
            newGraphic = ScaleGraphicGroup(newGraphic, object.scaleX, object.scaleY)

            //TODO: All the prior logic should really be in the reducer function, but unfortunately I need a way to pass the parent dispatcher into it.
            props.dispatch({type: EngraveActionType.ObjectChanged, oldObject: object.object, object: newGraphic})
        }
        dispatch({type: CutViewActionType.Finish})
    }

    function onMouseMove (event : MouseEvent<HTMLCanvasElement>) {
        if (canvasRef.current !==null)
        {
            let rect = canvasRef.current.getBoundingClientRect()
            let canvasX = (event.clientX - rect.x) / rect.width * canvasRef.current.width
            let canvasY = (event.clientY - rect.y) / rect.height * canvasRef.current.height

            if (state.mouseMode===MouseMode.None)
            {
                canvasRef.current.style.cursor = state.objects.map(group => {
                    let mode = IsOnGraphicHandle(canvasX, canvasY, group)
                    switch(mode)
                    {
                        case MouseMode.ScaleBottomLeft:
                            return "sw-resize"
                        case MouseMode.ScaleBottomRight:
                            return "se-resize"
                        case MouseMode.ScaleTopRight:
                            return "ne-resize"
                        case MouseMode.ScaleTopLeft:
                            return "nw-resize"
                    }
                    return null
                }).find(c => c !==null) ?? "default"
            }

            if (state.mouseMode !==MouseMode.None)
            {
                dispatch({type: CutViewActionType.Transform, mousedX:canvasX - state.mouseX, mousedY: canvasY - state.mouseY})
            }
            else
            {
                dispatch({type: CutViewActionType.Hover, mouseX:canvasX, mouseY: canvasY})
            }
        }
    }

    function loadImage(url : string): Promise<HTMLImageElement> {
        return new Promise<HTMLImageElement>(resolve => {

            let image = new Image()
            image.src = process.env.REACT_APP_API + url
            image.onload = () => {
                resolve(image)
            }
        })
    }


}

function IsInRectBounds(tx : number, ty : number, x : number, y:number, w: number, h:number): boolean {
    return tx <= x + w && tx >= x && ty >= y && ty <= y + h
}

function IsOnGraphicHandle(canvasX:number, canvasY:number, graphic : LoadedDrawableObject) : MouseMode {
    let clickTargetSize = CutView.resizeHandleWidth * 2
    if (IsInRectBounds(canvasX, canvasY, graphic.startX + graphic.translateX - CutView.resizeHandleWidth, graphic.startY + graphic.translateY - CutView.resizeHandleWidth, clickTargetSize, clickTargetSize))
    {
        return MouseMode.ScaleTopLeft
    }
    if (IsInRectBounds(canvasX, canvasY, graphic.startX + graphic.translateX + graphic.width - CutView.resizeHandleWidth, graphic.startY + graphic.translateY - CutView.resizeHandleWidth, clickTargetSize, clickTargetSize))
    {
        return MouseMode.ScaleTopRight
    }
    if (IsInRectBounds(canvasX, canvasY, graphic.startX + graphic.translateX - CutView.resizeHandleWidth, graphic.startY + graphic.translateY + graphic.height - CutView.resizeHandleWidth, clickTargetSize, clickTargetSize))
    {
        return MouseMode.ScaleBottomLeft
    }
    if (IsInRectBounds(canvasX, canvasY, graphic.startX + graphic.translateX + graphic.width - CutView.resizeHandleWidth, graphic.startY + graphic.translateY + graphic.height- CutView.resizeHandleWidth, clickTargetSize, clickTargetSize) )
    {
        return MouseMode.ScaleBottomRight
    }

    if (IsInRectBounds(canvasX, canvasY, graphic.startX + graphic.translateX, graphic.startY + graphic.translateY, graphic.width, graphic.height))
    {
        return MouseMode.Translate
    }
    return MouseMode.None
}
