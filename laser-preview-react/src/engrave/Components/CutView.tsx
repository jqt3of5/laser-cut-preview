import React, {Dispatch, MouseEvent, useEffect, useReducer} from "react";
import {GraphicGroup, Material, SvgSubGraphic,} from "../../common/dto";
import {
    Dimension,
    DimensionUnits,
    FromPixels,
    ToPixels,
    ToUnitName
} from "../../common/Dimension";
import {EngraveActionType, EngraveAppAction} from "../Views/EngraveAppState";
import {ScaleGraphicGroup} from "../../common/busi";

interface LoadedGraphicGroup {
    group: GraphicGroup
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
    image : HTMLImageElement | null
    subGraphic : SvgSubGraphic

    //Canvas pixels
    width : number
    height : number
    translateX : number
    translateY : number
}

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
    graphics: GraphicGroup[]
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
    groups: LoadedGraphicGroup[]
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
    | {type: CutViewActionType.GraphicsLoaded, groups: LoadedGraphicGroup[]}
    | {type: CutViewActionType.BackgroundLoaded, background: HTMLImageElement}
    | {type: CutViewActionType.Select, mouseX: number, mouseY: number}
    | {type: CutViewActionType.Hover, mouseX: number, mouseY: number}
    | {type: CutViewActionType.Transform, mousedX: number, mousedY: number}
    | {type: CutViewActionType.Finish}

export function ConvertLoadedGraphicGroupToUnitsFromPixels(loadedGroup : LoadedGraphicGroup, pxPerUnit : number, unit: DimensionUnits) : GraphicGroup
{
    return {...loadedGroup.group,
        subGraphics: loadedGroup.loadedGraphics
            .map(graphic => {
                return {...graphic.subGraphic,
                    posX: new Dimension(graphic.translateX / pxPerUnit, unit),
                    posY: new Dimension(graphic.translateY / pxPerUnit, unit),
                    width: new Dimension(graphic.width / pxPerUnit, unit),
                    height: new Dimension(graphic.height / pxPerUnit, unit),
                }
            }),
        posX: new Dimension((loadedGroup.startX + loadedGroup.translateX) / pxPerUnit, unit),
        posY: new Dimension((loadedGroup.startY + loadedGroup.translateY) / pxPerUnit, unit),
        width: new Dimension(loadedGroup.width / pxPerUnit, unit),
        height:  new Dimension(loadedGroup.height / pxPerUnit, unit)
    }
}

function reduce(state: CutViewState, action: CutViewAction)
{
    //TODO: How do we pass state up to the parent component?
   switch(action.type)
   {
       case CutViewActionType.GraphicsLoaded:
           return {...state, groups:action.groups}
       case CutViewActionType.BackgroundLoaded:
           return {...state, background:action.background}
       case CutViewActionType.Select:
           //Locate the first graphic that surrounds the cursor
           let selectedGraphicIndex = state.groups.findIndex(group => {
               return IsOnGraphicHandle(action.mouseX, action.mouseY, group) !==MouseMode.None
           })

           let mouseMode = selectedGraphicIndex===-1 ? MouseMode.None : IsOnGraphicHandle(action.mouseX, action.mouseY, state.groups[selectedGraphicIndex])

           return {...state, selectedGraphicIndex: selectedGraphicIndex, mouseX: action.mouseX, mouseY: action.mouseY, mouseMode: mouseMode}
       case CutViewActionType.Hover:
           let hoverGraphicIndex = state.groups.findIndex(group => {
               return IsOnGraphicHandle(action.mouseX, action.mouseY, group) !==MouseMode.None
           })

           return {...state, hoverGraphicIndex: hoverGraphicIndex, selectedGraphicIndex: -1}
       case CutViewActionType.Finish:
           return {...state, selectedGraphicIndex: -1,  mouseMode: MouseMode.None}
       case CutViewActionType.Transform:

           let translateX = 0, translateY = 0, scaleX = 1, scaleY = 1
           let width = state.groups[state.selectedGraphicIndex].width
           let height = state.groups[state.selectedGraphicIndex].height

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

           return {...state, groups: state.groups.map(group => {
                   if (group === state.groups[state.selectedGraphicIndex])
                   {
                       return {...group,
                           translateX: translateX, translateY: translateY,
                           scaleX: scaleX, scaleY: scaleY,
                           loadedGraphics: group.loadedGraphics.map(lg => {
                               return {...lg}
                           })}
                   }
                   return group
               })}
   }
}

CutView.resizeHandleWidth = 15;
CutView.pxPerUnit = 100;
export function CutView (props : CutViewProps) {

    const [state, dispatch] = useReducer(reduce, {
        mouseMode: MouseMode.None,
        selectedGraphicIndex: -1,
        hoverGraphicIndex: -1,
        //In canvas pixels, not client pixels
        mouseX: 0,
        mouseY: 0,
        groups: [],
        background: null
    })

    let canvasRef = React.createRef<HTMLCanvasElement>()

    useEffect(() => {

    }, [])
    useEffect(() => {
        if (canvasRef.current !==null) {
            canvasRef.current.width = props.boardWidth.value * CutView.pxPerUnit
            canvasRef.current.height = props.boardHeight.value * CutView.pxPerUnit
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.boardWidth, props.boardHeight])

    useEffect(() => {
        let promises = props.graphics.map(group => {

            let promises = group.subGraphics.map(graphic => {
                return loadImage(graphic.url).then<LoadedGraphic>(image => {
                    return {
                        image: image, subGraphic: graphic,
                        height: ToPixels(graphic.height, CutView.pxPerUnit, props.boardHeight.unit),
                        width: ToPixels(graphic.width, CutView.pxPerUnit, props.boardWidth.unit),
                        translateX: ToPixels(graphic.posX, CutView.pxPerUnit, props.boardHeight.unit),
                        translateY: ToPixels(graphic.posY, CutView.pxPerUnit, props.boardWidth.unit),
                    }
                })
            })

            return Promise.all(promises).then<LoadedGraphicGroup>(loadedGraphics => {
                return {
                    loadedGraphics: loadedGraphics, group: group,
                    height: ToPixels(group.height, CutView.pxPerUnit, props.boardHeight.unit),
                    width: ToPixels(group.width, CutView.pxPerUnit, props.boardWidth.unit),
                    startX: ToPixels(group.posX, CutView.pxPerUnit, props.boardHeight.unit),
                    startY: ToPixels(group.posY, CutView.pxPerUnit, props.boardWidth.unit),
                    translateX: 0,
                    translateY: 0,
                    scaleX: 1,
                    scaleY: 1

                }
            })
        })
        Promise.all(promises).then(groups => {
            dispatch({type: CutViewActionType.GraphicsLoaded, groups:groups})
        })
    }, [props.graphics, props.boardWidth, props.boardHeight])

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
            if (ctx !==null) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height )

                if (state.background !== null) {
                    ctx.drawImage(state.background, 0, 0)
                }
                drawGraphics(ctx)
            }
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.background, state.groups, state.hoverGraphicIndex, state.selectedGraphicIndex])

    return (
        <div className={"cut-view"}>
            <canvas ref={canvasRef} className={"cut-material"} onMouseDown={onMouseDown} onMouseUp={onMouseUp} onMouseMove={onMouseMove}>
            </canvas>
        </div>
    )

    function drawGraphics(ctx : CanvasRenderingContext2D)  {
        for (const group of state.groups) {
            for (const graphic of group.loadedGraphics) {

                let startX = group.startX + group.translateX
                let startY = group.startY + group.translateY
                let width = group.width * group.scaleX
                let height = group.height * group.scaleY

                if (graphic.image !==null) {
                    //draw image
                    ctx.drawImage(graphic.image,
                        startX + graphic.translateX * group.scaleX,
                        startY + graphic.translateY * group.scaleY,
                        graphic.width * group.scaleX,
                        graphic.height * group.scaleY)

                    if (state.selectedGraphicIndex !==-1 && group===state.groups[state.selectedGraphicIndex])
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
                    else if (state.hoverGraphicIndex !==-1 && group===state.groups[state.hoverGraphicIndex]) {
                        //draw measurements
                        drawDimensions(ctx, startX, startY, width, height)
                    }

                    //draw boundary rectangle
                    ctx.beginPath()
                    ctx.lineWidth = 2
                    ctx.strokeStyle = '#7777ff'
                    ctx.rect(startX, startY, width, height)
                    ctx.stroke()
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
    function drawDimensions(ctx : CanvasRenderingContext2D, startX : number, startY : number, width: number, height: number)
    {
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
            let group = state.groups[state.selectedGraphicIndex]

            let newGraphic = ConvertLoadedGraphicGroupToUnitsFromPixels(group, CutView.pxPerUnit, props.boardWidth.unit)
            newGraphic = ScaleGraphicGroup(newGraphic, group.scaleX, group.scaleY)

            //TODO: All the prior logic shold really be in the reducer function, but unfortunately I need a way to pass the parent dispatcher into it.
            props.dispatch({type: EngraveActionType.GraphicChanged, graphic: newGraphic})
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
                canvasRef.current.style.cursor = state.groups.map(group => {
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

function IsInRectBounds(tx : number, ty : number, x : number, y:number, w: number, h:number): boolean {
    return tx <= x + w && tx >= x && ty >= y && ty <= y + h
}

function IsOnGraphicHandle(canvasX:number, canvasY:number, graphic : LoadedGraphicGroup) : MouseMode
{
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
