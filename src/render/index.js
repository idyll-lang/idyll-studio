import React from 'react';
import ReactDOM from 'react-dom';
import IdyllDisplay from './idyll-display';
const { ipcRenderer } = require('electron');
const idyllAST = require('idyll-ast');

class App extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      markup: '',
      pathKey: '',
      components: [],
      componentPropMap: new Map(),
      ast: undefined,
      id: 0,
      maxNodeId: -1,
      datasets: undefined
    };

    this.setAST = this.setAST.bind(this);
    this.createComponentMap = this.createComponentMap.bind(this);
    this.updateMaxId = this.updateMaxId.bind(this);
  }

  // Assigns the app's ast to be the given one
  setAST(newAST) {
    this.setState({
      ast: { ...newAST },
      id: this.state.id + 1
    });
  }

  // Update the max id to given maxId after
  // insertion of component
  updateMaxId(id) {
    this.setState({
      maxNodeId: id
    });

    // TEST PURPOSES: Check for repeat ids
    var idSet = new Set();
    idyllAST.walkNodes(this.state.ast, node => {
      if (idSet.has(node.id)) {
        console.log('Repeat Id Found');
      } else {
        idSet.add(node.id);
      }
    });
    console.log(idSet);
  }

  componentDidMount() {
    // Load in datasets
    ipcRenderer.on('idyll:datasets', (event, datasets) => {
      this.setState({
        datasets: datasets
      });
    });

    // Load in ast
    ipcRenderer.on('idyll:ast', (event, ast) => {
      this.setState({
        ast: ast
      });

      // Set max id on open
      this.setState({ maxNodeId: -1 });
      idyllAST.walkNodes(this.state.ast, node => {
        this.setState({ maxNodeId: Math.max(this.state.maxNodeId, node.id) });
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
      var componentProps = this.createComponentMap(components);

      this.setState({
        components: components,
        componentPropMap: componentProps
      });
    });

    // // When main wants to save, print "Saved!" to console
    // // and sends the saved markup
    // ipcRenderer.on('idyll:save', (event, message) => {
    //   console.log(message);
    //   ipcRenderer.send('save', this.state.savedMarkup);
    // });
  }

  // Given list of components objects containing name and path,
  // return a {component name: props} map
  createComponentMap(components) {
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

    return componentProps;
  }

  render() {
    console.log(this.state.ast);
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
          maxNodeId={this.state.maxNodeId}
          updateMaxId={this.updateMaxId}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
