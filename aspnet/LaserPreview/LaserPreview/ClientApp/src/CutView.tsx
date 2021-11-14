import React, {Component, MouseEvent} from "react";
import {ServerURL} from "./contexts/ProjectRepo";
import {ColorMode, DimensionUnits, Graphic, Project, ToPixels} from "./common/data";

export interface CutViewProps {
    project:Project
    onChange: (oldGraphic : Graphic, newGraphic:Graphic) => void
}

export interface CutViewState {
    mouseDown: boolean 
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

    constructor(props : any) {
        super(props);
        this.canvasRef = React.createRef()
        this.state = {
            mouseDown: false,
            selectedGraphic: undefined,
            // pxPerHeightUnit: 0,
            // pxPerWidthUnit: 0,
            // widthUnit: DimensionUnits.Inches,
            // heightUnit: DimensionUnits.Inches
        }
    }

    componentDidUpdate(prevProps: Readonly<CutViewProps>, prevState: Readonly<{}>, snapshot?: any) {
        this.draw()
    }

    componentDidMount() {
        this.ctx = this.canvasRef.current.getContext("2d")
        this.draw()
    }

    draw() : Promise<void> {

       let imagePromises = this.props.project.graphics.map(graphic => graphic.colorModes.map(mode => {
           return this.loadImage(mode.url).then(image => {
               return [image, mode, graphic] as [HTMLImageElement, ColorMode, Graphic]
           })
       })).flat()

        return this.loadImage(`/materials/${this.props.project.material.id}`).then(background => {
            //Update the canvas dimensions to bethe same as the material image.
            //this way it doesn't look terrible.
            this.canvasRef.current.width = background.width 
            this.canvasRef.current.height = background.height
            
            let pxPerUnitWidth = background.width/this.props.project.boardWidth.value
            let widthUnit = this.props.project.boardWidth.unit
            
            let pxPerUnitHeight= background.height/this.props.project.boardHeight.value
            let heightUnit = this.props.project.boardHeight.unit
            
            // this.setState({pxPerWidthUnit: pxPerUnitWidth, pxPerHeightUnit: pxPerUnitHeight, heightUnit: heightUnit, widthUnit: widthUnit})
            
            this.ctx?.drawImage(background, 0, 0)

            return Promise.all(imagePromises).then(tuples => {

               if (this.ctx != undefined)
               {
                   for (const [image, mode, graphic] of tuples) {
                       
                       this.ctx.drawImage(image, 
                           ToPixels(graphic.posX, pxPerUnitWidth, widthUnit) + ToPixels(mode.posX, pxPerUnitWidth, widthUnit),
                           ToPixels(graphic.posY, pxPerUnitHeight, heightUnit) + ToPixels(mode.posY, pxPerUnitHeight, heightUnit), 
                           ToPixels(mode.width, pxPerUnitWidth, widthUnit), 
                           ToPixels(mode.height, pxPerUnitHeight, heightUnit))
                       this.ctx.beginPath()
                       this.ctx.lineWidth = 2
                       this.ctx.strokeStyle = '#7777ff'
                       this.ctx.rect(
                           ToPixels(graphic.posX,pxPerUnitWidth, widthUnit), 
                           ToPixels(graphic.posY,pxPerUnitHeight, heightUnit), 
                           ToPixels(graphic.width,pxPerUnitWidth, widthUnit), 
                           ToPixels(graphic.height,pxPerUnitHeight, heightUnit))
                       this.ctx.stroke()
                   }
               }
           })
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
        console.log(event)
        let selectedGraphic = this.props.project.graphics.find(graphic => {
            return event.clientX < graphic.posX + graphic.width && event.clientX > graphic.posX 
            && event.clientY > graphic.posY && event.clientY < graphic.posY + graphic.height
        })
        
        this.setState({mouseDown: true, selectedGraphic: selectedGraphic})    
    }
    onMouseUp = (event : MouseEvent<HTMLCanvasElement>) => {
        console.log(event)
        this.setState({mouseDown: false})
        this.props.onChange(this.state.selectedGraphic)
    }
    onMouseMove = (event : MouseEvent<HTMLCanvasElement>) => {
       if (this.state.mouseDown) 
       {
          this.setState(state => {{selectedGraphic: {...state.selectedGraphic, }}} ) 
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