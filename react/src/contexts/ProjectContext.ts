import React from "react";
import {Project} from "../common/data";

export const ServerURL = "http://localhost:3001"

export interface ProjectContextInterface {
  project : Project,
  updateProject : (project: Project) => void
}

const ProjectContext = React.createContext<ProjectContextInterface>({
   project: new Project("", {id:"", url:"", category:"", name:""}, []),
   updateProject: (project:Project) => {console.log("default updateProject")}
})

export default ProjectContext


