// @ts-ignore
import logo from '../../Assets/Craft_Closet_Logo.webp'

import axios from 'axios';

import './Engrave.css';
import {useCookies} from 'react-cookie';
import React, {useEffect, useRef} from "react";
import {CutView, SnapTo} from "../Components/CutView";
import {GraphicDetails, SubGraphicDetail, TextDetail} from "../Components/GraphicDetails";
import {DrawableObject, DrawableObjectType, LaserMode, SvgGraphicGroup, TextObject} from "../../common/dto";
import {ConvertTo, Dimension, DimensionUnits} from "../../common/Dimension";
import {EngraveActionType, EngraveAppAction, EngraveAppState} from "./EngraveAppState";
import {UploadNewGraphicDialog} from "../Components/UploadNewGraphicDialog";
import {v4 as uuidv4} from 'uuid';
import {ConvertObjectUnits} from "../../common/busi";
import {SubmitAndOrderDialog} from "../Components/SubmitAndOrderDialog";
import {Button, Dropdown} from "react-bootstrap";
import DropdownToggle from "react-bootstrap/DropdownToggle";

function reducer(state : EngraveAppState, action : EngraveAppAction) : EngraveAppState
{
    switch(action.type)
    {
        case EngraveActionType.SelectMaterial:
            if (state.project===null)
            {
                return state;
            }
            return {...state, project:{...state.project, material:action.material}}
        case EngraveActionType.ObjectChanged:
            if (state.project===null)
            {
                return state;
            }
            return {...state, project:{...state.project, objects:state.project.objects.map(object => {
                       if (object === action.oldObject)
                       {
                           return action.object
                       }
                       return object
                    })
            }}
        case EngraveActionType.ObjectDeleted:
            if (state.project===null)
            {
                return state;
            }
            return {...state, project:{...state.project, objects:state.project.objects.filter(g => g !== action.object)}}

        case EngraveActionType.TextObjectAdded:
            if (state.project === null)
            {
                return state
            }
            let textObject = {type: DrawableObjectType.TextObject,
                text: "Testing text",
                font : "Helvetica",
                fontSize: 96,
                textAlign: "start",
                mode: LaserMode.Engrave,
                posX : new Dimension(1, DimensionUnits.Inches),
                posY : new Dimension(1, DimensionUnits.Inches),
                width : new Dimension(1, DimensionUnits.Inches),
                height : new Dimension(1, DimensionUnits.Inches)} as TextObject

            return {...state, project:{...state.project, objects:state.project.objects.concat(textObject)}}
        case EngraveActionType.GraphicAddFinished:
            if (action.graphic===null)
            {
                return {...state, isUploadingNewGraphic: false}
            }
            if (state.project===null)
            {
                return state;
            }
            //The graphic should already be in the correct units
            return {...state,isUploadingNewGraphic: false, project:{...state.project, objects: state.project.objects.concat(action.graphic)}}
        case EngraveActionType.StartAddingNewGraphic:
            let graphic =  ConvertObjectUnits(action.graphic, state.unit) as SvgGraphicGroup
            return {...state, isUploadingNewGraphic: true, addingGraphic: graphic}
        case EngraveActionType.UpdateMaterials:
            return {...state, materials: action.materials}
        case EngraveActionType.UpdateProject:
            return {...state, project: action.project}
        case EngraveActionType.SetUnits:
            if (state.project===null)
            {
                return state;
            }
            var proj = state.project
            return {...state, unit: action.unit, project: {...state.project,
                    boardWidth: ConvertTo(state.project.boardWidth, action.unit),
                    boardHeight: ConvertTo(state.project.boardHeight, action.unit),
                    objects: state.project.objects.map(g => ConvertObjectUnits(g, proj.boardHeight.unit))}}
        case EngraveActionType.StartSubmitingOrder:
            return {...state, isSubmittingOrder: true}
        case EngraveActionType.OrderSubmited:
            return {...state, isSubmittingOrder: false}
        default:
            return state
    }
}

interface AppProps {
}

function Engrave (props : AppProps)
{
    const [{materials, project,addingGraphic, unit, snapTo, isSubmittingOrder, isUploadingNewGraphic}, dispatch] = React.useReducer(reducer, {
        materials:[],
        project: null,
        addingGraphic: null,
        unit: DimensionUnits.Inches,
        snapTo: SnapTo.Continuous,
        isSubmittingOrder: false,
        isUploadingNewGraphic: false
    })

    const [cookies, setCookie] = useCookies(['projectId'])
    if (cookies.projectId===undefined)
    {
        setCookie('projectId', uuidv4())
    }
    useEffect(() => {

        axios.get(process.env.REACT_APP_API + "/materials").then(response => {
            dispatch({type: EngraveActionType.UpdateMaterials, materials: response.data})
        }).catch(reason => console.log(reason))
    }, [])

    useEffect(() => {
        if (cookies.projectId !== undefined)
        {
            axios.get(process.env.REACT_APP_API + "/project/" + cookies.projectId).then(response => {
                dispatch({type:EngraveActionType.UpdateProject,  project: response.data})
            }).catch(reason => console.log(reason))
        }

    }, [cookies.projectId])

    useEffect(() => {
        if (project===null)
        {
            return;
        }
        axios.post(process.env.REACT_APP_API + "/project/" + project.projectId, project)
            .then(response => {
        //         dispatch({type: EngraveActionType.UpdateProject, project: response.data, shouldSave: false})
            }).catch(reason => console.log(reason))
    }, [project])

    let fileInputRef = useRef<HTMLInputElement>(null)
    return (
        <div className="App">
            <UploadNewGraphicDialog dispatch={dispatch} isShowing={isUploadingNewGraphic} units={unit} graphic={addingGraphic}/>
            <SubmitAndOrderDialog dispatch={dispatch} projectGuid={project?.projectId ?? ""} isShowing={isSubmittingOrder}/>

            <div className="App-header">
                <div className="logo">
                    <a href="https://CraftCloset.com">
                        <img alt={"https://CraftCloset.com"} src={logo}/>
                    </a>
                </div>
                <Button variant={"primary"} className={"save-and-order-button"} onClick={e => dispatch({type: EngraveActionType.StartSubmitingOrder})}>Save and Order</Button>
            </div>
            <div className={"App-content"}>
                {/*If the backend is down, this looks terrible*/}
                <div className={"cut-view-container"}>
                    {project !==null &&
                    <CutView material={project.material} objects={project.objects} boardHeight={project.boardHeight}
                             boardWidth={project.boardWidth} snapTo={snapTo} dispatch={dispatch}/>
                    }
                </div>

                <div className="detailBar">
                    <div className={"configuration-view bottom-separator"}>
                        <div className={"configuration-header"}>
                            <h2>Details</h2>
                            <Dropdown>
                                <DropdownToggle variant={"secondary"}>
                                   Add
                                </DropdownToggle>
                                <Dropdown.Menu>
                                   <Dropdown.Item onClick={e => fileInputRef.current?.click() }>Vector graphic</Dropdown.Item>
                                   <Dropdown.Item onClick={e => dispatch({type: EngraveActionType.TextObjectAdded})}>Text object</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>


                            <input ref={fileInputRef} style={{display: "none"}} type={"file"} accept={".pdf, .svg"} onChange={onFileChanged}/>
                        </div>
                        <select className={"pretty-select"} value={project?.material.id}>
                            <option>Choose your material...</option>
                            {
                                materials.map(category =>
                                    <optgroup key={category.category} label={category.category}>
                                        {
                                            category.materials.map(material =>
                                                <option key={material.id} value={material.id} onClick={(e) => dispatch({type: EngraveActionType.SelectMaterial, material:material})}>
                                                    {material.name}
                                                </option>
                                            )
                                        }
                                    </optgroup>)
                            }
                        </select>
                    </div>

                    {project !==null &&
                        project.objects.map((object: DrawableObject, index: number) => {
                            switch(object.type)
                            {
                                case DrawableObjectType.SvgGraphicGroup:
                                    return <GraphicDetails key={object.guid} group={object} onChange={(old, group) => {
                                        if (group === null)
                                            dispatch({type: EngraveActionType.ObjectDeleted, object: old})
                                        else
                                            dispatch({type: EngraveActionType.ObjectChanged, oldObject: old, object: group})
                                    }}/>
                                case DrawableObjectType.SubGraphic:
                                    return <SubGraphicDetail key={object.guid} subGraphic={object} onChange={(old, graphic) => {
                                        if (graphic === null)
                                            dispatch({type: EngraveActionType.ObjectDeleted, object: old})
                                        else
                                            dispatch({type: EngraveActionType.ObjectChanged, oldObject: old, object: graphic})
                                    }}/>
                                case DrawableObjectType.TextObject:
                                    return <TextDetail key={index} textObject={object} onChange={(old, graphic) => {
                                        if (graphic === null)
                                            dispatch({type: EngraveActionType.ObjectDeleted, object: old})
                                        else
                                            dispatch({type: EngraveActionType.ObjectChanged, oldObject: old, object: graphic})
                                    }}/>
                                default:
                                    return <div>Unsupported DrawableObject</div>
                            }
                        })
                    }
                </div>
            </div>
        </div>
    );

    function onFileChanged (event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.files===null)
            return

        const formData = new FormData();
        if (event.target.files[0] !==null)
        {
            // Update the formData object
            formData.append(
                "file",
                event.target.files[0],
                event.target.files[0].name
            );
            axios.post(`${process.env.REACT_APP_API}/graphic`, formData)
                .then(response => {
                    var graphic = response.data as SvgGraphicGroup
                    dispatch({type: EngraveActionType.StartAddingNewGraphic, graphic: graphic})
                })
        }
    }
}

export default Engrave;
