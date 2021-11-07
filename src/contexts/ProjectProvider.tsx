import React, {Component} from "react";
import ProjectContext, {ServerURL} from "./ProjectContext";
import axios from "axios";
import {Project} from "../../Server/data";


export class ProjectProvider extends Component<any, Project> {
   constructor(props : any) {
       super(props);
       this.updateState = this.updateState.bind(this)
       this.state = {projectId:"1234", material: {id:"", category:"", name:"", url:""}, graphics:[]}
   }

   componentDidMount() {
       axios.get(ServerURL + "/" + this.state.projectId).then(response => {
           this.setState(response.data)
       })
   }

   updateState(values : any) {
       this.setState(values)
   }

   render() {
       return (
           <ProjectContext.Provider value={{
               state: this.state,
               setState: this.updateState
           }}>
               {this.props.children}
           </ProjectContext.Provider>
       )
   }
}