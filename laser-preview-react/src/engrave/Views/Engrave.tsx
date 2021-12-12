// @ts-ignore
import logo from '../../Assets/Craft_Closet_Logo.webp'

import axios from 'axios';

import './Engrave.css';
import { useCookies } from 'react-cookie';
import React, {useEffect} from "react";
import {CutView} from "../Components/CutView";
import {GraphicDetails} from "../Components/GraphicDetails";
import {GraphicGroup, Project} from "../../common/dto";
import {PrettyButton} from "../../common/PrettyButton";
import {ConvertTo, Dimension, DimensionUnits} from "../../common/Dimension";
import {EngraveActionType, EngraveAppAction, EngraveAppState} from "./EngraveAppState";
import {UploadNewGraphicDialog} from "../Components/UploadNewGraphicDialog";
import {v4 as uuidv4} from 'uuid';
import {ConvertGraphicToUnits} from "../../common/busi";

interface AppProps {
}

function reducer(state : EngraveAppState, action : EngraveAppAction) : EngraveAppState
{
    switch(action.type)
    {
        case EngraveActionType.SelectMaterial:
            if (state.project == null)
            {
                return state;
            }
            return {...state, project:{...state.project, material:action.material}}
        case EngraveActionType.GraphicChanged:
            if (state.project == null)
            {
                return state;
            }
            return {...state, project:{...state.project, graphics:state.project.graphics.map(g => {
                       if (g.guid == action.graphic.guid)
                       {
                           return action.graphic
                       }
                       return g
                    })
            }}
        case EngraveActionType.GraphicDeleted:
            if (state.project == null)
            {
                return state;
            }
            return {...state, project:{...state.project, graphics:state.project.graphics.filter(g => g.guid != action.graphic.guid)}}

        case EngraveActionType.GraphicAddFinished:
            if (action.graphic == null)
            {
                return {...state, isUploadingNewGraphic: false}
            }
            if (state.project == null)
            {
                return state;
            }
            //Ensure the graphic units are the same as the board's
            return {...state,isUploadingNewGraphic: false, project:{...state.project, graphics: state.project.graphics.concat(ConvertGraphicToUnits(action.graphic, state.project.boardHeight.unit))}}
        case EngraveActionType.StartAddingNewGraphic:
            return {...state, isUploadingNewGraphic: true}
        case EngraveActionType.UpdateMaterials:
            return {...state, materials: action.materials}
        case EngraveActionType.UpdateProject:
            return {...state, project: action.project}
        case EngraveActionType.SetUnits:
            if (state.project == null)
            {
                return state;
            }
            var proj = state.project
            return {...state, unit: action.unit, project: {...state.project,
                    boardWidth: ConvertTo(state.project.boardWidth, action.unit),
                    boardHeight: ConvertTo(state.project.boardHeight, action.unit),
                    graphics: state.project.graphics.map(g => ConvertGraphicToUnits(g, proj.boardHeight.unit))}}
        default:
            return state
    }
}

function Engrave (props : AppProps)
{
    const [{fileToUpload, materials, project, unit, isSubmittingOrder, isUploadingNewGraphic}, dispatch] = React.useReducer(reducer, {
        fileToUpload:null,
        materials:[],
        project: null,
        unit: DimensionUnits.Inches,
        isSubmittingOrder: false,
        isUploadingNewGraphic: false
    })

    const [cookies, setCookie] = useCookies(['projectId'])

    if (cookies.projectId == null)
    {
        setCookie('projectId', uuidv4())
    }

    useEffect(() => {
        axios.get(process.env.REACT_APP_API + "/project/" + cookies.projectId).then(response => {
                dispatch({type:EngraveActionType.UpdateProject,  project: response.data})
            }).catch(reason => console.log(reason))

        axios.get(process.env.REACT_APP_API + "/materials").then(response => {
                dispatch({type:EngraveActionType.UpdateMaterials,  materials: response.data})
            }).catch(reason => console.log(reason))

    },  [])

    useEffect(() => {
        if (project == null)
        {
            return;
        }
        axios.post(process.env.REACT_APP_API + "/project/" + project.projectId, project)
            .then(response => {
                //TODO: I want the server to be able to make decisions and modify the project on the way back.
                // dispatch({type: ActionType.UpdateProject, project: response.data})
            }).catch(reason => console.log(reason))
    }, [project])

    return (
        <div className="App">
            <UploadNewGraphicDialog dispatch={dispatch} isShowing={isUploadingNewGraphic} units={unit}/>

            <div className="App-header">
                <div className="logo">
                    <a href="https://CraftCloset.com">
                        <img src={logo}/>
                    </a>
                </div>
                <PrettyButton className={"save-and-order-button"}>Save and Order</PrettyButton>
            </div>

            <div className={"App-content"}>
                {project != null &&
                    <CutView material={project.material} graphics={project.graphics} boardHeight={project.boardHeight}
                         boardWidth={project.boardWidth} dispatch={dispatch}/>
                }

                <div className="detailBar">
                    <div className={"configuration-view bottom-separator"}>
                        <div className={"configuration-header"}>
                            <h2>Details</h2>
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

                    <div className={"add-graphic-detail bottom-separator"}>
                        <span onClick={e => dispatch({type: EngraveActionType.StartAddingNewGraphic})}>Click to upload a new SVG</span>
                        <button className={"pretty-button"} onClick={e => dispatch({type: EngraveActionType.StartAddingNewGraphic})}>&#43;</button>
                    </div>

                    {project != null &&
                        project.graphics.map((graphic : GraphicGroup) => <GraphicDetails key={graphic.guid} group={graphic} onChange={(old, group) => {
                            if (group == null)
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
}

export default Engrave;
