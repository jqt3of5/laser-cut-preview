import React from 'react';
import './App.css';
import SideBarMenu from "./SideBarMenu";

function App() {
  return (
    <div className="App">
        <header className="App-header">
        </header>
        <div className={"App-content"}>
            <div className={"App-side-bar"}>
                <div className={"side-bar-header"}>
                </div>
                <SideBarMenu selected={""} items={["Item1", "Item2", "Item3"]} onSelect={(item, index) => console.log(item)}/>
            </div>
            <div className={"main-view"}>

            </div>
        </div>
    </div>
  );
}

export default App;
