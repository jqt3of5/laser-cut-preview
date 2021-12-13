// @ts-ignore
import logo from '../../Assets/Craft_Closet_Logo.webp'

import axios from 'axios';

import './Engrave.css';
import {useCookies} from 'react-cookie';
import React, {useEffect, useRef} from "react";
import {CutView, SnapTo} from "../Components/CutView";
import {GraphicDetails} from "../Components/GraphicDetails";
import {GraphicGroup} from "../../common/dto";
import {ConvertTo, DimensionUnits} from "../../common/Dimension";
import {EngraveActionType, EngraveAppAction, EngraveAppState} from "./EngraveAppState";
import {UploadNewGraphicDialog} from "../Components/UploadNewGraphicDialog";
import {v4 as uuidv4} from 'uuid';
import {ConvertGraphicToUnits} from "../../common/busi";
import {SubmitAndOrderDialog} from "../Components/SubmitAndOrderDialog";
import {Button} from "react-bootstrap";

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
        case EngraveActionType.GraphicChanged:
            if (state.project===null)
            {
                return state;
            }
            return {...state, project:{...state.project, graphics:state.project.graphics.map(g => {
                       if (g.guid===action.graphic.guid)
                       {
                           return action.graphic
                       }
                       return g
                    })
            }}
        case EngraveActionType.GraphicDeleted:
            if (state.project===null)
            {
                return state;
            }
            return {...state, project:{...state.project, graphics:state.project.graphics.filter(g => g.guid !==action.graphic.guid)}}

        case EngraveActionType.GraphicAddFinished:
            if (action.graphic===null)
            {
                return {...state, isUploadingNewGraphic: false}
            }
            if (state.project===null)
            {
                return state;
            }
            //Ensure the graphic units are the same as the board's
            return {...state,isUploadingNewGraphic: false, project:{...state.project, graphics: state.project.graphics.concat(ConvertGraphicToUnits(action.graphic, state.project.boardHeight.unit))}}
        case EngraveActionType.StartAddingNewGraphic:
            return {...state, isUploadingNewGraphic: true, addingGraphic: action.graphic}
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
                    graphics: state.project.graphics.map(g => ConvertGraphicToUnits(g, proj.boardHeight.unit))}}
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
                // dispatch({type: EngraveActionType.UpdateProject, project: response.data, shouldSave: false})
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
                {project !==null &&
                    <CutView material={project.material} graphics={project.graphics} boardHeight={project.boardHeight}
                         boardWidth={project.boardWidth} snapTo={snapTo} dispatch={dispatch}/>
                }

                <div className="detailBar">
                    <div className={"configuration-view bottom-separator"}>
                        <div className={"configuration-header"}>
                            <h2>Details</h2>
                            <span className={"textButton"} onClick={e => {fileInputRef.current?.click()}}>&#43;</span>
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
                        project.graphics.map((graphic : GraphicGroup) => <GraphicDetails key={graphic.guid} group={graphic} onChange={(old, group) => {
                            if (group===null)
                            {
                                dispatch({type: EngraveActionType.GraphicDeleted, graphic: old})
                            }
                            else
                            {
                                dispatch({type: EngraveActionType.GraphicChanged, graphic: group})
                            }
                        }}/> )
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
                    var graphic = response.data as GraphicGroup
                    graphic =  ConvertGraphicToUnits(graphic, unit)
                    dispatch({type: EngraveActionType.StartAddingNewGraphic, graphic: graphic})
                })
        }
    }
}

export default Engrave;
