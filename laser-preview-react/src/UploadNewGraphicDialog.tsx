import React, {Component} from "react";
import {GraphicGroup} from "./common/data";
import axios from "axios";
import {PrettyButton} from "./PrettyButton";

enum Stage {
    Upload,
    Preview
}
export interface UploadNewGraphicState
{
    graphic : GraphicGroup | null
    fileToUpload : File | null
    stage : Stage
}

export interface UploadNewGraphicProps
{
    attachNewGraphic: (graphic: GraphicGroup) => void
}

export class UploadNewGraphicDialog extends Component<UploadNewGraphicProps, UploadNewGraphicState>
{
    constructor(props: UploadNewGraphicProps | Readonly<UploadNewGraphicProps>) {
        super(props);
        this.state = {stage:Stage.Upload, fileToUpload: null, graphic: null}
    }

    render() {
       return <div className={"dialog upload-dialog"}>
           {this.state.stage == Stage.Upload &&
               <div className={"upload-graphic"}>
                   <input type={"file"} accept={".pdf, .svg"} onChange={this.OnFileChanged}/>
                   <button className={"pretty-button"} onClick={this.OnFileUpload}>Upload</button>
               </div>
           }

           {this.state.stage == Stage.Preview &&
                <div className={"preview-graphic"}>
                    <img/>
                    <button className={"pretty-button"} onClick={this.OnGraphicConfirmed}>Upload</button>
                </div>
           }
       </div>
    }

    OnGraphicConfirmed = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (this.state.graphic != null)
        {
            this.props.attachNewGraphic(this.state.graphic)
        }
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
