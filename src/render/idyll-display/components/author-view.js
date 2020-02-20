import * as React from 'react';
import * as ReactDOM from 'react-dom';
import PropertyList from './property-list';
import { getNodeById } from '../utils/';
import Context from '../../context';
import { isChildOf } from '../utils/';
const AST = require('idyll-ast');

/**
 * TODO: Make sure active component is updated as well
 */
class AuthorView extends React.PureComponent {
  static contextType = Context;

  constructor(props) {
    super(props);

    this.state = {
      newPropName: '',
      showPropDetailsMap: {}, // name of prop -> true if open, false if not
      activePropName: '',
      cursorPosition: -1
    };
  }

  componentDidMount() {
    const activeComponent = this.context.activeComponent.properties;
    const resultMap = {};
    for (const key of Object.keys(activeComponent)) {
      resultMap[key] = false;
    }

    this.setState({
      showPropDetailsMap: resultMap
    });
  }

  updateShowPropDetailsMap(propName) {
    this.setState({
      showPropDetailsMap: { ...this.state.showPropDetailsMap, [propName]: true }
    });
  }

  updateNodeWithNewProperties(idyllASTNode, newPropertyList, e, propertyName) {
    const selectionStart = e.target.selectionStart;
    const eventNode = e.target;

    this.setState({
      activePropName: propertyName,
      cursorPosition: selectionStart
    });

    // update node
    let node = getNodeById(this.context.ast, idyllASTNode.id);
    const newNode = { ...node, properties: newPropertyList };

    const childrenCopy = AST.getChildren(node);
    if (newNode.children) {
      newNode.children = childrenCopy;
    }

    node.properties = newPropertyList;
    this.context.setAst(this.context.ast);

    // console.log(eventNode);
    // eventNode.focus();
    // eventNode.setSelectionRange(selectionStart, selectionStart);
  }

  updateNodeType(propName, type) {
    return () => {
      const node = this.context.activeComponent;
      node.properties[propName].type = type;
      this.context.setAst(this.context.ast);
    };
  }

  render() {
    const childComponent = (
      <div className='author-view-overlay'>
        <PropertyList
          node={this.context.activeComponent}
          updateNodeWithNewProperties={this.updateNodeWithNewProperties.bind(
            this
          )}
          updateNodeType={this.updateNodeType.bind(this)}
          variableData={this.context.context.data()}
          updateShowPropDetailsMap={this.updateShowPropDetailsMap.bind(this)}
          showPropDetailsMap={this.state.showPropDetailsMap}
          activePropName={this.state.activePropName}
          cursorPosition={this.state.cursorPosition}
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
