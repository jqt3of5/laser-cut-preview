import woodgrain from './Assets/woodgrain.jpg';
import logo from './Assets/Craft_Closet_Logo.webp'
import hickory from './Assets/RusticHickoryforwebsiteRECTANGLE_1800x1800.webp'
import './App.css';

function ConfigurationView() {
   return (
      <div className={"configuration-view bottom-separator"}>
          <div className={"configuration-header"}>
              <h2>Details</h2>
              <button className={"pretty-button save-and-order-button"}>Save and Order</button>
          </div>
          <select className={"pretty-select"}>
              <option>Choose your material...</option>
              <optgroup label={"1/8\" Wood"}>
                  <option>Birch (1/8")</option>
                  <option>Red Oak</option>
                  <option>Walnut</option>
                  <option>Maple</option>
              </optgroup>
              <optgroup label={"Acrylic"}>
                  <option>Red</option>
                  <option>Blue</option>
              </optgroup>
          </select>
      </div>
   )
}

function GraphicDetail() {
  return (
      <div className={"graphic-detail bottom-separator"}>
          <img className="graphic-preview"></img>
          <div className={"graphic-line-color-list"}>
              <div className={"graphic-line-color-item"}>
                  <div className={"graphic-line-color"}></div>
                  <select className={"graphic-line-color-mode pretty-select"}>
                      <option>Cut</option>
                      <option>Score</option>
                      <option>Engrave</option>
                  </select>
              </div>
          </div>
      </div>
  )}

function AddGraphicDetail() {
    return (
        <div className={"add-graphic-detail bottom-separator"}>
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
            <img src={hickory} className="cut-preview" alt="logo" />
            {/*<canvas className={"cut-preview-canvas"}>*/}
            {/**/}
            {/*</canvas>*/}
            {/*Draw wood*/}
            {/*Draw cuts, scores, and engraves*/}
        </div>

        <div className="detailBar">
            <ConfigurationView></ConfigurationView>
            <GraphicDetail></GraphicDetail>
            <AddGraphicDetail></AddGraphicDetail>
        </div>
        <div className="footerBar"></div>
    </div>
  );
}

export default App;
