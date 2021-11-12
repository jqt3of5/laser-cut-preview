import React, {Component} from "react";
import ProjectContext, {ProjectContextInterface, ServerURL} from "./ProjectContext";
import axios from "axios";
import {Project} from "../common/data";

export class ProjectProvider extends Component<any, ProjectContextInterface> {
    static contextType = ProjectContext

   constructor(props : any) {
       super(props);

       this.state = {
           project: {projectId: "1234", material: {id: "", category: "", name: "", url: ""}, graphics: []},
           updateProject: (project: Project) => {
               console.log("updating state")
               this.setState({project: project}, () => {
                   axios.post(ServerURL + "/" + this.state.project.projectId, project)
                       .then(response => {
                           this.setState({project: response.data})
                       })
               })
           }
       }
   }

   componentDidMount() {
       axios.get(ServerURL + "/" + this.state.project.projectId).then(response => {
           this.setState({project:response.data})
       })
   }

   render() {
       return (
           <ProjectContext.Provider value={this.state}>
               {this.props.children}
           </ProjectContext.Provider>
       )
   }
}