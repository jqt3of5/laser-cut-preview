import React, {Component, Dispatch, useEffect, useState} from "react";
import {GraphicGroup, SvgSubGraphic} from "../../common/dto";
import './UploadNewGraphicDialog.css'
import '../../common/common.css'
import {EngraveActionType, EngraveAppAction, EngraveAppState} from "../Views/EngraveAppState";
import {GraphicGroupDetail, SubGraphicDetail, GraphicDetails} from "./GraphicDetails";
import {DimensionUnits} from "../../common/Dimension";

enum Stage {
    Preview,
    LaserMode
}
export interface UploadNewGraphicState
{
    subGraphicIndex : number
    graphic : GraphicGroup| null
    stage : Stage
}

export interface UploadNewGraphicProps
{
    //TODO: Units could belong to a context
    units: DimensionUnits
    isShowing : boolean
    graphic : GraphicGroup | null
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
   }
}

export function UploadNewGraphicDialog(props: UploadNewGraphicProps)
{
    let [{subGraphicIndex, graphic, stage}, setState] = useState({
        subGraphicIndex: 0,
        graphic: props.graphic,
        stage: Stage.Preview
    })

    useEffect(() => {
       setState({subGraphicIndex: 0, graphic: props.graphic, stage: Stage.Preview})
    },[props.graphic, props.isShowing])

    if (!props.isShowing)
    {
        return null
    }

   return <div className={"modal"}>
       <div className={"modal-dialog"}>
           <div className={"modal-dialog-header bottom-separator"}>
               <label>{titleForStage(stage)}</label>
               <span className="close textButton" onClick={onGraphicCancelled}>&times;</span>
           </div>
           <div className={"modal-content-container"}>

               {stage == Stage.Preview && graphic != null &&
                   <div className={"preview-graphic-content"}>
                       <GraphicGroupDetail group={graphic} onChange={(old, group) => setState({stage: stage, subGraphicIndex: subGraphicIndex, graphic: group})}/>
                       <button className={"pretty-button"} onClick={onGraphicConfirmed}>Next</button>
                   </div>
               }

               {stage == Stage.LaserMode && graphic != null &&
                   <div className={"laser-mode-select-content"}>
                       <div className={"laser-mode-list"}>
                           <span className={"textButton"} onClick={onPrevious}>&#8249;</span>
                           <SubGraphicDetail subGraphic={graphic.subGraphics[subGraphicIndex]} onChange={onSubGraphicChanged}/>
                           <span className={"textButton"} onClick={onNext}>&#8250;</span>
                       </div>
                       <span>{subGraphicIndex + 1}/{graphic.subGraphics.length}</span>
                       <button className={"pretty-button"} onClick={onModesConfirmed}>Next</button>
                   </div>
               }
           </div>
       </div>
   </div>
    function onNext () {
        if( graphic != null)
        {
            if (subGraphicIndex < (graphic.subGraphics.length - 1))
            {
               setState({graphic: graphic, stage: stage, subGraphicIndex: subGraphicIndex+1})
            }
        }
    }
    function onPrevious()  {
        if( graphic != null)
        {
            if (subGraphicIndex > 0)
            {
                setState({graphic: graphic, stage: stage, subGraphicIndex: subGraphicIndex-1})
            }
        }
    }
    function onSubGraphicChanged (old: SvgSubGraphic, newGraphic: SvgSubGraphic)
    {
        if (graphic == null)
        {
            return {subGraphicIndex: subGraphicIndex, graphic: graphic, stage: stage}
        }

        setState({subGraphicIndex: subGraphicIndex, stage: stage, graphic:{...graphic, subGraphics: graphic.subGraphics.map(sub => {
                        if (sub == old)
                        {
                            return newGraphic
                        }
                        return sub
                    })
            }})
    }

    function onModesConfirmed (event: React.MouseEvent<HTMLButtonElement>) {
        props.dispatch({type: EngraveActionType.GraphicAddFinished, graphic:graphic})
    }

    function onGraphicConfirmed (event: React.MouseEvent<HTMLButtonElement>) {
        setState({subGraphicIndex: subGraphicIndex, graphic: graphic, stage: Stage.LaserMode})
    }

    function onGraphicCancelled (event: React.MouseEvent<HTMLButtonElement>) {
        props.dispatch({type: EngraveActionType.GraphicAddFinished, graphic: null})
    }
}
