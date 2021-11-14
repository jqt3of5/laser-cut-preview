import React, {Component, } from "react";
import {ServerURL} from "./contexts/ProjectRepo";
import {ColorMode, Graphic, Project, ToPixels} from "./common/data";

export interface CutViewProps {
    project:Project
}

export class CutView extends Component<CutViewProps>
{
    private canvasRef: React.RefObject<any>;
    private ctx : CanvasRenderingContext2D | undefined;

    constructor(props : any) {
        super(props);
        this.canvasRef = React.createRef()
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

            this.ctx?.drawImage(background, 0,0)
            
            let pxPerUnitWidth = background.width/this.props.project.boardWidth.value
            let widthUnit = this.props.project.boardWidth.unit
            let pxPerUnitHeight= background.height/this.props.project.boardHeight.value
            let heightUnit = this.props.project.boardHeight.unit

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

    render() {
        return  (
            <div className={"cut-view"}>
                <canvas ref={this.canvasRef} className={"cut-material"}>
                </canvas>
            </div>
        )
    }
}