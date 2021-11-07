import React from "react";
import {Project} from "../../Server/data";

export const ServerURL = "http://localhost:3001"
const ProjectContext = React.createContext({
   state: new Project(),
   setState: (values:any) => {}
})
export default ProjectContext


