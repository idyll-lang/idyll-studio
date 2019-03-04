import React from 'react';
import ReactDOM from 'react-dom';
import IdyllDisplay from './idyll-display';
const { ipcRenderer } = require('electron');

class App extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      markup: '',
      pathKey: '',
      savedMarkup: '',
      components: [],
      componentPropMap: new Map(),
      ast: undefined,
      id: 0,
      datasets: undefined
    };

    // this.handleChange = this.handleChange.bind(this);
    this.setAST = this.setAST.bind(this);
  }

  // // Accepts the updated markup from the editor
  // // for saving
  // handleChange(newMarkup) {
  //   this.setState({
  //     savedMarkup: newMarkup
  //   });
  // }

  // Assigns the app's ast to be the given one
  setAST(newAST) {
    this.setState({
      ast: { ...newAST },
      id: this.state.id + 1
    });
  }

  componentDidMount() {
    // // On a new file open, sets markup up to send to editor
    // ipcRenderer.on('idyll:markup', (event, markup) => {
    //   this.setState({
    //     markup: markup,
    //     savedMarkup: markup
    //   });
    // });

    ipcRenderer.on('idyll:datasets', (event, datasets) => {
      this.setState({
        datasets: datasets
      });
    });

    ipcRenderer.on('idyll:ast', (event, ast) => {
      this.setState({
        ast: ast
      });
    });

    // Grabs file path to set as a key for renderer
    ipcRenderer.on('idyll:path', (event, path) => {
      this.setState({
        pathKey: path
      });
    });

    // Grabs component information and components
    ipcRenderer.on('idyll:components', (event, components) => {
      var componentProps = new Map();

      components.forEach(component => {
        var path;
        try {
          path = require(component.path);
        } catch (error) {
          console.log(error);
          return; // skip next iteration
        }
        // Stores {component name: props }
        if (typeof path === 'object' && path.default !== undefined) {
          var props = path.default._idyll;
          componentProps.set(component.name, props);
        } else if (typeof path === 'function') {
          componentProps.set(component.name, {
            name: component.name,
            tagType: 'closed',
            props: []
          });
        }
      });

      this.setState({
        components: components,
        componentPropMap: componentProps
      });
    });

    // When main wants to save, print "Saved!" to console
    // and sends the saved markup
    ipcRenderer.on('idyll:save', (event, message) => {
      console.log(message);
      ipcRenderer.send('save', this.state.savedMarkup);
    });
  }

  render() {
    return (
      <div>
        <IdyllDisplay
          key={this.state.pathKey + this.state.id}
          markup={this.state.markup}
          setAST={this.setAST}
          components={this.state.components}
          propsMap={this.state.componentPropMap}
          ast={this.state.ast}
          datasets={this.state.datasets}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
