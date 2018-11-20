import React from "react";
import "./App.css";
import IdyllEditor from "./components/editor/IdyllEditor";
import fileMarkup from "./components/editor/markdown";
import { hashCode } from "./components/editor/utils";

const electron = require("electron");
const ipc = electron.ipcRenderer;

class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      edited: false
    };
  }

  componentDidMount() {
    console.log(window);
  }

  getInitialProps() {
    return { initialMarkup: fileMarkup };
  }

  handleChange = markup => {
    this.currentMarkup = markup;

    if (hashCode(this.currentMarkup) !== hashCode(fileMarkup)) {
      this.setState({ edited: true });
    }
  };

  render() {
    if (!this.currentMarkup) {
      this.currentMarkup = fileMarkup;
    }

    return (
      <div className="App">
        <IdyllEditor markup={fileMarkup} onChange={this.handleChange} />
      </div>
    );
  }
}

export default App;
