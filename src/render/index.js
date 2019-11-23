import React from 'react';
import ReactDOM from 'react-dom';
import IdyllDisplay from './idyll-display';
import Context from './context';

const { ipcRenderer } = require('electron');
const idyllAST = require('idyll-ast');

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
      currProcess: null
    };

    this.createComponentMap = this.createComponentMap.bind(this);
  }

  componentDidMount() {
    // Load in datasets
    ipcRenderer.on(
      'idyll:compile',
      (event, { datasets, ast, components, path, url }) => {
        console.log(components);
        var componentProps = this.createComponentMap(components);

        this.setState({
          datasets: datasets,
          ast: ast,
          pathKey: path,
          components: components,
          componentPropMap: componentProps,
          layout: 'centered',
          theme: 'default',
          currProcess: '',
          url: url // replace once sqlite db implemented
        });
      }
    );

    ipcRenderer.on('publishing', (event, message) => {
      this.setState({
        currProcess: PUBLISHING
      });
    });

    ipcRenderer.on('pub-error', (event, message) => {
      this.setState({
        currProcess: PUBLISHING_ERROR + message
      });
    });

    ipcRenderer.on('published-url', (event, request) => {
      this.setState({
        url: request.url,
        currProcess: PUBLISHED
      });
    });

    // When main wants to save, print "Saved!" to console
    // and sends the saved markup
    ipcRenderer.on('idyll:save', (event, message) => {
      console.log(message);
      ipcRenderer.send('save', idyllAST.toMarkup(this.state.ast));
    });
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
      currProcess
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
      currProcess: currProcess,
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
        console.log('set ast');
        this.setState({ ast: { ...ast } });
      },
      setContext: context => {
        this.setState({ context: context });
      },
      deploy: () => {
        ipcRenderer.send('deploy', 'hi');
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
    console.log('handleLoad');
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
            height: '100vh'
          }}
        >
          <div
            style={{
              background: '#efefef',
              fontFamily: 'Helvetica',
              borderRadius: 0,
              padding: '4em'
            }}
          >
            Load an Idyll project
            <button className='loader' onClick={this.handleLoad.bind(this)}>
              Select...
            </button>
          </div>
        </div>
      );
    }
    return (
      <Context.Provider value={this.getContext()}>
        <IdyllDisplay key={this.state.pathKey} />
      </Context.Provider>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
