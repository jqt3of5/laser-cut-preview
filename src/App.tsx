// @ts-ignore
import logo from './Assets/Craft_Closet_Logo.webp'

import axios from 'axios';

import './App.css';
import ProjectContext, {ServerURL} from "./contexts/ProjectContext";
import React, {Component} from "react";
import {CutView} from "./CutView";
import {GraphicDetail} from "./GraphicDetail";
import {Graphic, Material, MaterialCategory, Project} from "./common/data";
import { ProjectProvider } from './contexts/ProjectProvider';

interface AppState {
    selectedGraphic: any,
    materials: MaterialCategory[]
    project: Project,
    updateProject : (project:Project) => void
}

interface AppProps {

}

class App extends Component<AppProps, AppState>
{
    constructor(props: AppProps | Readonly<AppProps>) {
        super(props);
        this.state = {selectedGraphic:{}, materials:[],
            project: {projectId: "12345", material: {id: "", category: "", name: "", url: ""}, graphics: []},
            updateProject: (project: Project) => {
                this.setState({project: project}, () => {
                    axios.post(ServerURL + "/" + this.state.project.projectId, project)
                        .then(response => {
                            this.setState({project: response.data})
                        })
                })
            }}
    }

    componentDidMount() {
        axios.get(ServerURL + "/" + this.state.project.projectId).then(response => {
            this.setState({project:response.data})
        })

        axios.get(ServerURL + "/materials").then(response => {
            this.setState({materials:response.data})
        })
    }

    render()
    {
        return (
            <div className="App">
                <div className="App-header">
                    <div className="logo">
                        <a href="https://CraftCloset.com">
                            <img src={logo}></img>
                        </a>
                    </div>
                </div>

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
                                                <option key={material.id} value={material.id} onClick={(e) => this.OnMaterialClicked(material)}>{material.name}</option>
                                            )
                                        }
                                    </optgroup>)
                            }
                        </select>
                    </div>

                    {
                        this.state.project.graphics.map((graphic : Graphic) => <GraphicDetail key={graphic.guid} graphic={graphic} project={this.state.project} updateProject={this.state.updateProject}/>)
                    }

                    <div className={"add-graphic-detail bottom-separator"}>
                        <input type={"file"} onChange={this.OnFileChanged}/>
                        <button className={"pretty-button"} onClick={this.OnFileUpload}>Upload</button>
                    </div>
                </div>
            </div>
        );
    }

    OnMaterialClicked = (material : Material) => {
        var proj = {...this.state.project, material: material}
        this.state.updateProject(proj)
    }

    OnFileChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files == null)
            return

        this.setState({selectedGraphic: event.target.files[0]})
    }

    OnFileUpload = (event: React.MouseEvent<HTMLButtonElement>) => {
        const formData = new FormData();
        // Update the formData object
        formData.append(
            "file",
            this.state.selectedGraphic,
            this.state.selectedGraphic.name
        );

        axios.post(`${ServerURL}/graphic`, formData)
            .then(response => this.state.updateProject({...this.state.project, graphics:this.state.project.graphics.concat(response.data)}))
    }
}

export default App;
