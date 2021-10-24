import woodgrain from './woodgrain.jpg';
import logo from './Craft_Closet_Logo.webp'
import './App.css';

function GraphicDetail() {
  return (
      <div className={"graphic-detail"}>
          <img className="graphic-preview"></img>
          <div className={"graphic-line-color-list"}>
              <div className={"graphic-line-color-item"}>
                  <div className={"graphic-line-color"}></div>
                  <select className={"graphic-line-color-mode"}>
                      <option>Cut</option>
                      <option>Score</option>
                      <option>Engrave</option>
                  </select>
              </div>
          </div>
      </div>
  )
}
function AddGraphicDetail() {
    return (
        <div className={"add-graphic-detail"}>
            <input type={"file"}></input>
        </div>
    )
}

function App() {
  return (
    <div className="App">
        <div className="App-header">
            <div className="logo">
                <a href="https://CraftCloset.com">
                    <img src={logo}></img>
                </a>
            </div>
        </div>

        <div className="cut-view">
            <img src={woodgrain} className="cut-preview" alt="logo" />
            {/*Draw wood*/}
            {/*Draw cuts, scores, and engraves*/}
        </div>

        <div className="detailBar">
            <GraphicDetail></GraphicDetail>
            <AddGraphicDetail></AddGraphicDetail>
        </div>
        <div className="footerBar"></div>
    </div>
  );
}

export default App;
