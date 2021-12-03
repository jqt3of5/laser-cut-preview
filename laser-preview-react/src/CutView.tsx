import React, {Component, MouseEvent} from "react";
import {
    SvgSubGraphic,
    SvgGraphic,
    Material,
    Project,
} from "./common/data";
import {AddDimensions, Dimension, MultScaler, ToPixels} from "./common/Dimension";

export interface CutViewProps {
    boardWidth: Dimension
    boardHeight: Dimension
    material: Material
    graphics: SvgGraphic[]
    onChange: (oldGraphic : SvgGraphic, newGraphic:SvgGraphic) => void
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
    translateX : number
    translateY : number
    scaleX : number
    scaleY : number
    selectedGraphicIndex: number
}

export class CutView extends Component<CutViewProps, CutViewState>
{
    private static resizeHandleWidth = 15;
    private canvasRef: React.RefObject<any>;
    private ctx : CanvasRenderingContext2D | undefined;
    //In canvas pixels, not client pixels
    private pxPerUnitWidth : number;
    //In canvas pixels, not client pixels
    // private pxPerUnitHeight: number;

    constructor(props : any) {
        super(props);
        this.canvasRef = React.createRef()
        this.state = {
            mouseMode: MouseMode.None,
            selectedGraphicIndex: -1,
            //In canvas pixels, not client pixels
            mouseX: 0,
            mouseY: 0,
            translateX : 0,
            translateY : 0,
            scaleX : 0,
            scaleY : 0
        }
        
        //In canvas pixels, not client pixels
        this.pxPerUnitWidth= 0
    }

    componentDidUpdate(prevProps: Readonly<CutViewProps>, prevState: Readonly<{}>, snapshot?: any) {
        this.draw()
    }

    componentDidMount() {
        this.ctx = this.canvasRef.current.getContext("2d")
        this.draw()
    }

    draw() : Promise<void> {

        return this.loadImage(`/materials/${this.props.material.id}`).then(background => {
            if (this.canvasRef.current == null)
            {
                return;
            }
            //Sets canvas drawing area so that the background image is fit nicely. 
            //clientHeight/Width is the actual dimensions of the canvas element
            this.canvasRef.current.width = background.width
            this.canvasRef.current.height = background.height
            
            this.pxPerUnitWidth = background.width/this.props.boardWidth.value

            this.ctx?.drawImage(background, 0, 0)

            for (let graphic of this.props.graphics) {
                
               let promises = graphic.subGraphics.map(mode => {
                   return this.loadImage(mode.url).then(image => {
                       return [image, mode] as [HTMLImageElement, SvgSubGraphic]
                   }) 
               }) 
               //TODO: We're not waiting for all these to finish, do we need to?
               this.drawGraphic(graphic, promises).then(r => {
                   
               }) 
            }
       })
    }
    
    drawGraphic = (graphic : SvgGraphic, imagePromises: Promise<[HTMLImageElement, SvgSubGraphic]>[]) : Promise<void> => {
        let widthUnit = this.props.boardWidth.unit

        let startX = ToPixels(graphic.posX, this.pxPerUnitWidth, widthUnit)
        let startY = ToPixels(graphic.posY,  this.pxPerUnitWidth, widthUnit)
        let width = ToPixels(graphic.width, this.pxPerUnitWidth, widthUnit)
        let height = ToPixels(graphic.height, this.pxPerUnitWidth, widthUnit)

        let scaleFactorX = 1
        let scaleFactorY = 1
        //If this is the selected graphic, calculate the scaling, and translations
        if (graphic == this.props.graphics[this.state.selectedGraphicIndex] && this.state.mouseMode != MouseMode.None)
        {
            startX = startX + this.state.translateX
            startY = startY + this.state.translateY
            scaleFactorX = this.state.scaleX
            scaleFactorY = this.state.scaleY
            width = width * scaleFactorX
            height = height * scaleFactorY
        }

        return Promise.all(imagePromises).then(tuples => {
           if (this.ctx != undefined)
           {
               for (const [image, mode] of tuples) {

                   this.ctx.drawImage(image,
                   startX + ToPixels(mode.posX,  this.pxPerUnitWidth, widthUnit) * scaleFactorX,
                   startY + ToPixels(mode.posY,  this.pxPerUnitWidth, widthUnit) * scaleFactorY,
                   ToPixels(mode.width,  this.pxPerUnitWidth, widthUnit) * scaleFactorX,
                   ToPixels(mode.height,  this.pxPerUnitWidth, widthUnit) * scaleFactorY)
               }
               
               this.ctx.beginPath()
               this.ctx.lineWidth = 2
               this.ctx.strokeStyle = '#7777ff'
               this.ctx.rect(
                   startX,
                   startY,
                   width,
                   height)
               this.ctx.stroke()

               this.ctx.beginPath()
               this.ctx.fillStyle = "white"

               let halfSize = CutView.resizeHandleWidth / 2
               this.ctx.rect(startX - halfSize, startY - halfSize, CutView.resizeHandleWidth, CutView.resizeHandleWidth)
               this.ctx.rect(startX + width - halfSize, startY - halfSize, CutView.resizeHandleWidth, CutView.resizeHandleWidth)
               this.ctx.rect(startX - halfSize, startY + height- halfSize, CutView.resizeHandleWidth, CutView.resizeHandleWidth)
               this.ctx.rect(startX + width - halfSize, startY + height- halfSize, CutView.resizeHandleWidth, CutView.resizeHandleWidth)
               this.ctx.stroke()
               this.ctx.fill()

           }
       })
    }

    loadImage(url : string): Promise<HTMLImageElement> {
       return new Promise<HTMLImageElement>(resolve => {

           let image = new Image()
           image.src = process.env.REACT_APP_API + url
           image.onload = () => {
               resolve(image)
           }
       })
    }

    IsInRectBounds(tx : number, ty : number, x : number, y:number, w: number, h:number): boolean {
        return tx <= x + w && tx >= x && ty >= y && ty <= y + h
    }

    IsOnGraphicHandle(canvasX:number, canvasY:number, graphic : SvgGraphic) : MouseMode
    {
        let widthUnit = this.props.boardWidth.unit

        let startX = ToPixels(graphic.posX, this.pxPerUnitWidth, widthUnit)
        let startY = ToPixels(graphic.posY,  this.pxPerUnitWidth, widthUnit)
        let width = ToPixels(graphic.width, this.pxPerUnitWidth, widthUnit)
        let height = ToPixels(graphic.height, this.pxPerUnitWidth, widthUnit)

        let clickTargetSize = CutView.resizeHandleWidth * 2
        if (this.IsInRectBounds(canvasX, canvasY, startX - CutView.resizeHandleWidth, startY - CutView.resizeHandleWidth, clickTargetSize, clickTargetSize))
        {
            return MouseMode.ScaleTopLeft
        }
        if (this.IsInRectBounds(canvasX, canvasY, startX + width - CutView.resizeHandleWidth, startY - CutView.resizeHandleWidth, clickTargetSize, clickTargetSize))
        {
            return MouseMode.ScaleTopRight
        }
        if (this.IsInRectBounds(canvasX, canvasY, startX - CutView.resizeHandleWidth, startY + height- CutView.resizeHandleWidth, clickTargetSize, clickTargetSize))
        {
            return MouseMode.ScaleBottomLeft
        }
        if (this.IsInRectBounds(canvasX, canvasY, startX + width - CutView.resizeHandleWidth, startY + height- CutView.resizeHandleWidth, clickTargetSize, clickTargetSize) )
        {
            return MouseMode.ScaleBottomRight
        }

        if (this.IsInRectBounds(canvasX, canvasY, startX, startY, width, height))
        {
            return MouseMode.Translate
        }
        return MouseMode.None
    }

    onMouseDown = (event : MouseEvent<HTMLCanvasElement>) => {
        let rect = this.canvasRef.current.getBoundingClientRect()
        let canvasX = (event.clientX - rect.x) / rect.width * this.canvasRef.current.width
        let canvasY = (event.clientY - rect.y) / rect.height * this.canvasRef.current.height
        //Locate the first graphic that surrounds the cursor
        let selectedGraphicIndex = this.props.graphics.findIndex(graphic => {
            return this.IsOnGraphicHandle(canvasX, canvasY, graphic) != MouseMode.None
        })

        let mouseMode = selectedGraphicIndex == -1 ? MouseMode.None : this.IsOnGraphicHandle(canvasX, canvasY, this.props.graphics[selectedGraphicIndex])
        this.setState({mouseMode: mouseMode, mouseX:canvasX, mouseY: canvasY, translateY : 0, translateX: 0, scaleX : 1, scaleY : 1, selectedGraphicIndex: selectedGraphicIndex})
    }
    onMouseUp = (event : MouseEvent<HTMLCanvasElement>) => {
        this.setState({mouseMode: MouseMode.None})
        if (this.state.selectedGraphicIndex != -1)
        {
            let oldGraphic = this.props.graphics[this.state.selectedGraphicIndex]

            //Convert back into units
            let translatey = new Dimension(this.state.translateY / this.pxPerUnitWidth, this.props.boardHeight.unit)
            let translatex = new Dimension(this.state.translateX / this.pxPerUnitWidth, this.props.boardWidth.unit)

            let newGraphic = {...oldGraphic,
                subGraphics: oldGraphic.subGraphics
                .map(graphic=> {
                    return {...graphic,
                        posX: MultScaler(graphic.posX, this.state.scaleX),
                        posY: MultScaler(graphic.posY, this.state.scaleY),
                        width: MultScaler(graphic.width, this.state.scaleX),
                        height: MultScaler(graphic.height, this.state.scaleY)
                    }
                }),
                posX: AddDimensions(oldGraphic.posX, translatex),
                posY: AddDimensions(oldGraphic.posY, translatey),
                width: MultScaler(oldGraphic.width, this.state.scaleX),
                height: MultScaler(oldGraphic.height, this.state.scaleY)
            }
            this.props.onChange(oldGraphic, newGraphic)
        }
    }
    onMouseMove = (event : MouseEvent<HTMLCanvasElement>) => {

        let rect = this.canvasRef.current.getBoundingClientRect()
        let canvasX = (event.clientX - rect.x) / rect.width * this.canvasRef.current.width
        let canvasY = (event.clientY - rect.y) / rect.height * this.canvasRef.current.height

        if (this.state.mouseMode == MouseMode.None)
        {
            this.canvasRef.current.style.cursor = this.props.graphics.map(graphic => {
                let mode = this.IsOnGraphicHandle(canvasX, canvasY, graphic)
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
            }).find(c => c != null) ?? "default"
        }

       if (this.state.mouseMode != MouseMode.None) {
           this.setState(state => {
               let mousedX = canvasX - state.mouseX
               let mousedY = canvasY - state.mouseY

               let graphic = this.props.graphics[state.selectedGraphicIndex]
               let widthUnit = this.props.boardWidth.unit

               let width = ToPixels(graphic.width, this.pxPerUnitWidth, widthUnit)
               let height = ToPixels(graphic.height, this.pxPerUnitWidth, widthUnit)

               let scaleX = 1
               let scaleY = 1
               let translateX = 0
               let translateY = 0

               switch(this.state.mouseMode)
               {
                   case MouseMode.None:
                       break;
                   case MouseMode.Translate:
                       translateX = mousedX
                       translateY = mousedY
                       break;
                   case MouseMode.ScaleBottomRight:
                       scaleX = (width + mousedX) / width
                       scaleY = (height + mousedY) / height
                       break;
                   case MouseMode.ScaleBottomLeft:
                       translateX = mousedX
                       translateY = 0
                       scaleX = (width - mousedX) / width
                       scaleY = (height + mousedY) / height
                       break;
                   case MouseMode.ScaleTopRight:
                       translateX = 0
                       translateY = mousedY
                       scaleX = (width + mousedX) / width
                       scaleY = (height - mousedY) / height
                       break;
                   case MouseMode.ScaleTopLeft:
                       translateX = mousedX
                       translateY = mousedY
                       scaleX = (width - mousedX) / width
                       scaleY = (height - mousedY) / height
                       break;
                   case MouseMode.Rotate:
                       break;
               }

               return {translateX: translateX, translateY:translateY, scaleX: scaleX, scaleY: scaleY}
           })
       }
    }
    
    render() {
        return  (
            <div className={"cut-view"}>
                <canvas ref={this.canvasRef} className={"cut-material"} onMouseDown={this.onMouseDown} onMouseUp={this.onMouseUp} onMouseMove={this.onMouseMove}>
                </canvas>
            </div>
        )
    }
}