import React, {Component} from "react";
import {ServerURL} from "./contexts/ProjectContext";
import {Project} from "../Server/data";

export interface CutViewProps {
}

export class CutView extends Component<CutViewProps>
{
    constructor(props : any) {
        super(props);
    }
    render() {
        return (<div className="cut-view">
            <img src={ServerURL + this.context.state.project.material.url} className="cut-preview" alt="logo" />
            {/*Draw cuts, scores, and engraves*/}
        </div>)
    }
}
