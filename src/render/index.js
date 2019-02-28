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
      ast: undefined
    };

    this.handleChange = this.handleChange.bind(this);
    this.insertComponent = this.insertComponent.bind(this);
    this.setAST = this.setAST.bind(this);
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

  // Assigns the app's ast to be the given one
  setAST(newAST) {
    this.setState({
      ast: {...newAST}
    });
    console.log('went up and newast is');
    console.log(newAST);
    console.log(this.state.ast);
  }

  componentDidMount() {
    // On a new file open, sets markup up to send to editor
    ipcRenderer.on('idyll:markup', (event, markup) => {
      this.setState({
        markup: markup,
        savedMarkup: markup
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
    console.log('re-rendered display');
    return (
      <div>
        <IdyllDisplay
          key={this.state.pathKey}
          markup={this.state.markup}
          onChange={this.handleChange}
          insertComponent={this.insertComponent}
          setAST={this.setAST}
          components={this.state.components}
          propsMap={this.state.componentPropMap}
          ast={this.state.ast}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
