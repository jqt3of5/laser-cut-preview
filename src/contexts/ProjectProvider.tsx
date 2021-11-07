import {Component} from "react";
import React = require("react");
import ProjectContext from "./ProjectContext";

class ProjectProvider extends Component {
   constructor(props) {
       super(props);
       this.updateState = this.updateState.bind(this)
       this.state = {
       }
   }

   updateState(values) {
       this.setState(values)
   }

   render() {
       return (
           <ProjectContext.Provider value={{
               state: this.state,
               update: this.updateState
           }}>
               {this.props.children}
           </ProjectContext.Provider>
       )
   }
}