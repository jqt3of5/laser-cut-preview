import logo from './Assets/Craft_Closet_Logo.webp'

// import hickory from './Assets/Hickory.webp'
// import maple from './Assets/Maple.webp'
// import cherry from './Assets/Cherry.webp'
// import walnut from './Assets/Walnut.webp'

import axios from 'axios';

import './App.css';
import React from "react";

const ServerURL = "http://localhost:3001/"

class GraphicDetail extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={"graphic-detail bottom-separator"}>
                <img className="graphic-preview" src={this.props.graphic.url}></img>
                <div className={"graphic-line-color-list"}>
                    {this.props.graphic.colors.map(color => {
                        return (<div className={"graphic-line-color-item"}>
                            <div className={"graphic-line-color"}></div>
                            <select className={"graphic-line-color-mode pretty-select"} defaultValue={color.mode}>
                                <option>Cut</option>
                                <option>Score</option>
                                <option>Engrave</option>
                            </select>
                        </div>)
                    })}
                </div>
            </div>
        )
    }
}

class App extends React.Component
{
    constructor(props) {
        super(props);
        //graphics: [{guid: {}, colors:[{color:0xff, mode:"Cut"]]
        this.state = {project:{projectId:"1234", material: {}, graphics:[]}, selectedGraphic:{}, materials:[]}
    }

    componentDidMount() {
        axios.post(ServerURL + this.state.project.projectId).then(response => {
            axios.get(ServerURL + "materials").then(response => {
                this.setState({materials:response.data})
            })
        })
    }

    render()
    {
        return (
            <div className="App">
                <this.AppHeader></this.AppHeader>
                <div className="cut-view">
                    <img src={ServerURL + this.state.project.material.url} className="cut-preview" alt="logo" />
                    {/*Draw cuts, scores, and engraves*/}
                </div>
                <div className="detailBar">
                    <this.ConfigurationView></this.ConfigurationView>
                    {
                        this.state.project.graphics.map(graphic => {
                            <GraphicDetail graphic={graphic}></GraphicDetail>
                        })
                    }
                    <this.AddGraphicDetail></this.AddGraphicDetail>
                </div>
            </div>
        );
    }

    ConfigurationView = () => {
        return (
            <div className={"configuration-view bottom-separator"}>
                <div className={"configuration-header"}>
                    <h2>Details</h2>
                    <button className={"pretty-button save-and-order-button"}>Save and Order</button>
                </div>
                <select className={"pretty-select"}>
                    <option>Choose your material...</option>
                    {
                        Object.keys(this.state.materials).map(key =>
                        <optgroup key={key} label={"Wood"}>
                            {
                                this.state.materials[key].map(o =>
                                    <option key={o.name} onClick={(e) =>this.OnMaterialClicked(o, e)}>{o.name}</option>
                                )
                            }
                        </optgroup>)
                    }
                </select>
            </div>
        )
    }

    OnMaterialClicked = (material, event) => {
        axios.post(`${ServerURL}/${this.state.project.projectId}/material/${material.id}`).then(r =>
            this.setState(state => ({project: {material: material}}))
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

        // Request made to the backend api
        // Send formData object
        axios.post(`${ServerURL}/${this.state.project.projectId}/graphic`, formData).then(response => {
            this.setState({project: response.data})
        });
    }

    AddGraphicDetail = () => {
        return (
            <div className={"add-graphic-detail bottom-separator"}>
                <input type={"file"} onChange={this.OnFileChanged}></input>
                <button className={"pretty-button"} onClick={this.OnFileUpload}>Upload</button>
            </div>
        )
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
