import React from 'react';
const idyllAST = require('idyll-ast');
import Context from '../../context';

// TODO: Handle case where meta property doesn't exist
// TODO: Check if meta tag exists
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
    console.log(this.context.ast.children[4].children[0].properties[propName]);
  }

  renderProps(propName) {
    return (
      <input
        onChange={e => {
          this.handleUpdateValue(propName, e);
        }}
        type='text'
        defaultValue={
          this.metaNode ? this.metaNode.properties[propName].value : null
        }
      />
    );
  }

  render() {
    return (
      <div className='deploy-view'>
        <div className='label'>Metadata</div>
        <div className='meta-container'>
          <div className='meta'>Title {this.renderProps('title')}</div>
          <div className='meta'>
            Description {this.renderProps('description')}
          </div>
          {/* <div className='meta'>URL {this.renderProps('url')}</div> */}
        </div>
        <button onClick={this.context.deploy}>Publish</button>
      </div>
    );
  }
}

export default Deploy;

// this.metaNode
//   ? Object.keys(this.metaNode.properties).map(propName => {
//       return (
//         <div key={propName} style={{ display: 'flex', flexDirection: 'row' }}>
//           {propName}
//           {this.renderProps(propName)}
//         </div>
//       );
//     })
//   : null;
