import logo from './Assets/Craft_Closet_Logo.webp'

import axios from 'axios';

import './App.css';
import {ServerURL} from "./contexts/ProjectContext";
import React = require('react');
import {CutView} from "./CutView";
import {GraphicDetail} from "./GraphicDetail";
import {MaterialCategory, Project} from "../Server/data";
import {Component} from "react";

interface AppState {
    project: Project,
    selectedGraphic: any,
    materials: MaterialCategory[]
}

class App extends Component<any, AppState>
{
    constructor(props) {
        super(props);
        this.state = {project:{projectId:"1234", material: {id:"", category:"", name:"", url:""}, graphics:[]}, selectedGraphic:{}, materials:[]}
    }

    componentDidMount() {
        axios.get(ServerURL + "/" + this.state.project.projectId).then(response => {
            this.setState({project: response.data})
            axios.get(ServerURL + "/materials").then(response => {
                this.setState({materials:response.data})
            })
        })
    }

    render()
    {
        return (
            <div className="App">
                <this.AppHeader/>

                <CutView project={this.state.project}/>

                <div className="detailBar">
                    <div className={"configuration-view bottom-separator"}>
                        <div className={"configuration-header"}>
                            <h2>Details</h2>
                            <button className={"pretty-button save-and-order-button"}>Save and Order</button>
                        </div>
                        <select className={"pretty-select"} value={this.state.project.material.id}>
                            <option>Choose your material...</option>
                            {
                                this.state.materials.map(category =>
                                    <optgroup key={category.category} label={category.category}>
                                        {
                                            category.materials.map(material =>
                                                <option key={material.id} value={material.id} onClick={(e) =>this.OnMaterialClicked(material, e)}>{material.name}</option>
                                            )
                                        }
                                    </optgroup>)
                            }
                        </select>
                    </div>

                    {
                        this.state.project.graphics.map(graphic => <GraphicDetail key={graphic.guid} graphic={graphic}/>)
                    }

                    <div className={"add-graphic-detail bottom-separator"}>
                        <input type={"file"} onChange={this.OnFileChanged}/>
                        <button className={"pretty-button"} onClick={this.OnFileUpload}>Upload</button>
                    </div>
                </div>
            </div>
        );
    }

    OnMaterialClicked = (material, event) => {
        axios.post(`${ServerURL}/${this.state.project.projectId}/material/${material.id}`).then(response => {
            this.setState({project: response.data})}
        )
    }

    OnFileChanged = (event) => {
        this.setState({selectedGraphic: event.target.files[0]})
    }

    OnFileUpload = (event) => {
        const formData = new FormData();
        // Update the formData object
        formData.append(
            "file",
            this.state.selectedGraphic,
            this.state.selectedGraphic.name
        );

        // Send formData object
        axios.post(`${ServerURL}/${this.state.project.projectId}/graphic`, formData).then(response => {
            this.setState({project: response.data})
        });
    }

    AppHeader = () => {
        return <div className="App-header">
            <div className="logo">
                <a href="https://CraftCloset.com">
                    <img src={logo}></img>
                </a>
            </div>
        </div>
    }
}

export default App;
