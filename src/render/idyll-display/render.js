import React from 'react';
import IdyllDocument from 'idyll-document';
import AuthorView from './components/author-view.js';
import Context from '../context';

class Renderer extends React.PureComponent {
  static contextType = Context;
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidCatch(e) {
    this.setState({
      error: e
    });
  }

  render() {

    if (this.state.error) {
      return <div>
        Error
        <pre>
          {this.state.error}
        </pre>
      </div>
    }
    const { ast, components } = this.context;
    if (!this.loadedComponents) {
      this.loadedComponents = {};
    }
    components.forEach(({name, path}) => {
      if (!this.loadedComponents[name]) {
        try {
          this.loadedComponents[name] = require(path);
        } catch (e) {
          console.log('Error loading component', name);
        }
      }
    });

    return (
      <div className='renderer'>
        <div className='renderer-container'>
          <IdyllDocument
            //markup={markup}
            key={JSON.stringify(ast)}
            ast={ast}
            components={this.loadedComponents}
            layout={this.context.layout}
            theme={this.context.theme}
            context={context => {
              this.context.setContext(context);
            }}
            datasets={{}}
            injectThemeCSS={true}
            injectLayoutCSS={true}
            userViewComponent={AuthorView}
            authorView={true}
          />
        </div>
      </div>
    );
  }
}

export default Renderer;
