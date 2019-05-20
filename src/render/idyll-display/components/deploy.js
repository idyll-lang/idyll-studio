import React from 'react';
const idyllAST = require('idyll-ast');
import Context from '../../context';
const compile = require('idyll-compiler');
const getRandomId = () => {
  return Math.floor(Math.random() * 10000000000) + 100000000;
};

class Deploy extends React.PureComponent {
  static contextType = Context;
  constructor(props) {
    super(props);
    this.state = { metaNode: null };
  }

  componentDidMount() {
    // Grab meta node
    let node = idyllAST.getNodesByType(this.context.ast, 'meta')[0];
    this.setState(
      {
        metaNode: node
      },
      () => {
        if (!this.state.metaNode) {
          // if doesn't exist insert into tree
          compile('[meta /]').then(metaAST => {
            let ast = this.context.ast;
            let lastChild = ast.children[ast.children.length - 1];

            // reset ids
            metaAST.children[0].id = getRandomId(); // TextContainer
            this.setState({ metaNode: metaAST.children[0].children[0] }); // meta
            this.state.metaNode.id = getRandomId();

            if (lastChild.name === 'TextContainer') {
              // push just meta tag
              lastChild.children.push(metaAST.children[0].children[0]);
            } else {
              // push text container
              ast = idyllAST.appendNode(ast, metaAST.children[0]);
            }
            this.context.setAst(this.context.ast);
          });
        }
      }
    );
  }

  handleUpdateValue(propName, e) {
    // if index.idyll doesn't have this prop for meta tag, insert one
    if (!(propName in this.state.metaNode.properties)) {
      this.state.metaNode.properties[propName] = { type: 'value', value: '' };
    }
    this.state.metaNode.properties[propName].value = e.target.value;
    this.context.setAst(this.context.ast);

    // Debug
    console.log(
      idyllAST.getNodesByType(this.context.ast, 'meta')[0].properties
    );
  }

  renderProps(propName) {
    return (
      <input
        onChange={e => {
          this.handleUpdateValue(propName, e);
        }}
        type='text'
        defaultValue={
          this.state.metaNode && propName in this.state.metaNode.properties
            ? this.state.metaNode.properties[propName].value
            : null
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
          <div className='meta'>
            URL <a href={this.context.url}>{this.context.url}</a>
          </div>
        </div>
        <button onClick={this.context.deploy}>Publish</button>
      </div>
    );
  }
}

export default Deploy;
