import React, {Component} from "react";
import ProjectContext, {ServerURL} from "./contexts/ProjectContext";
import {Project} from "./common/data";

export interface CutViewProps {
    project:Project
}

export class CutView extends Component<CutViewProps>
{
    private canvasRef: React.RefObject<any>;

    constructor(props : any) {
        super(props);
        this.canvasRef = React.createRef()
    }

    componentDidMount() {

        var ctx = this.canvasRef.current.getContext("2d")
        if (ctx != undefined)
        {
            var image = new Image()
            image.src = ServerURL + this.props.project.material.url
            image.onload = function() {
                ctx.drawImage(image, 0,0,ctx.canvas.width, ctx.canvas.height)
            }
            ctx.fillRect(0,0,100,100)
        }
    }

    render() {

        return  (
            <div className={"cut-view"}>
                <canvas ref={this.canvasRef} className={"cut-material"}>
                </canvas>
            </div>
        )
        // return (<div className="cut-view">
        //     {this.props.project.graphics.map(graphic => <img src={ServerURL + graphic.url} className={"cut-graphic"}/>)}
        //     <img src={ServerURL + this.props.project.material.url} className="cut-material" alt="logo" />
        // </div>)
    }
}