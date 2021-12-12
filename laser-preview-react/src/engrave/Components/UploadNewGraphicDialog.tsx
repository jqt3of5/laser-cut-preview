import React, {Component, Dispatch} from "react";
import {GraphicGroup, SvgSubGraphic} from "../../common/dto";
import axios from "axios";
import {PrettyButton} from "../../common/PrettyButton";
import './UploadNewGraphicDialog.css'
import '../../common/common.css'
import {EngraveActionType, EngraveAppAction, EngraveAppState} from "../Views/EngraveAppState";
import {GraphicGroupDetail, SubGraphicDetail, GraphicDetails} from "./GraphicDetails";
import {DimensionUnits} from "../../common/Dimension";
import {ConvertGraphicToUnits} from "../../common/busi";

enum Stage {
    Upload,
    Preview,
    LaserMode
}
export interface UploadNewGraphicState
{
    subGraphicIndex : number
    graphic : GraphicGroup | null
    stage : Stage
}

export interface UploadNewGraphicProps
{
    //TODO: Units could belong to a context
    units: DimensionUnits
    isShowing : boolean
    dispatch : Dispatch<EngraveAppAction>
}

function titleForStage(stage : Stage) : string
{
   switch (stage)
   {
       case Stage.LaserMode:
           return "Modes for each color"
       case Stage.Preview:
           return "Your SVG"
       case Stage.Upload:
           return "Upload an SVG"
   }
}

export class UploadNewGraphicDialog extends Component<UploadNewGraphicProps, UploadNewGraphicState>
{
    constructor(props: UploadNewGraphicProps | Readonly<UploadNewGraphicProps>) {
        super(props);
        this.state = {stage:Stage.Upload, graphic: null, subGraphicIndex: 0}
    }

    resetState () {
        this.setState({stage:Stage.Upload, graphic: null, subGraphicIndex: 0})
    }

    render() {
        if (!this.props.isShowing)
        {
            return null
        }
       return <div className={"modal"}>
           <div className={"modal-dialog upload-dialog"}>
               <div className={"modal-dialog-header bottom-separator"}>
                   <label>{titleForStage(this.state.stage)}</label>
                   <span className="close textButton" onClick={this.OnGraphicCancelled}>&times;</span>
               </div>
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
                           <GraphicGroupDetail group={this.state.graphic} onChange={(old, group) => this.setState({graphic: group})}/>
                           <button className={"pretty-button"} onClick={this.OnGraphicConfirmed}>Next</button>
                       </div>
                   }

                   {this.state.stage == Stage.LaserMode && this.state.graphic != null &&
                       <div className={"laser-mode-select-content"}>
                           <div className={"laser-mode-list"}>
                               <span className={"textButton"} onClick={this.OnPrevious}>&#8249;</span>
                               <SubGraphicDetail subGraphic={this.state.graphic.subGraphics[this.state.subGraphicIndex]} onChange={this.OnSubGraphicChanged}/>
                               <span className={"textButton"} onClick={this.OnNext}>&#8250;</span>
                           </div>
                           <span>{this.state.subGraphicIndex + 1}/{this.state.graphic.subGraphics.length}</span>
                           <button className={"pretty-button"} onClick={this.OnModesConfirmed}>Next</button>
                       </div>
                   }
               </div>
           </div>
       </div>
    }

    OnNext = () => {
        if( this.state.graphic != null)
        {
            if (this.state.subGraphicIndex < (this.state.graphic.subGraphics.length - 1))
            {
               this.setState(state => {return {subGraphicIndex: state.subGraphicIndex+1}})
            }
        }
    }
    OnPrevious = () => {
        if( this.state.graphic != null)
        {
            if (this.state.subGraphicIndex > 0)
            {
                this.setState(state => {return {subGraphicIndex: state.subGraphicIndex-1}})
            }
        }
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
        this.resetState()
        this.props.dispatch({type: EngraveActionType.GraphicAddFinished, graphic:this.state.graphic})
    }

    OnGraphicConfirmed = (event: React.MouseEvent<HTMLButtonElement>) => {
        this.setState({stage: Stage.LaserMode})
    }

    OnGraphicCancelled = (event: React.MouseEvent<HTMLButtonElement>) => {
        this.resetState()
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
                .then(response => {
                    var graphic = response.data as GraphicGroup
                    graphic =  ConvertGraphicToUnits(graphic, this.props.units)
                    this.setState({stage: Stage.Preview, graphic: graphic})
                })
        }
    }
}
