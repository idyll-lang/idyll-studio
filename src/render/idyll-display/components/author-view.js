import * as React from 'react';
import * as ReactDOM from 'react-dom';
import PropertyList from './property-list';
import { getNodeById } from '../utils/';
import Context from '../../context';
const AST = require('idyll-ast');

/**
 *
 */
class AuthorView extends React.PureComponent {
  static contextType = Context;

  constructor(props) {
    super(props);
  }

  updateNodeWithNewProperties(idyllASTNode, newPropertyList) {
    // update node
    let node = getNodeById(this.context.ast, idyllASTNode.id);
    const newNode = { ...node, properties: newPropertyList };

    const childrenCopy = AST.getChildren(node);
    if (newNode.children) {
      newNode.children = childrenCopy;
    }

    node.properties = newPropertyList;
    this.context.setAst(this.context.ast);
  }

  render() {
    const childComponent = (
      <div className='author-view-overlay'>
        <PropertyList
          node={this.context.activeComponent}
          updateNodeWithNewProperties={this.updateNodeWithNewProperties.bind(
            this
          )}
        />
      </div>
    );

    const componentDomNode = document.getElementById(
      this.context.activeComponent.name + '-' + this.context.activeComponent.id
    );

    if (componentDomNode) {
      return ReactDOM.createPortal(childComponent, componentDomNode);
    } else {
      return <></>;
    }
  }
}

export default AuthorView;
