// @ts-ignore
import logo from './Assets/Craft_Closet_Logo.webp'

import axios from 'axios';

import './App.css';
import {ServerURL} from "./contexts/ProjectContext";
import React, {Component} from "react";
import {CutView} from "./CutView";
import {GraphicDetail} from "./GraphicDetail";
import {Graphic, Material, MaterialCategory, Project} from "../Server/data";
import { ProjectProvider } from './contexts/ProjectProvider';

interface AppState {
    selectedGraphic: any,
    materials: MaterialCategory[]
}
interface AppProps {

}

class App extends Component<AppProps, AppState>
{
    constructor(props: AppProps | Readonly<AppProps>) {
        super(props);
        this.state = {selectedGraphic:{}, materials:[]}
    }

    componentDidMount() {
        axios.get(ServerURL + "/materials").then(response => {
            this.setState({materials:response.data})
        })
    }

    render()
    {
        return (
            <ProjectProvider>
                <div className="App">
                    <this.AppHeader/>

                    <CutView/>

                    <div className="detailBar">
                        <div className={"configuration-view bottom-separator"}>
                            <div className={"configuration-header"}>
                                <h2>Details</h2>
                                <button className={"pretty-button save-and-order-button"}>Save and Order</button>
                            </div>
                            <select className={"pretty-select"} value={this.context.material.id}>
                                <option>Choose your material...</option>
                                {
                                    this.state.materials.map(category =>
                                        <optgroup key={category.category} label={category.category}>
                                            {
                                                category.materials.map(material =>
                                                    <option key={material.id} value={material.id} onClick={(e) =>this.OnMaterialClicked(material)}>{material.name}</option>
                                                )
                                            }
                                        </optgroup>)
                                }
                            </select>
                        </div>

                        {
                            this.context.graphics.map((graphic : Graphic) => <GraphicDetail key={graphic.guid} graphic={graphic}/>)
                        }

                        <div className={"add-graphic-detail bottom-separator"}>
                            <input type={"file"} onChange={this.OnFileChanged}/>
                            <button className={"pretty-button"} onClick={this.OnFileUpload}>Upload</button>
                        </div>
                    </div>
                </div>
            </ProjectProvider>

        );
    }

    OnMaterialClicked = (material : Material) => {
        axios.post(`${ServerURL}/${this.context.projectId}/material/${material.id}`)
            .then(response => this.context.setState(response.data))
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

        // Send formData object
        axios.post(`${ServerURL}/${this.context.projectId}/graphic`, formData)
            .then(response => this.context.setState(response.data));
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
