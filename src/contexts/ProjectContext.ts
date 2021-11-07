import React = require("react");
export const ServerURL = "http://localhost:3001"
const ProjectContext = React.createContext({
   state: {
   },
   update: (values:any) => {}
})
export default ProjectContext


