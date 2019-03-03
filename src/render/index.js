import React from 'react';
import ReactDOM from 'react-dom';
import IdyllDisplay from './idyll-display';
const compile = require('idyll-compiler');
const idyllAST = require('idyll-ast');
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
      id: 0
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
    compile(componentMarkup).then(componentAST => {
      // grab last id by walking rightmost children of tree
      var currNode = this.state.ast;
      while (
        currNode.children !== undefined &&
        currNode.children.length !== 0
      ) {
        currNode = currNode.children[currNode.children.length - 1];
      }

      // Reach into componentAST and append child
      // Look into children and get last textcontainer
      // Modify directly and then create shallow copy

      // Assign ids to componentAST
      // TODO: Fix backwards id assignment
      // ASK: skipping some nums for ids okay?

      // children nodes + curr node
      var numCompNodes = componentAST.children[0].children.length + 1;
      var currID = currNode.id + numCompNodes + 1;
      idyllAST.walkNodes(componentAST, node => {
        node.id = currID;
        currID -= 1;
      });

      var newAST = idyllAST.appendNode(this.state.ast, componentAST);
      this.setState({ ast: newAST, id: this.state.id + 1 });
      console.log(this.state.ast);
    });
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
    return (
      <div>
        <IdyllDisplay
          key={this.state.pathKey + this.state.id}
          markup={this.state.markup}
          onChange={this.handleChange}
          insertComponent={this.insertComponent}
          components={this.state.components}
          propsMap={this.state.componentPropMap}
          ast={this.state.ast}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
