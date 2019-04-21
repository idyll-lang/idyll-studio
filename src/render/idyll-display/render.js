import React from 'react';
import IdyllDocument from 'idyll-document';
import UserView from './components/user-view.js';

class Renderer extends React.PureComponent {
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
    const { components, ast } = this.props;
    if (!ast) {
      return 'Please load an Idyll project...';
    }
    if (!components || !components.length) {
      return 'Loading components...';
    }
    const loadedComponent = components.reduce((memo, { name, path }) => {
      try {
        memo[name] = require(path);
      } catch (e) {
        console.log('Error loading component', name);
      }
      return memo;
    }, {});

    const CreateUserView = (func) => {
      return class UserView extends React.PureComponent {
        render() {
          return (
            <div>
              {this.props.component}
              <button onClick={() => func(this.props.idyllASTNode)}>
                Click to see props of the comp. in sidebar!
              </button>
            </div>
          );
        }
      }
    };
    const NewUserView = CreateUserView(this.props.handleComponentChange);
    return (
      <div className='renderer'>
        <div className='renderer-container'>
          <IdyllDocument
            //markup={markup}
            ast={ast}
            components={loadedComponent}
            layout={'centered'}
            context={context => {
              window.IDYLL_CONTEXT = context;
            }}
            datasets={{}}
            userViewComponent={NewUserView}
            authorView={true}
            // handleComponentChange={this.props.handleComponentChange}
          />
        </div>
      </div>
    );
  }
}

export default Renderer;
