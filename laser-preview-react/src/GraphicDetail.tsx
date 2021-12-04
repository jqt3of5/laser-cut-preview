import React, {Dispatch, SyntheticEvent} from "react";
import {GraphicGroup, LaserMode, SvgSubGraphic} from "./common/data";

import Button from 'react-bootstrap/Button';
import {Dimension, ToUnitName} from "./common/Dimension";
import {ActionType, AppAction} from "./AppState";

export interface GraphicProps {
    graphic: GraphicGroup
    dispatch: Dispatch<AppAction>
}

interface GraphicColorProps
{
    color: SvgSubGraphic
    onChange: (oldColor:SvgSubGraphic, newColor: SvgSubGraphic) => void
}

function GraphicColor(props : GraphicColorProps)
{
    return (
        <div className={"graphic-color-item bottom-separator"}>
            <div className={"graphic-color-img"}>
                <img src={process.env.REACT_APP_API + props.color.url}/>
            </div>
            <div className={"graphic-color-select"}>
                <select className={"graphic-line-color-mode pretty-select"} 
                        value={LaserMode[props.color.mode]}
                        onChange={e => props.onChange(props.color, {...props.color, mode:e.currentTarget.selectedIndex})}>
                    <option value={"Cut"}>Cut</option>
                    <option value={"Score"}>Score</option>
                    <option value={"Engrave"}>Engrave</option>
                </select>
            </div>
        </div>)
}

export function GraphicDetail(props : GraphicProps) {
    return (
        <div className={"graphic-detail"}>
            {/*<img className="graphic-preview" src={ServerURL + this.props.graphic.url}></img>*/}
            <div className={"graphic-detail-header"}>
                <label>{props.graphic.name}</label>
                <Button variant={"warning"} onClick={event => props.dispatch({type:ActionType.GraphicDeleted, graphic: props.graphic})}>delete</Button>
            </div>
            <div className={"graphic-dimensions"}>
                <div className={"graphic-dimension"}>
                    <label>Width</label>
                    <div className={"fancy-input"}>
                        <input className={"input-entry"} value={props.graphic.width.value} onChange={onWidthChange}/><div className={"input-unit"}>{ToUnitName(props.graphic.width.unit)}</div>
                    </div>
                </div>
                <div className={"graphic-dimension"}>
                    <label>Height</label>
                    <div className={"fancy-input"}>
                        <input className={"input-entry"} value={props.graphic.height.value} onChange={onHeightChange}/><div className={"input-unit"}>{ToUnitName(props.graphic.height.unit)}</div>
                    </div>
                </div>
            </div>
            <div className={"graphic-colors"}>
                {
                    props.graphic.subGraphics.map(color => <GraphicColor color={color} onChange={onColorChange}/>)
                }
            </div>
        </div>
    )

    function onColorChange (oldColor : SvgSubGraphic, newColor : SvgSubGraphic) {
        props.dispatch({
            type: ActionType.GraphicChanged, graphic: {
                ...props.graphic,
                //Replace the old color with the new color
                subGraphics: props.graphic.subGraphics.map(c => {
                    if (c == oldColor) {
                        return newColor
                    }
                    return c
                })
            }
        })
    }

    function onWidthChange (event : SyntheticEvent<HTMLInputElement>) {
        let width = parseInt(event.currentTarget.value)
         if (event.currentTarget.value == "")
         {
             width = 0
         }
        if (isNaN(width))
        {
            props.dispatch({type: ActionType.GraphicChanged, graphic:props.graphic})
            return
        }
        //TODO: Scaling should maintain ratio
        props.dispatch({type: ActionType.GraphicChanged, graphic:{...props.graphic, width: new Dimension(width, props.graphic.width.unit)}})
    }

    function onHeightChange (event : SyntheticEvent<HTMLInputElement>) {
        let height = parseInt(event.currentTarget.value)
        if (event.currentTarget.value == "")
        {
            height = 0
        }
        if (isNaN(height))
        {
            props.dispatch({type: ActionType.GraphicChanged, graphic:props.graphic})
            return
        }
        //TODO: Scaling should maintain ratio
        props.dispatch({type: ActionType.GraphicChanged, graphic:{...props.graphic, height: new Dimension(height, props.graphic.height.unit)}})
    }
}