import React, {Dispatch, SyntheticEvent} from "react";
import {GraphicGroup, LaserMode, SvgSubGraphic} from "./common/data";

import Button from 'react-bootstrap/Button';
import {Dimension, ToUnitName} from "./common/Dimension";
import {ActionType, AppAction} from "./AppState";

export interface SubGraphicDetailProps
{
    subGraphic: SvgSubGraphic
    onChange: (oldSubGraphic:SvgSubGraphic, newSubGraphic: SvgSubGraphic) => void
}

export function SubGraphicDetail(props : SubGraphicDetailProps)
{
    return (
        <div className={"graphic-color-item bottom-separator"}>
            <div className={"graphic-color-img"}>
                <img src={process.env.REACT_APP_API + props.subGraphic.url}/>
            </div>
            <div className={"graphic-color-select"}>
                <label>Select laser mode: </label>
                <select className={"graphic-line-color-mode pretty-select"} 
                        value={LaserMode[props.subGraphic.mode]}
                        onChange={e => props.onChange(props.subGraphic, {...props.subGraphic, mode:e.currentTarget.selectedIndex})}>
                    <option value={"Cut"}>Cut</option>
                    <option value={"Score"}>Score</option>
                    <option value={"Engrave"}>Engrave</option>
                </select>
            </div>
        </div>)
}

export interface GraphicGroupDetailProps
{
    group: GraphicGroup
    onChange: (oldGroup:GraphicGroup, newGroup: GraphicGroup) => void
}

export function GraphicGroupDetail(props : GraphicGroupDetailProps)
{
    function onWidthChange (event : SyntheticEvent<HTMLInputElement>) {
        let width = parseInt(event.currentTarget.value)
        if (event.currentTarget.value == "")
        {
            width = 0
        }
        if (isNaN(width))
        {
            props.onChange(props.group, props.group)
            return
        }
        //TODO: Scaling should maintain ratio
        props.onChange(props.group, {...props.group, width: new Dimension(width, props.group.width.unit)})
    }

    function onHeightChange (event : SyntheticEvent<HTMLInputElement>) {
        let height = parseInt(event.currentTarget.value)
        if (event.currentTarget.value == "")
        {
            height = 0
        }
        if (isNaN(height))
        {
            props.onChange(props.group, props.group)
            return
        }
        //TODO: Scaling should maintain ratio
        props.onChange(props.group, {...props.group, height: new Dimension(height, props.group.height.unit)})
    }
    return (
        <div className={"graphic-detail"}>
            <div className={"graphic-detail-header"}>
                <label>{props.group.name}</label>
            </div>
            <div className={"graphic-dimensions"}>
                <div className={"graphic-dimension"}>
                    <label>Width</label>
                    <div className={"fancy-input"}>
                        <input className={"input-entry"} value={props.group.width.value} onChange={onWidthChange}/><div className={"input-unit"}>{ToUnitName(props.group.width.unit)}</div>
                    </div>
                </div>
                <div className={"graphic-dimension"}>
                    <label>Height</label>
                    <div className={"fancy-input"}>
                        <input className={"input-entry"} value={props.group.height.value} onChange={onHeightChange}/><div className={"input-unit"}>{ToUnitName(props.group.height.unit)}</div>
                    </div>
                </div>
            </div>
            <div className={"graphic-color-img"}>
                <img src={process.env.REACT_APP_API + props.group.url}/>
            </div>
        </div>)
}

export interface GraphicProps {
    group: GraphicGroup
    onChange: (oldGroup:GraphicGroup, newGroup: GraphicGroup | null) => void
}

export function SubGraphicListDetails(props : GraphicProps) {
    return (
        <div className={"graphic-detail"}>
            <div className={"graphic-detail-header"}>
                <label>{props.group.name}</label>
                <Button variant={"warning"} onClick={event => props.onChange(props.group, null)}>delete</Button>
            </div>
            <div className={"graphic-dimensions"}>
                <div className={"graphic-dimension"}>
                    <label>Width</label>
                    <div className={"fancy-input"}>
                        <input className={"input-entry"} value={props.group.width.value} onChange={onWidthChange}/><div className={"input-unit"}>{ToUnitName(props.group.width.unit)}</div>
                    </div>
                </div>
                <div className={"graphic-dimension"}>
                    <label>Height</label>
                    <div className={"fancy-input"}>
                        <input className={"input-entry"} value={props.group.height.value} onChange={onHeightChange}/><div className={"input-unit"}>{ToUnitName(props.group.height.unit)}</div>
                    </div>
                </div>
            </div>
            <div className={"graphic-colors"}>
                {
                    props.group.subGraphics.map(color => <SubGraphicDetail subGraphic={color} onChange={onColorChange}/>)
                }
            </div>
        </div>
    )

    function onColorChange (oldColor : SvgSubGraphic, newColor : SvgSubGraphic) {
        props.onChange(props.group,
            {
                ...props.group,
                //Replace the old color with the new color
                subGraphics: props.group.subGraphics.map(c => {
                    if (c == oldColor) {
                        return newColor
                    }
                    return c
                })
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
            props.onChange(props.group, props.group)
            return
        }
        //TODO: Scaling should maintain ratio
        props.onChange(props.group,{...props.group, width: new Dimension(width, props.group.width.unit)})
    }

    function onHeightChange (event : SyntheticEvent<HTMLInputElement>) {
        let height = parseInt(event.currentTarget.value)
        if (event.currentTarget.value == "")
        {
            height = 0
        }
        if (isNaN(height))
        {
            props.onChange(props.group, props.group)
            return
        }
        //TODO: Scaling should maintain ratio
        props.onChange(props.group,{...props.group, height: new Dimension(height, props.group.height.unit)})
    }
}