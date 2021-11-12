import React, {Component, } from "react";
import {ServerURL} from "./contexts/ProjectRepo";
import {Graphic, Project} from "./common/data";

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

       let imagePromises = this.props.project.graphics.map(graphic => {
          return this.loadImage(graphic.url).then(image => {
             return [image, graphic] as [HTMLImageElement, Graphic]
          })
       })

        return this.loadImage(this.props.project.material.url).then(background => {
            //Update the canvas dimensions to bethe same as the material image.
            //this way it doesn't look terrible.
            let originPx = 0
            this.canvasRef.current.width = background.width + originPx*2
            this.canvasRef.current.height = background.height + originPx*2

            return Promise.all(imagePromises).then(tuples => {

               if (this.ctx != undefined)
               {
                   this.ctx.drawImage(background, originPx,originPx)

                   for (const [image, graphic] of tuples) {
                       // this.ctx.globalCompositeOperation = 'destination-out'
                       this.ctx.drawImage(image, graphic.posX, graphic.posY, graphic.width, graphic.height)
                       // this.ctx.globalCompositeOperation = 'source-over'
                       this.ctx.beginPath()
                       this.ctx.lineWidth = 2
                       this.ctx.strokeStyle = '#7777ff'
                       this.ctx.rect(graphic.posX,graphic.posY, graphic.width, graphic.height)
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