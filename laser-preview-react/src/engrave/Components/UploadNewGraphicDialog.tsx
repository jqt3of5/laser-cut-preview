import React, {Component, Dispatch} from "react";
import {GraphicGroup, SvgSubGraphic} from "../../common/data";
import axios from "axios";
import {PrettyButton} from "../../common/PrettyButton";
import './UploadNewGraphicDialog.css'
import '../../common/common.css'
import {EngraveActionType, EngraveAppAction, EngraveAppState} from "../Views/EngraveAppState";
import {GraphicGroupDetail, SubGraphicDetail, GraphicDetails} from "./GraphicDetails";

enum Stage {
    Upload,
    Preview,
    LaserMode
}
export interface UploadNewGraphicState
{
    graphic : GraphicGroup | null
    stage : Stage
}

export interface UploadNewGraphicProps
{
    isShowing : boolean
    dispatch : Dispatch<EngraveAppAction>
}

export class UploadNewGraphicDialog extends Component<UploadNewGraphicProps, UploadNewGraphicState>
{
    constructor(props: UploadNewGraphicProps | Readonly<UploadNewGraphicProps>) {
        super(props);
        this.state = {stage:Stage.Upload, graphic: null}
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
                       </div>
                   }

                   {this.state.stage == Stage.Preview && this.state.graphic != null &&
                       <div className={"preview-graphic-content"}>
                           <GraphicGroupDetail group={this.state.graphic} onChange={(old, group) => this.setState({graphic: group})}></GraphicGroupDetail>
                           <button className={"pretty-button"} onClick={this.OnGraphicConfirmed}>Next</button>
                       </div>
                   }

                   {this.state.stage == Stage.LaserMode && this.state.graphic != null &&
                       <div className={"laser-mode-select-content"}>
                           <label>Set the correct modes for each color</label>
                           <div className={"laser-mode-list"}>
                               <span>a</span>
                               <SubGraphicDetail subGraphic={this.state.graphic.subGraphics[0]} onChange={this.OnSubGraphicChanged}/>
                               <span>b</span>
                           </div>
                           <button className={"pretty-button"} onClick={this.OnModesConfirmed}>Next</button>
                       </div>
                   }
               </div>
           </div>
       </div>
    }

    OnSubGraphicChanged = (old: SvgSubGraphic, newGraphic: SvgSubGraphic) =>
    {
        this.setState(state => {
            if (state.graphic == null)
            {
                return state
            }
            return {...state, graphic:{...state.graphic, subGraphics: state.graphic.subGraphics.map(sub => {
                        if (sub == old)
                        {
                            return newGraphic
                        }
                        return sub
                    })
            }}
        })
    }

    OnModesConfirmed = (event: React.MouseEvent<HTMLButtonElement>) => {
        this.setState({stage: Stage.Upload})
        this.props.dispatch({type: EngraveActionType.GraphicAddFinished, graphic:this.state.graphic})
    }

    OnGraphicConfirmed = (event: React.MouseEvent<HTMLButtonElement>) => {
        this.setState({stage: Stage.LaserMode})
    }

    OnGraphicCancelled = (event: React.MouseEvent<HTMLButtonElement>) => {
        this.setState({stage: Stage.Upload})
        this.props.dispatch({type: EngraveActionType.GraphicAddFinished, graphic: null})
    }

    OnFileChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files == null)
            return

        const formData = new FormData();
        if (event.target.files[0] != null)
        {
            // Update the formData object
            formData.append(
                "file",
                event.target.files[0],
                event.target.files[0].name
            );
            axios.post(`${process.env.REACT_APP_API}/graphic`, formData)
                .then(response => this.setState({stage: Stage.Preview, graphic: response.data}))
        }
    }
}
