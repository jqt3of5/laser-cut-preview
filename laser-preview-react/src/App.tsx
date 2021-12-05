// @ts-ignore
import logo from './Assets/Craft_Closet_Logo.webp'

import axios from 'axios';

import './App.css';
import React, {Component, useEffect} from "react";
import {CutView} from "./CutView";
import {GraphicDetail} from "./GraphicDetail";
import {GraphicGroup, Material, MaterialCategory, Project} from "./common/data";
import {PrettyButton} from "./PrettyButton";
import {ConvertTo, Dimension, DimensionUnits} from "./common/Dimension";
import {ActionType, AppAction, AppState} from "./AppState";

interface AppProps {
    project: Project
}

function reducer(state : AppState, action : AppAction) : AppState
{
    switch(action.type)
    {
        case ActionType.SelectMaterial:
            return {...state, project:{...state.project, material:action.material}}
        case ActionType.GraphicChanged:
            return {...state, project:{...state.project, graphics:state.project.graphics.map(g => {
                       if (g.guid == action.graphic.guid)
                       {
                           return action.graphic
                       }
                       return g
                    })
            }}
        case ActionType.GraphicDeleted:
            return {...state, project:{...state.project, graphics:state.project.graphics.filter(g => g.guid != action.graphic.guid)}}

        case ActionType.GraphicAdded:
            //Ensure the graphic units are the same as the board's
            return {...state, project:{...state.project, graphics: state.project.graphics.concat(ConvertGraphicToUnits(action.graphic, state.project.boardHeight.unit))}}
        case ActionType.FileSelected:
            if (action.files != null)
                return {...state, fileToUpload: action.files[0]}
            return state
        case ActionType.UpdateMaterials:
            return {...state, materials: action.materials}
        case ActionType.UpdateProject:
            return {...state, project: action.project}
        case ActionType.SetUnits:
            return {...state, project: {...state.project,
                    boardWidth: ConvertTo(state.project.boardWidth, action.unit),
                    boardHeight: ConvertTo(state.project.boardHeight, action.unit),
                    graphics: state.project.graphics.map(g => ConvertGraphicToUnits(g, state.project.boardHeight.unit))}}
        default:
            return state
    }
}

function ConvertGraphicToUnits(graphic : GraphicGroup, unit: DimensionUnits) : GraphicGroup
{
    return {...graphic,
        width: ConvertTo(graphic.width, unit),
        height: ConvertTo(graphic.height, unit),
        posX: ConvertTo(graphic.posX, unit),
        posY: ConvertTo(graphic.posY, unit),
        subGraphics: graphic.subGraphics.map(sub => {
        return {...sub,
            width: ConvertTo(sub.width, unit),
            height: ConvertTo(sub.height, unit),
            posX: ConvertTo(sub.posX, unit),
            posY: ConvertTo(sub.posY, unit)}
    })}
}

App.defaultProps ={
    project:  {
        projectId: "112345", material: {id: "default", category: "", name: ""}, graphics: [],
        boardHeight: new Dimension(12, DimensionUnits.Inches), boardWidth: new Dimension(18, DimensionUnits.Inches)
    }
}

function App (props : AppProps)
{
    const [{fileToUpload, materials, project}, dispatch] = React.useReducer(reducer, {
        fileToUpload:null,
        materials:[],
        project: props.project
    })

    useEffect(() => {
        axios.get(process.env.REACT_APP_API + "/project/" + project.projectId).then(response => {
                dispatch({type:ActionType.UpdateProject,  project: response.data})
            }).catch(reason => console.log(reason))

        axios.get(process.env.REACT_APP_API + "/materials").then(response => {
                dispatch({type:ActionType.UpdateMaterials,  materials: response.data})
            }).catch(reason => console.log(reason))

    },  [])

    useEffect(() => {
        axios.post(process.env.REACT_APP_API + "/project/" + project.projectId, project)
            .then(response => {
                //TODO: I want the server to be able to make decisions and modify the project on the way back.
                // dispatch({type: ActionType.UpdateProject, project: response.data})
            }).catch(reason => console.log(reason))
    }, [project])

    return (
        <div className="App">
            <div className="App-header">
                <div className="logo">
                    <a href="https://CraftCloset.com">
                        <img src={logo}></img>
                    </a>
                </div>
                <PrettyButton className={"save-and-order-button"}>Save and Order</PrettyButton>
            </div>

            <div className={"App-content"}>
                <CutView material={project.material} graphics={project.graphics} boardHeight={project.boardHeight} boardWidth={project.boardWidth} dispatch={dispatch}/>

                <div className="detailBar">
                    <div className={"configuration-view bottom-separator"}>
                        <div className={"configuration-header"}>
                            <h2>Details</h2>
                        </div>
                        <select className={"pretty-select"} value={project.material.id}>
                            <option>Choose your material...</option>
                            {
                                materials.map(category =>
                                    <optgroup key={category.category} label={category.category}>
                                        {
                                            category.materials.map(material =>
                                                <option key={material.id} value={material.id} onClick={(e) => dispatch({type: ActionType.SelectMaterial, material:material})}>
                                                    {material.name}
                                                </option>
                                            )
                                        }
                                    </optgroup>)
                            }
                        </select>
                    </div>

                    <div className={"add-graphic-detail bottom-separator"}>
                        <input type={"file"} accept={".pdf, .svg"} onChange={(e) => dispatch({type: ActionType.FileSelected, files: e.target.files})}/>
                        <button className={"pretty-button"} onClick={onFileUpload}>Upload</button>
                    </div>
                    {
                        project.graphics.map((graphic : GraphicGroup) => <GraphicDetail key={graphic.guid} graphic={graphic} dispatch={dispatch}/> )
                    }
                </div>
            </div>
        </div>
    );

    function onFileUpload (event: React.MouseEvent<HTMLButtonElement>) {
        const formData = new FormData();
        if (fileToUpload != null)
        {
            // Update the formData object
            formData.append(
                "file",
                fileToUpload,
                fileToUpload.name
            );
            axios.post(`${process.env.REACT_APP_API}/graphic`, formData).then(response => dispatch({type:ActionType.GraphicAdded, graphic:response.data}))
        }
    }
}

export default App;
