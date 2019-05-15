import React from 'react';
import Select from 'react-select';
const compile = require('idyll-compiler');
const idyllAST = require('idyll-ast');
import Context from '../../context';

class Deploy extends React.PureComponent {
  static contextType = Context;
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // Grab meta node
    this.metaNode = idyllAST.getNodesByType(this.context.ast, 'meta')[0];
  }

  handleUpdateValue(propName, e) {
    this.metaNode.properties[propName].value = e.target.value;
    this.context.setAst(this.context.ast);

    // Debug
    // console.log(this.context.ast.children[4].children[0].properties.title);
  }

  renderProps(propName) {
    return (
      <div>
        <input
          onChange={e => {
            this.handleUpdateValue(propName, e);
          }}
          type='text'
          defaultValue={
            this.metaNode ? this.metaNode.properties[propName].value : null
          }
        />
      </div>
    );
  }

  render() {
    return (
      <div className='deploy-view'>
        <div className='label'>Metadata</div>
        <div
          className='meta-container'
          style={{
            display: 'flex',
            flexDirection: 'row'
          }}
        >
          Title
          {this.renderProps('title')}
        </div>
        <button onClick={this.context.deploy}>Publish</button>
      </div>
    );
  }
}

export default Deploy;
