import React, {Component, Dispatch} from "react";
import {GraphicGroup} from "./common/data";
import axios from "axios";
import {PrettyButton} from "./PrettyButton";
import './UploadNewGraphicDialog.css'
import {ActionType, AppAction, AppState} from "./AppState";
import {GraphicGroupDetail, SubGraphicListDetails} from "./SubGraphicListDetails";

enum Stage {
    Upload,
    Preview,
    LaserMode
}
export interface UploadNewGraphicState
{
    graphic : GraphicGroup | null
    fileToUpload : File | null
    stage : Stage
}

export interface UploadNewGraphicProps
{
    isShowing : boolean
    dispatch : Dispatch<AppAction>
}

export class UploadNewGraphicDialog extends Component<UploadNewGraphicProps, UploadNewGraphicState>
{
    constructor(props: UploadNewGraphicProps | Readonly<UploadNewGraphicProps>) {
        super(props);
        this.state = {stage:Stage.Upload, fileToUpload: null, graphic: null}
    }

    render() {
        if (!this.props.isShowing)
        {
            return null
        }
       return <div className={"modal"}>
           <div className={"modal-dialog upload-dialog"}>
               <span className="close" onClick={this.OnGraphicCancelled}>&times;</span>
               <div className={"modal-content-container"}>
                   {this.state.stage == Stage.Upload &&
                       <div className={"upload-graphic-content"}>
                           <div className={"upload-graphic-input-container"}>
                               <input type={"file"} accept={".pdf, .svg"} onChange={this.OnFileChanged}/>
                           </div>
                           <button className={"pretty-button"} onClick={this.OnFileUpload}>Upload</button>
                       </div>
                   }

                   {this.state.stage == Stage.Preview && this.state.graphic != null &&
                       <div className={"preview-graphic-content"}>
                           <GraphicGroupDetail group={this.state.graphic} onChange={(old, group) => this.setState({graphic: group})}></GraphicGroupDetail>
                           <button className={"pretty-button"} onClick={this.OnGraphicConfirmed}>Confirm</button>
                       </div>
                   }
               </div>
           </div>
       </div>
    }

    OnGraphicConfirmed = (event: React.MouseEvent<HTMLButtonElement>) => {
        this.setState({stage: Stage.Upload})
        this.props.dispatch({type: ActionType.GraphicAddFinished, graphic:this.state.graphic})
    }

    OnGraphicCancelled = (event: React.MouseEvent<HTMLButtonElement>) => {
        this.setState({stage: Stage.Upload})
        this.props.dispatch({type: ActionType.GraphicAddFinished, graphic: null})
    }

    OnFileUpload = (event: React.MouseEvent<HTMLButtonElement>) => {
        const formData = new FormData();
        if (this.state.fileToUpload != null)
        {
            // Update the formData object
            formData.append(
                "file",
                this.state.fileToUpload,
                this.state.fileToUpload.name
            );
            axios.post(`${process.env.REACT_APP_API}/graphic`, formData)
                .then(response => this.setState({stage: Stage.Preview, graphic: response.data}))
        }
    }

    OnFileChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files == null)
            return

        this.setState({fileToUpload: event.target.files[0]})
    }
}
