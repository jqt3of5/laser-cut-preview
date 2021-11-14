import React, {Component, MouseEvent} from "react";
import {ServerURL} from "./contexts/ProjectRepo";
import {ColorMode, Dimension, DimensionUnits, Graphic, Material, Project, ToPixels, ToType} from "./common/data";

export interface CutViewProps {
    boardWidth: Dimension
    boardHeight: Dimension
    material: Material
    graphics: Graphic[]
    onChange: (oldGraphic : Graphic, newGraphic:Graphic) => void
}

export interface CutViewState {
    mouseDown: boolean 
    selectedGraphicIndex: number
    selectedGraphic: Graphic | undefined
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
            selectedGraphic: undefined
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
            this.canvasRef.current.width = background.width 
            this.canvasRef.current.height = background.height
            
            this.pxPerUnitWidth = background.width/this.props.boardWidth.value
            this.pxPerUnitHeight= background.height/this.props.boardHeight.value
            
            this.ctx?.drawImage(background, 0, 0)
            console.log(this.props.graphics)

            for (let graphic of this.props.graphics) {
                if (this.state.selectedGraphic != undefined && this.state.mouseDown)
                {
                   graphic = this.state.selectedGraphic 
                }
                
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
        return Promise.all(imagePromises).then(tuples => {
           if (this.ctx != undefined)
           {
               for (const [image, mode] of tuples) {

                   this.ctx.drawImage(image,
                       ToPixels(graphic.posX, this.pxPerUnitWidth, widthUnit) + ToPixels(mode.posX,  this.pxPerUnitWidth, widthUnit),
                       ToPixels(graphic.posY,  this.pxPerUnitHeight, heightUnit) + ToPixels(mode.posY,  this.pxPerUnitHeight, heightUnit),
                       ToPixels(mode.width,  this.pxPerUnitWidth, widthUnit),
                       ToPixels(mode.height,  this.pxPerUnitHeight, heightUnit))
               }
               
               this.ctx.beginPath()
               this.ctx.lineWidth = 2
               this.ctx.strokeStyle = '#7777ff'
               this.ctx.rect(
                   ToPixels(graphic.posX, this.pxPerUnitWidth, widthUnit),
                   ToPixels(graphic.posY, this.pxPerUnitHeight, heightUnit),
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

        this.setState({mouseDown: true, selectedGraphicIndex: selectedGraphicIndex, selectedGraphic: this.props.graphics[selectedGraphicIndex]})
    }
    onMouseUp = (event : MouseEvent<HTMLCanvasElement>) => {
        this.setState({mouseDown: false})
        if (this.state.selectedGraphicIndex != -1 && this.state.selectedGraphic != undefined)
        {
            this.props.onChange(this.props.graphics[this.state.selectedGraphicIndex], this.state.selectedGraphic)
        }
    }
    onMouseMove = (event : MouseEvent<HTMLCanvasElement>) => {
       if (this.state.mouseDown) 
       {
           this.setState((state:CutViewState, props:CutViewProps) => {
               if (state.selectedGraphicIndex != -1 && this.state.selectedGraphic != undefined)
               {
                   let y = new Dimension(event.clientY / this.pxPerUnitHeight, this.props.boardHeight.unit)
                   let x = new Dimension(event.clientX / this.pxPerUnitWidth, this.props.boardWidth.unit)
                   return {...state, selectedGraphic: {...this.state.selectedGraphic, posX: x, posY: y}}
               }
               return state
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