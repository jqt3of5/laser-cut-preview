import React, {useState} from 'react';
import './App.css';
import SideBarMenu from "./Components/SideBarMenu";
import ProjectDetailView from "./Views/ProjectDetailView";
import ProjectList from "./Views/ProjectList";
import MaterialsList from "./Views/MaterialsList";

function App() {
    const data = React.useMemo(() => [
        {
            name: "John Todd",
            email: "jqt3of5@gmail.com",
            address: "3423 woodhouse",
            phoneNumber: "234-234-23423",
            cost: 123.34,
            orderid: "1234567",
            status: 0,
            projectGuid: "1234qwerty",
            projectUrl: "http://asdfasdf/1234qwerty"
        }
        ],[])
    const [selected, setSelected] = useState("Projects")

    let currentView = null
    switch(selected)
    {
        case "Projects":
            currentView = <ProjectList orders={data}></ProjectList>
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
            <div>CraftCloset Admin</div>
        </header>
        <div className={"App-content"}>
            <div className={"App-side-bar"}>
                <div className={"side-bar-header"}>
                </div>
                <SideBarMenu selected={selected} items={["Projects", "Materials", "Users", "Analytics"]} onSelect={(item, index) => setSelected(item)}/>
            </div>
            <div className={"App-main-view"}>
                {currentView}
            </div>
        </div>
    </div>
  );
}

export default App;
