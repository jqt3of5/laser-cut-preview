import React, {Component, MouseEvent} from "react";
import {ServerURL} from "./contexts/ProjectRepo";
import {
    AddDimensions,
    ColorMode,
    Dimension,
    DimensionUnits,
    Graphic,
    Material,
    Project,
    ToPixels,
    ToType
} from "./common/data";

export interface CutViewProps {
    boardWidth: Dimension
    boardHeight: Dimension
    material: Material
    graphics: Graphic[]
    onChange: (oldGraphic : Graphic, newGraphic:Graphic) => void
}

export interface CutViewState {
    mouseDown: boolean 
    mouseX : number
    mouseY : number
    mousedX: number
    mousedY : number
    selectedGraphicIndex: number
    // pxPerHeightUnit: number
    // pxPerWidthUnit: number
    // widthUnit: DimensionUnits
    // heightUnit: DimensionUnits
}

export class CutView extends Component<CutViewProps, CutViewState>
{
    private canvasRef: React.RefObject<any>;
    private ctx : CanvasRenderingContext2D | undefined;
    private pxPerUnitWidth : number;
    private pxPerUnitHeight: number;

    constructor(props : any) {
        super(props);
        this.canvasRef = React.createRef()
        this.state = {
            mouseDown: false,
            selectedGraphicIndex: -1,
            mouseX: 0,
            mouseY: 0,
            mousedX: 0,
            mousedY: 0,
        }
        this.pxPerUnitHeight = 0
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
            //Update the canvas dimensions to bethe same as the material image.
            //this way it doesn't look terrible.
            if (this.canvasRef.current == null)
            {
                return;
            }
            this.canvasRef.current.width = background.width 
            this.canvasRef.current.height = background.height
            
            this.pxPerUnitWidth = background.width/this.props.boardWidth.value
            this.pxPerUnitHeight= background.height/this.props.boardHeight.value
            
            this.ctx?.drawImage(background, 0, 0)

            for (let graphic of this.props.graphics) {
                
               let promises = graphic.colorModes.map(mode => {
                   return this.loadImage(mode.url).then(image => {
                       return [image, mode] as [HTMLImageElement, ColorMode]
                   }) 
               }) 
               //TODO: We're not waiting for all these to finish, do we need to?
               this.drawGraphic(graphic, promises) 
            }
       })
    }
    
    drawGraphic = (graphic : Graphic, imagePromises: Promise<[HTMLImageElement, ColorMode]>[]) : Promise<void> => {
        let heightUnit = this.props.boardHeight.unit
        let widthUnit = this.props.boardWidth.unit
        
        //variables to hold the offset when we're dragging around
        let offsetX = 0 
        let offsetY = 0
        if (graphic == this.props.graphics[this.state.selectedGraphicIndex] && this.state.mouseDown)
        {
            offsetX = this.state.mousedX
            offsetY = this.state.mousedY
        }
        
        return Promise.all(imagePromises).then(tuples => {
           if (this.ctx != undefined)
           {
               for (const [image, mode] of tuples) {

                   this.ctx.drawImage(image,
                       ToPixels(graphic.posX, this.pxPerUnitWidth, widthUnit) + ToPixels(mode.posX,  this.pxPerUnitWidth, widthUnit) + offsetX,
                       ToPixels(graphic.posY,  this.pxPerUnitHeight, heightUnit) + ToPixels(mode.posY,  this.pxPerUnitHeight, heightUnit) + offsetY,
                       ToPixels(mode.width,  this.pxPerUnitWidth, widthUnit),
                       ToPixels(mode.height,  this.pxPerUnitHeight, heightUnit))
               }
               
               this.ctx.beginPath()
               this.ctx.lineWidth = 2
               this.ctx.strokeStyle = '#7777ff'
               this.ctx.rect(
                   ToPixels(graphic.posX, this.pxPerUnitWidth, widthUnit) + offsetX,
                   ToPixels(graphic.posY, this.pxPerUnitHeight, heightUnit) + offsetY,
                   ToPixels(graphic.width, this.pxPerUnitWidth, widthUnit),
                   ToPixels(graphic.height, this.pxPerUnitHeight, heightUnit))
               this.ctx.stroke()
           } 
       })
    }

    loadImage(url : string): Promise<HTMLImageElement> {
       return new Promise<HTMLImageElement>(resolve => {

           let image = new Image()
           image.src = ServerURL + url
           image.onload = () => {
               resolve(image)
           }
       })
    }
    
    onMouseDown = (event : MouseEvent<HTMLCanvasElement>) => {
        let widthUnit = this.props.boardWidth.unit
        let heightUnit = this.props.boardHeight.unit
        //Locate the first graphic that surrounds the cursor
        let selectedGraphicIndex = this.props.graphics.findIndex(graphic => {
            return event.clientX < ToPixels(graphic.posX, this.pxPerUnitWidth, widthUnit)  + ToPixels(graphic.width, this.pxPerUnitWidth, widthUnit) && event.clientX > ToPixels(graphic.posX, this.pxPerUnitWidth, widthUnit) 
            && event.clientY > ToPixels(graphic.posY, this.pxPerUnitHeight, heightUnit) && event.clientY < ToPixels(graphic.posY, this.pxPerUnitHeight, heightUnit) + ToPixels(graphic.height, this.pxPerUnitHeight, heightUnit)
        })

        this.setState({mouseDown: true, mouseX:event.clientX, mouseY: event.clientY, mousedY: 0, mousedX: 0, selectedGraphicIndex: selectedGraphicIndex})
    }
    onMouseUp = (event : MouseEvent<HTMLCanvasElement>) => {
        this.setState({mouseDown: false})
        if (this.state.selectedGraphicIndex != -1)
        {
            let oldGraphic = this.props.graphics[this.state.selectedGraphicIndex]
            
            let offsety = new Dimension(this.state.mousedY / this.pxPerUnitHeight, this.props.boardHeight.unit)
            let offsetx = new Dimension(this.state.mousedX / this.pxPerUnitWidth, this.props.boardWidth.unit)
             
            let newGraphic = {...oldGraphic, posX: AddDimensions(oldGraphic.posX, offsetx), posY: AddDimensions(oldGraphic.posY, offsety)}
            this.props.onChange(oldGraphic, newGraphic)
        }
    }
    onMouseMove = (event : MouseEvent<HTMLCanvasElement>) => {
       if (this.state.mouseDown) {
           this.setState(state => {return {mousedX:event.clientX - state.mouseX, mousedY:event.clientY - state.mouseY}})
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