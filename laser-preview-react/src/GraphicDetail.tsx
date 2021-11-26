import React, {Component, ReactEventHandler, SyntheticEvent} from "react";
import {SvgSubGraphic, SvgGraphic, LaserMode, Project} from "./common/data";

import Button from 'react-bootstrap/Button';
import {Dimension, ToUnitName} from "./common/Dimension";

export interface GraphicProps {
    graphic: SvgGraphic
    // project: Project,
    // updateProject: (project:Project) => void
    onChange: (oldGraphic : SvgGraphic, newGraphic : SvgGraphic) => void
    onDelete: (graphic : SvgGraphic) => void
}

interface GraphicColorProps
{
    color: SvgSubGraphic
    onChange: (oldColor:SvgSubGraphic, newColor: SvgSubGraphic) => void
}

function GraphicColor(props : GraphicColorProps)
{
    return (
        <div className={"graphic-color-item bottom-separator"}>
            <div className={"graphic-color-img"}>
                <img src={process.env.REACT_APP_API + props.color.url}/>
            </div>
            <div className={"graphic-color-select"}>
                <select className={"graphic-line-color-mode pretty-select"} 
                        value={LaserMode[props.color.mode]}
                        onChange={e => props.onChange(props.color, {...props.color, mode:e.currentTarget.selectedIndex})}>
                    <option value={"Cut"}>Cut</option>
                    <option value={"Score"}>Score</option>
                    <option value={"Engrave"}>Engrave</option>
                </select>
            </div>
        </div>)
}

export class GraphicDetail extends Component<GraphicProps, any> {

    constructor(props: GraphicProps | Readonly<GraphicProps>) {
        super(props);
    }

    render() {
        return (
            <div className={"graphic-detail"}>
                {/*<img className="graphic-preview" src={ServerURL + this.props.graphic.url}></img>*/}
                <div className={"graphic-detail-header"}>
                    <label>{this.props.graphic.name}</label>
                    <Button variant={"warning"} onClick={event => this.props.onDelete(this.props.graphic)}>delete</Button>
                </div>
                <div className={"graphic-dimensions"}>
                    <div className={"graphic-dimension"}>
                        <label>Width</label>
                        <div className={"fancy-input"}>
                            <input className={"input-entry"} value={this.props.graphic.width.value} onChange={this.onWidthChange}/><div className={"input-unit"}>{ToUnitName(this.props.graphic.width.unit)}</div>
                        </div>
                    </div>
                    <div className={"graphic-dimension"}>
                        <label>Height</label>
                        <div className={"fancy-input"}>
                            <input className={"input-entry"} value={this.props.graphic.height.value} onChange={this.onHeightChange}/><div className={"input-unit"}>{ToUnitName(this.props.graphic.height.unit)}</div>
                        </div>
                    </div>
                </div>
                <div className={"graphic-colors"}>
                    {
                        this.props.graphic.colorModes.map(color => <GraphicColor color={color} onChange={this.onColorChange}/>)
                    }
                </div>
            </div>
        )
    }

    onColorChange = (oldColor : SvgSubGraphic, newColor : SvgSubGraphic) => {
        this.props.onChange(this.props.graphic, {...this.props.graphic,
            //Replace the old color with the new color
            colorModes:this.props.graphic.colorModes.map(c => {
                if (c == oldColor) {
                    return newColor
                }
                return c
            })})
    }
    onWidthChange = (event : SyntheticEvent<HTMLInputElement>) => {
       let width = parseInt(event.currentTarget.value)
        if (event.currentTarget.value == "")
        {
            width = 0
        }
       if (isNaN(width))
       {
           this.props.onChange(this.props.graphic, this.props.graphic)
           return
       }
       //TODO: Scaling should maintain ratio
       this.props.onChange(this.props.graphic,{...this.props.graphic, width: new Dimension(width, this.props.graphic.width.unit)})
    }

    onHeightChange = (event : SyntheticEvent<HTMLInputElement>) => {
        let height = parseInt(event.currentTarget.value)
        if (event.currentTarget.value == "")
        {
            height = 0
        }
        if (isNaN(height))
        {
            this.props.onChange(this.props.graphic, this.props.graphic)
            return
        }
        //TODO: Scaling should maintain ratio
        this.props.onChange(this.props.graphic, {...this.props.graphic, height: new Dimension(height, this.props.graphic.height.unit)})
    }
}