import React from "react";
import ReactDOM from "react-dom";
import IdyllDisplay from "./idyll-display";
const { ipcRenderer } = require("electron");

class App extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      markup: "",
      pathKey: "",
      savedMarkup: "",
      components: []
    };

    this.handleChange = this.handleChange.bind(this);
    this.insertComponent = this.insertComponent.bind(this);
  }

  // Accepts the updated markup from the editor
  // for saving
  handleChange(newMarkup) {
    this.setState({
      savedMarkup: newMarkup
    });
  }

  // Updates markup to incorporate inserted component markup
  // to send back down to editor
  insertComponent(componentMarkup) {
    this.setState({ markup: componentMarkup });
  }

  componentDidMount() {
    ipcRenderer.on("idyll:markup", (event, markup) => {
      this.setState({
        markup: markup,
        savedMarkup: markup
      });
    });

    ipcRenderer.on("idyll:path", (event, path) => {
      this.setState({
        pathKey: path
      });
    });

    ipcRenderer.on("idyll:components", (event, components) => {
      this.setState({
        components: components
      });
    });

    ipcRenderer.on("idyll:save", (event, message) => {
      console.log(message);
      ipcRenderer.send("save", this.state.savedMarkup);
    });
  }

  render() {
    return (
      <div>
        <IdyllDisplay
          key={this.state.pathKey}
          markup={this.state.markup}
          onChange={this.handleChange}
          insertComponent={this.insertComponent}
          components={this.state.components}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("app"));
