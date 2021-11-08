import ProjectContext, {ServerURL} from "./contexts/ProjectContext";
import React, {Component, ReactEventHandler, SyntheticEvent} from "react";
import {Color, Graphic, Project} from "./common/data";

export interface GraphicProps {
    graphic: Graphic
    project: Project,
    updateProject: (project:Project) => void
}

export class GraphicDetail extends Component<GraphicProps, any> {

    constructor(props: GraphicProps | Readonly<GraphicProps>) {
        super(props);
    }

    render() {
        return (
            <div className={"graphic-detail bottom-separator"}>
                <img className="graphic-preview" src={ServerURL + this.props.graphic.url}></img>
                <div className={"graphic-line-color-list"}>
                    {
                        this.props.graphic.colors.map(color => {
                        return (
                            <div className={"graphic-line-color-item"}>
                                <div className={"graphic-line-color"}></div>
                                <select className={"graphic-line-color-mode pretty-select"}
                                        value={color.mode}
                                        onChange={(event) => this.onChange(event, color)}>
                                    <option value={"Cut"}>Cut</option>
                                    <option value={"Score"}>Score</option>
                                    <option value={"Engrave"}>Engrave</option>
                                </select>
                            </div>)
                    })}
                </div>
            </div>
        )
    }

    onChange = (event: SyntheticEvent<HTMLSelectElement>, color: Color) => {
       // console.log(event.currentTarget.value)
        this.props.updateProject({...this.props.project, graphics:this.props.project.graphics.map(graphic => {
                if (graphic == this.props.graphic)
                {
                    return {...graphic, colors:graphic.colors.map(c => {
                            if (c == color)
                            {
                                return {...c, mode:event.currentTarget.value}
                            }
                            return c
                        })}
                }
                return graphic
            })})
    }
}