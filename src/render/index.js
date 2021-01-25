import React from 'react';
import ReactDOM from 'react-dom';
import IdyllDisplay from './idyll-display';
import Context from './context/context';
import copy from 'fast-copy';

const { ipcRenderer } = require('electron');
const idyllAST = require('idyll-ast');
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

const PUBLISHING_ERROR = 'Error occurred while publishing: ';
const PUBLISHING = 'Publishing your project...';
const PUBLISHED = 'Published!';

class App extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      pathKey: '',
      components: [],
      componentPropMap: new Map(),
      ast: undefined,
      datasets: undefined,
      currentSidebarNode: null,
      url: '',
      currentProcess: null,
      activeComponent: null
    };

    this.createComponentMap = this.createComponentMap.bind(this);
    this.handleRedo = this.handleRedo.bind(this);
    this.handleUndo = this.handleUndo.bind(this);
    this.undoStack = [];
    this.redoStack = [];
    this._undoStash = null;
  }

  componentDidMount() {
    // Load in datasets
    ipcRenderer.on(
      'idyll:compile',
      (event, { datasets, ast, components, path, url }) => {
        var componentProps = this.createComponentMap(components);

        this._undoStash = copy(ast);

        this.setState({
          datasets: datasets,
          ast: ast,
          pathKey: path,
          components: components,
          componentPropMap: componentProps,
          layout: 'centered',
          theme: 'default',
          currentProcess: '',
          url: url // replace once sqlite db implemented
        });
      }
    );

    window.addEventListener(
      'keydown',
      event => {
        if (
          event.shiftKey &&
          (event.ctrlKey || event.metaKey) &&
          event.key === 'z'
        ) {
          this.handleRedo();
        } else if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
          this.handleUndo();
        }
      },
      true
    );

    ipcRenderer.on('publishing', (event, message) => {
      this.setState({
        currentProcess: PUBLISHING
      });
    });

    ipcRenderer.on('pub-error', (event, message) => {
      this.setState({
        currentProcess: PUBLISHING_ERROR + message
      });
    });

    ipcRenderer.on('published-url', (event, url) => {
      this.setState({
        url: url,
        currentProcess: PUBLISHED
      });
    });

    // When main wants to save, print "Saved!" to console
    // and sends the saved markup
    ipcRenderer.on('idyll:save', (event, message) => {
      ipcRenderer.send('save', idyllAST.toMarkup(this.state.ast));
    });
  }

  handleRedo() {
    if (!this.redoStack.length) {
      return;
    }
    const popped = copy(this.redoStack.pop());
    this.undoStack.push(copy(this.state.ast));
    this._undoStash = popped;
    this.setState({ ast: popped });
  }

  handleUndo() {
    if (!this.undoStack.length) {
      return;
    }
    const popped = copy(this.undoStack.pop());
    this.redoStack.push(copy(this.state.ast));
    this._undoStash = popped;
    this.setState({ ast: popped });
  }

  getContext() {
    const {
      ast,
      datasets,
      context,
      theme,
      layout,
      componentPropMap,
      currentSidebarNode,
      components,
      url,
      currentProcess,
      activeComponent
    } = this.state;
    return {
      context: context,
      components: components,
      theme: theme,
      layout: layout,
      ast: ast,
      propsMap: componentPropMap,
      datasets: datasets,
      currentSidebarNode: currentSidebarNode,
      url: url,
      currentProcess: currentProcess,
      activeComponent: activeComponent,
      setSidebarNode: node => {
        this.setState({ currentSidebarNode: node });
      },
      setTheme: theme => {
        this.setState({ theme: theme });
      },
      setLayout: layout => {
        this.setState({ layout: layout });
      },
      setAst: ast => {
        this.redoStack = [];
        this.undoStack.push(this._undoStash);
        this._undoStash = copy(ast);
        this.setState({ ast: { ...ast } });
      },
      setContext: context => {
        this.setState({ context: context });
      },
      deploy: () => {
        ipcRenderer.send('deploy', '');
      },
      setActiveComponent: activeComponent => {
        this.setState({ activeComponent: { ...activeComponent } });
      },
      canUndo: () => {
        return !!this.undoStack.length;
      },
      canRedo: () => {
        return !!this.redoStack.length;
      },
      undo: () => {
        this.handleUndo();
      },
      redo: () => {
        this.handleRedo();
      }
    };
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
      } else if (path._idyll) {
        componentProps.set(component.name, path._idyll);
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

  handleLoad() {
    this.undoStack = [];
    ipcRenderer.send('client:openProject');
  }

  render() {
    if (!this.state.ast) {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100vw',
            height: '100vh',
            background: '#efefef'
          }}>
          <div
            style={{
              fontFamily: 'Helvetica',
              borderRadius: 0
            }}>
            <button className='loader' onClick={this.handleLoad.bind(this)}>
              Load a project
            </button>
          </div>
        </div>
      );
    }

    return (
      <Context.Provider value={this.getContext()}>
        <DndProvider backend={HTML5Backend}>
          <IdyllDisplay key={this.state.pathKey} />
        </DndProvider>
      </Context.Provider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
