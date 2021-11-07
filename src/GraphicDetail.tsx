import {ServerURL} from "./contexts/ProjectContext";
import {Component} from "react";
import React = require("react");
import {Graphic} from "../Server/data";

export interface GraphicProps {
    graphic: Graphic
}

export class GraphicDetail extends Component<GraphicProps> {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={"graphic-detail bottom-separator"}>
                <img className="graphic-preview" src={ServerURL + this.props.graphic.url}></img>
                <div className={"graphic-line-color-list"}>
                    {this.props.graphic.colors.map(color => {
                        return (<div className={"graphic-line-color-item"}>
                            <div className={"graphic-line-color"}></div>
                            <select className={"graphic-line-color-mode pretty-select"} defaultValue={color.mode}>
                                <option>Cut</option>
                                <option>Score</option>
                                <option>Engrave</option>
                            </select>
                        </div>)
                    })}
                </div>
            </div>
        )
    }
}