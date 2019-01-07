import React from "react";
import ReactDOM from "react-dom";
import IdyllDisplay from "./render/idyll-display/index.jsx";

const { ipcRenderer } = require("electron");

class App extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      markup: ""
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(newMarkup) {
    ipcRenderer.send("save", newMarkup);
  }

  componentDidMount() {
    ipcRenderer.on("idyll:markup", (event, markup) => {
      this.setState({
        markup: markup
      });
    });
  }

  render() {
    return (
      <div>
        <IdyllDisplay markup={this.state.markup} onChange={this.handleChange} />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("app"));
