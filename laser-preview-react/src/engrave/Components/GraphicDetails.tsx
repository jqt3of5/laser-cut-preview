import React, {SyntheticEvent, useEffect, useState} from "react";
import {LaserMode, SvgGraphicGroup, SvgSubGraphic, TextObject} from "../../common/dto";

import Button from 'react-bootstrap/Button';
import {Dimension, DimensionUnits, ToUnitName} from "../../common/Dimension";
import './GraphicDetails.css'
import {ResizeGraphicGroup} from "../../common/busi";

export interface TextDetailProps
{
    textObject : TextObject
    onChange: (oldTextObject:TextObject, newTextObject: TextObject | null) => void
}
export function TextDetail(props : TextDetailProps)
{
    let fonts = ["Arial", "Verdana", "Helvetica", "Tahoma", "Trebuchet MS", "Times New Roman", "Georgia", "Garamond", "Courier New", "Bush Script MT"]

    return <div className={"text-object-item bottom-separator"}>
        <div className={"graphic-detail-header"}>
            <div className={"graphic-color-select"}>
                <label>Laser mode: </label>
                <select className={"graphic-text-align pretty-select"}
                        value={LaserMode[props.textObject.mode]}
                        onChange={e => props.onChange(props.textObject, {...props.textObject, mode:e.currentTarget.selectedIndex})}>
                    <option value={"Cut"}>Cut</option>
                    <option value={"Score"}>Score</option>
                    <option value={"Engrave"}>Engrave</option>
                </select>
            </div>
            <Button className={"graphic-delete"} variant={"warning"} onClick={event => props.onChange(props.textObject, null)}>delete</Button>
        </div>

        <div className={"text-format-options"}>
            <select className={"pretty-select"} value={props.textObject.font}>
                {
                    fonts.map(font => {
                        return <option style={{"fontFamily": font}} onClick={fontSelected}>{font}</option>
                    })
                }
            </select>
            <div className={"pretty-input"}>
                <input className={"input-entry"} value={props.textObject.fontSize} onChange={fontSizeSelected}/>
                <div className={"input-unit"}>{ToUnitName(DimensionUnits.Points)}</div>
            </div>
            <select className={"graphic-text-align pretty-select"}
                    value={props.textObject.textAlign}
                    onChange={e => {
                        let textObject =props.textObject
                        switch(e.currentTarget.value)
                        {
                            case "start":
                                textObject = {...textObject, textAlign: "start"}
                                break;
                            case "center":
                                textObject = {...textObject, textAlign: "center"}
                                break;
                            case "end":
                                textObject = {...textObject, textAlign: "end"}
                                break;
                        }
                        props.onChange(props.textObject, textObject)
                    }}>
                <option value={"start"}>Left</option>
                <option value={"center"}>Center</option>
                <option value={"end"}>Right</option>
            </select>
        </div>

        <textarea onChange={textchanged} value={props.textObject.text} rows={2} cols={20}></textarea>
    </div>

    function fontSelected(event : SyntheticEvent<HTMLOptionElement>)
    {
        props.onChange(props.textObject, {...props.textObject, font: event.currentTarget.value})
    }

    function fontSizeSelected(event : SyntheticEvent<HTMLInputElement>)
    {
        props.onChange(props.textObject, {...props.textObject, fontSize: parseFloat(event.currentTarget.value)})
    }

    function textchanged(event : SyntheticEvent<HTMLTextAreaElement>)
    {
       props.onChange(props.textObject, {...props.textObject, text: event.currentTarget.value})
    }
}

export interface SubGraphicDetailProps
{
    subGraphic: SvgSubGraphic
    onChange: (oldSubGraphic:SvgSubGraphic, newSubGraphic: SvgSubGraphic) => void
}

export function SubGraphicDetail(props : SubGraphicDetailProps)
{
    return (
        <div className={"graphic-color-item bottom-separator"}>

            <div className={"graphic-color-select"}>
                <label>Select laser mode: </label>
                <select className={"graphic-text-align pretty-select"}
                        value={LaserMode[props.subGraphic.mode]}
                        onChange={e => props.onChange(props.subGraphic, {...props.subGraphic, mode:e.currentTarget.selectedIndex})}>
                    <option value={"Cut"}>Cut</option>
                    <option value={"Score"}>Score</option>
                    <option value={"Engrave"}>Engrave</option>
                </select>
            </div>
            <div className={"graphic-color-img"}>
                <img alt={props.subGraphic.url} src={process.env.REACT_APP_API + props.subGraphic.url}/>
            </div>
        </div>)
}

export interface GraphicGroupDetailProps
{
    group: SvgGraphicGroup
    onChange: (oldGroup:SvgGraphicGroup, newGroup: SvgGraphicGroup) => void
}
interface GraphicGroupState {
    width: string,
    height: string,
    aspect: number
}

export function GraphicGroupDetail(props : GraphicGroupDetailProps)
{
    function onWidthChange (event : SyntheticEvent<HTMLInputElement>) {
        let w = parseFloat(event.currentTarget.value)

        if (event.currentTarget.value==="")
        {
            w = 0
        }

        if (w===0)
        {
            setState({height: height, aspect: aspect, width: "0"})
            return
        }

        if (isNaN(w))
        {
            setState({height: height, aspect: aspect, width: width})
            return
        }

        setState({height: (w / aspect).toFixed(3), aspect: aspect, width: event.currentTarget.value})
    }

    function onHeightChange (event : SyntheticEvent<HTMLInputElement>) {
        let h = parseFloat(event.currentTarget.value)
        if (event.currentTarget.value==="")
        {
            h = 0
        }

        if (h===0)
        {
            setState({height: "0", aspect: aspect, width: width})
        }
        if (isNaN(h))
        {
            setState({height: height, aspect: aspect, width: width})
            return
        }

        setState({height: event.currentTarget.value, aspect: aspect, width: (h * aspect).toFixed(3)})
    }

    function onFieldLostFocus(event : SyntheticEvent<HTMLInputElement>) {
        let group = ResizeGraphicGroup(props.group, new Dimension(parseFloat(width), props.group.width.unit), new Dimension(parseFloat(height), props.group.height.unit)) as SvgGraphicGroup
        props.onChange(props.group, group)
    }

    let [{width, height, aspect}, setState] = useState<GraphicGroupState>({width: props.group.width.value.toFixed(3), height: props.group.height.value.toFixed(3), aspect: props.group.width.value/props.group.height.value})

    useEffect(() => {
       setState({width: props.group.width.value.toFixed(3), height: props.group.height.value.toFixed(3), aspect: props.group.width.value/props.group.height.value})
    }, [props.group])

    return (
        <div className={"graphic-detail"}>
            <div className={"graphic-dimensions"}>
                <div className={"graphic-dimension"}>
                    <label>Width</label>
                    <div className={"pretty-input"}>
                        <input className={"input-entry"} value={width} onChange={onWidthChange} onBlur={onFieldLostFocus}/><div className={"input-unit"}>{ToUnitName(props.group.width.unit)}</div>
                    </div>
                </div>
                <div className={"graphic-dimension"}>
                    <label>Height</label>
                    <div className={"pretty-input"}>
                        <input className={"input-entry"} value={height} onChange={onHeightChange} onBlur={onFieldLostFocus}/><div className={"input-unit"}>{ToUnitName(props.group.height.unit)}</div>
                    </div>
                </div>
            </div>
            <div className={"graphic-color-img"}>
                <img alt={props.group.url} src={process.env.REACT_APP_API + props.group.url}/>
            </div>
            <div className={"graphic-detail-header"}>
                <label>{props.group.name}</label>
            </div>
        </div>)
}

export interface GraphicProps {
    group: SvgGraphicGroup
    onChange: (oldGroup:SvgGraphicGroup, newGroup: SvgGraphicGroup | null) => void
}

interface GraphicState {
   width: string,
    height: string,
    aspect: number
}

export function GraphicDetails(props : GraphicProps) {

    let [{width, height, aspect}, setState] = useState<GraphicState>({width: props.group.width.value.toFixed(3), height: props.group.height.value.toFixed(3), aspect: props.group.width.value/props.group.height.value})

    useEffect(() => {
        setState({width: props.group.width.value.toFixed(3), height: props.group.height.value.toFixed(3), aspect: props.group.width.value/props.group.height.value})
    }, [props.group])

    return (
        <div className={"graphic-detail"}>
            <div className={"graphic-detail-header"}>
                <label>{props.group.name}</label>
                <Button variant={"warning"} onClick={event => props.onChange(props.group, null)}>delete</Button>
            </div>
            <div className={"graphic-dimensions"}>
                <div className={"graphic-dimension"}>
                    <label>Width</label>
                    <div className={"pretty-input"}>
                        <input className={"input-entry"} value={width} onChange={onWidthChange} onBlur={onFieldLostFocus}/><div className={"input-unit"}>{ToUnitName(props.group.width.unit)}</div>
                    </div>
                </div>
                <div className={"graphic-dimension"}>
                    <label>Height</label>
                    <div className={"pretty-input"}>
                        <input className={"input-entry"} value={height} onChange={onHeightChange} onBlur={onFieldLostFocus}/><div className={"input-unit"}>{ToUnitName(props.group.height.unit)}</div>
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
                    if (c===oldColor) {
                        return newColor
                    }
                    return c
                })
        })
    }

    function onFieldLostFocus(event : SyntheticEvent<HTMLInputElement>) {
        let group = ResizeGraphicGroup(props.group, new Dimension(parseFloat(width), props.group.width.unit), new Dimension(parseFloat(height), props.group.height.unit)) as SvgGraphicGroup
        props.onChange(props.group, group)
    }

    function onWidthChange (event : SyntheticEvent<HTMLInputElement>) {
        let w = parseFloat(event.currentTarget.value)

        if (event.currentTarget.value==="")
        {
            w = 0
        }

        if (w===0)
        {
            setState({height: height, aspect: aspect, width: "0"})
            return
        }

        if (isNaN(w))
        {
            setState({height: height, aspect: aspect, width: width})
            return
        }

        setState({height: (w / aspect).toFixed(3), aspect: aspect, width: event.currentTarget.value})
    }

    function onHeightChange (event : SyntheticEvent<HTMLInputElement>) {
        let h = parseFloat(event.currentTarget.value)
        if (event.currentTarget.value==="")
        {
            h = 0
        }

        if (h===0)
        {
            setState({height: "0", aspect: aspect, width: width})
        }
        if (isNaN(h))
        {
            setState({height: height, aspect: aspect, width: width})
            return
        }

        setState({height: event.currentTarget.value, aspect: aspect, width: (h * aspect).toFixed(3)})
    }
}