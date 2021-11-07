import {Component} from "react";
import {ServerURL} from "./contexts/ProjectContext";
import {Project} from "../Server/data";
import React = require("react");

export interface CutViewProps {
    project: Project
}

export class CutView extends Component<CutViewProps>
{
    constructor(props) {
        super(props);
    }
    render() {
        return (<div className="cut-view">
            <img src={ServerURL + this.props.project.material.url} className="cut-preview" alt="logo" />
            {/*Draw cuts, scores, and engraves*/}
        </div>)
    }
}
