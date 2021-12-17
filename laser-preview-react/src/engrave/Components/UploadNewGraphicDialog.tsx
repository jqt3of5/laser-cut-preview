import React, {Dispatch, useEffect, useState} from "react";
import {SvgGraphicGroup, SvgSubGraphic} from "../../common/dto";
import './UploadNewGraphicDialog.css'
import '../../common/common.css'
import {EngraveActionType, EngraveAppAction} from "../Views/EngraveAppState";
import {GraphicGroupDetail, SubGraphicDetail} from "./GraphicDetails";
import {DimensionUnits} from "../../common/Dimension";
import {Button, Modal} from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

enum Stage {
    Preview,
    LaserMode
}
export interface UploadNewGraphicState
{
    subGraphicIndex : number
    graphic : SvgGraphicGroup| null
    stage : Stage
}

export interface UploadNewGraphicProps
{
    //TODO: Units could belong to a context
    units: DimensionUnits
    isShowing : boolean
    graphic : SvgGraphicGroup | null
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

   return <Modal show={props.isShowing} onHide={onGraphicCancelled}>
      <Modal.Header closeButton>
          <Modal.Title>
              {titleForStage(stage)}
          </Modal.Title>
      </Modal.Header>
       <Modal.Body>
           {stage===Stage.Preview && graphic !==null &&
               <div className={"preview-graphic-content"}>
                   <GraphicGroupDetail group={graphic} onChange={(old, group) => setState({stage: stage, subGraphicIndex: subGraphicIndex, graphic: group})}/>
               </div>
           }

           {stage===Stage.LaserMode && graphic !==null &&
               <div className={"laser-mode-select-content"}>
                   <div className={"laser-mode-list"}>
                       <span className={"textButton"} onClick={onPrevious}>&#8249;</span>
                       <SubGraphicDetail subGraphic={graphic.subGraphics[subGraphicIndex]} onChange={onSubGraphicChanged}/>
                       <span className={"textButton"} onClick={onNext}>&#8250;</span>
                   </div>
                   <span>{subGraphicIndex + 1}/{graphic.subGraphics.length}</span>
               </div>
           }
       </Modal.Body>
       <Modal.Footer>

           {stage===Stage.LaserMode && graphic !==null &&
               <label className={"footer-label"}>For each color detected in your SVG, please select the laser mode, then click finish.</label>
           }
           {stage===Stage.LaserMode && graphic !==null &&
               <Button variant={"primary"} onClick={onModesConfirmed}>Finish</Button>
           }
           {stage===Stage.Preview && graphic !==null &&
               <Button variant={"primary"} onClick={onGraphicConfirmed}>Next</Button>
           }
       </Modal.Footer>
   </Modal>

    function onNext () {
        if( graphic !==null)
        {
            if (subGraphicIndex < (graphic.subGraphics.length - 1))
            {
               setState({graphic: graphic, stage: stage, subGraphicIndex: subGraphicIndex+1})
            }
        }
    }
    function onPrevious()  {
        if( graphic !==null)
        {
            if (subGraphicIndex > 0)
            {
                setState({graphic: graphic, stage: stage, subGraphicIndex: subGraphicIndex-1})
            }
        }
    }
    function onSubGraphicChanged (old: SvgSubGraphic, newGraphic: SvgSubGraphic)
    {
        if (graphic===null)
        {
            return {subGraphicIndex: subGraphicIndex, graphic: graphic, stage: stage}
        }

        setState({subGraphicIndex: subGraphicIndex, stage: stage, graphic:{...graphic, subGraphics: graphic.subGraphics.map(sub => {
                        if (sub===old)
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

    function onGraphicCancelled () {
        props.dispatch({type: EngraveActionType.GraphicAddFinished, graphic: null})
    }
}
