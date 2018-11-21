import React from "react";
import ReactDOM from "react-dom";
import IdyllDisplay from './render/idyll-display/index.jsx';

const {ipcRenderer} = require('electron')

class App extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      markup: ''
    }
  }

  componentDidMount() {
    ipcRenderer.on('idyll:markup', (event, markup) => {
        console.log(markup);
        this.setState({
          markup: markup
        })
    })
  }

  render() {

    return (
      <div>
        <IdyllDisplay markup={this.state.markup} />
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
);
