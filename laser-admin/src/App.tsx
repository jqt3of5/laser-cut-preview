import React, {useState} from 'react';
import './App.css';
import SideBarMenu from "./Components/SideBarMenu";
import ProjectDetailView from "./Views/ProjectDetailView";
import ProjectList from "./Views/ProjectList";
import MaterialsList from "./Views/MaterialsList";

function App() {
    const [selected, setSelected] = useState("Projects")

    let currentView = null
    switch(selected)
    {
        case "Projects":
            currentView = <ProjectList></ProjectList>
            break;
        case "Materials":
            currentView = <MaterialsList></MaterialsList>
            break;
        case "Users":
            break;
        case "Settings":
            break;
        case "Analytics":
            break;
    }
  return (
    <div className="App">
        <header className="App-header">
        </header>
        <div className={"App-content"}>
            <div className={"App-side-bar"}>
                <div className={"side-bar-header"}>
                </div>
                <SideBarMenu selected={selected} items={["Projects", "Materials", "Users", "Settings", "Analytics"]} onSelect={(item, index) => setSelected(item)}/>
            </div>
            <div className={"main-view"}>
                {currentView}
            </div>
        </div>
    </div>
  );
}

export default App;
