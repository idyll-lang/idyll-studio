import React from 'react';
import ReactDOM from 'react-dom';
import IdyllDisplay from './idyll-display';
import Context from './context/context';
import copy from 'fast-copy';
import { readFile, jsonParser } from './idyll-display/utils';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { basename } from 'path';

const { ipcRenderer } = require('electron');
const idyllAST = require('idyll-ast');
const p = require('path');


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
      activeComponent: null,
      onUpdateCallbacks: [],
      requestCreateProject: false,
      isCreatingProject: false,
      createProjectName: ''
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

        if (!ast) {
          this.setState({
            ast
          });
          return;
        }

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
          url: url,
          requestCreateProject: false,
          isCreatingProject: false
        });

        // load up datasets in context
        this.handleDatasetLoading(ast, path);
      }
    );

    // handle dataset import

    ipcRenderer.on(
      'data:import',
      () => {
        this._dataImportCb && this._dataImportCb();
      })

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

    // Overwrite default copy/paste behavior so it
    // doesn't include any weird HTML/styles/linebreaks,
    // text only!
    window.addEventListener('paste', function(e) {
      // cancel paste
      e.preventDefault();

      // get text representation of clipboard
      var text = (e.originalEvent || e).clipboardData
        .getData('text/plain')
        .trim();

      // insert text manually
      document.execCommand('insertHTML', false, text);
    });

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

      const relativeDataPaths = (ast) => {
        const dataNodes = idyllAST.getNodesByType(ast, 'data');
        dataNodes.forEach((node) => {
          node.properties.source.value = basename(node.properties.source.value);
        })
        return ast;
      };
      ipcRenderer.send('save', idyllAST.toMarkup(relativeDataPaths(this.state.ast), { insertFullWidth: true }));
    });
  }

  handleDatasetLoading(ast, projectPath) {
    const dataNodes = ast.children.filter(child => child.type === 'data');
    const workingDir = p.dirname(projectPath);

    if (dataNodes && dataNodes.length > 0) {
      const datasets = {};
      dataNodes.forEach(node => {
        const { name, source } = node.properties;

        let datasetFilePath = source.value;
        if(!p.isAbsolute(datasetFilePath)) {
          datasetFilePath = `${workingDir}/data/${datasetFilePath}`;
        }

        const { content, error } = readFile(datasetFilePath);
        if(content) {
          datasets[name.value] = jsonParser(content);
        }
      });

      this.getContext().context.update(datasets);
    }
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
      activeComponent,
      onUpdateCallbacks,
      showPreview
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
      showPreview: showPreview,
      toggleShowPreview: () => {
        console.log('toggling showPreview', this);
        this.setState({
          showPreview: !this.state.showPreview
        })
      },
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
        context.onUpdate((newData) => {
          onUpdateCallbacks.forEach((cb) => {
            cb(newData);
          });
        })
      },
      onUpdate: (cb) => {
        onUpdateCallbacks.push(cb);
      },
      deploy: () => {
        ipcRenderer.send('deploy', '');
      },
      importDataset: (path, cb) => {
        ipcRenderer.send('importDataset', path);
        this._dataImportCb = cb;
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

  handleCreate() {
    this.undoStack = [];
    // const name = prompt('Project name', 'my-idyll-project');
    ipcRenderer.send('client:createProject', this.state.createProjectName);
    this.setState({
      isCreatingProject: true,
    })
  }

  handleCreateCancel() {
    this.undoStack = [];

    this.setState({
      isCreatingProject: false,
      requestCreateProject: false
    })
  }

  requestCreateProject() {
    this.setState({
      requestCreateProject: true
    })
  }

  handleChangeCreateProjectName(e) {
    this.setState({
      createProjectName: e.target.value
    });
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
              { this.state.requestCreateProject ? (
                <div>
                  { this.state.isCreatingProject ? (<div>
                    Creating project. This may take a minute or two.
                  </div>) : (
                    <div>
                      <div style={{fontWeight: 'bold'}}>Enter project name, and then choose a folder to put it:</div>
                      <input style={{padding: '1em', display: 'block', width: '100%', marginTop: '1em', boxSizing: 'border-box'}} value={this.state.createProjectName} onChange={this.handleChangeCreateProjectName.bind(this)} placeholder={'My project'} />
                      <button style={{display: 'block', width: '100%', padding: '1em', margin: '1em auto', height: 'auto', lineHeight: 'unset'}} onClick={this.handleCreate.bind(this)}>
                        Select folder
                      </button>

                      <button style={{display: 'block', width: '100%', padding: '1em', margin: '1em auto', height: 'auto', lineHeight: 'unset'}} onClick={this.handleCreateCancel.bind(this)}>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <button className='creator' onClick={this.requestCreateProject.bind(this)}>
                    Create a project
                  </button>
                  <button className='loader' onClick={this.handleLoad.bind(this)}>
                    Load a project
                  </button>
                </div>
              )
              }

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
