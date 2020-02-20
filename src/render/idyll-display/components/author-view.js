import * as React from 'react';
import * as ReactDOM from 'react-dom';
import PropertyList from './property-list';
import { getNodeById } from '../utils/';
import Context from '../../context';
const AST = require('idyll-ast');

/**
 * An AuthorView is associated with an active component.
 * If a component is registered as active, renders
 * a property list of all the components properties for editing.
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
    const { activeComponent } = this.context;

    const activeComponentProperties =
      activeComponent && activeComponent.properties
        ? activeComponent.properties
        : {};

    const resultMap = {};
    for (const key of Object.keys(activeComponentProperties)) {
      resultMap[key] = false;
    }

    this.setState({
      showPropDetailsMap: resultMap
    });
  }

  componentWillUnmount() {
    this.setState({
      showPropDetailsMap: {},
      activePropName: '',
      cursorPosition: -1
    });

    this.context.setActiveComponent(null);
  }

  componentDidUpdate(prevProps) {
    console.log('hi', prevProps.activeId, this.props.activeId);

    if (prevProps.activeId !== this.props.activeId) {
      this.setState({
        showPropDetailsMap: {},
        activePropName: '',
        newPropName: '',
        cursorPosition: -1
      });
    }
  }

  updateShowPropDetailsMap(propName) {
    this.setState({
      showPropDetailsMap: { ...this.state.showPropDetailsMap, [propName]: true }
    });
  }

  updateNodeWithNewProperties(idyllASTNode, newPropertyList, e, propertyName) {
    const selectionStart = e.target.selectionStart;

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

    console.log(this.context.activeComponent, 'active component');
  }

  updateNodeType(propName, type) {
    return () => {
      const node = this.context.activeComponent;
      node.properties[propName].type = type;
      this.context.setAst(this.context.ast);
    };
  }

  render() {
    const { activeComponent } = this.context;

    if (activeComponent) {
      const childComponent = (
        <div className='author-view-overlay'>
          <PropertyList
            node={activeComponent}
            updateNodeWithNewProperties={this.updateNodeWithNewProperties.bind(
              this
            )}
            updateNodeType={this.updateNodeType.bind(this)}
            updateShowPropDetailsMap={this.updateShowPropDetailsMap.bind(this)}
            variableData={this.context.context.data()}
            showPropDetailsMap={this.state.showPropDetailsMap}
            activePropName={this.state.activePropName}
            cursorPosition={this.state.cursorPosition}
          />
        </div>
      );

      const componentDomNode = activeComponent
        ? document.getElementById(this.props.activeId)
        : null;

      if (componentDomNode) {
        return ReactDOM.createPortal(childComponent, componentDomNode);
      }
    }
    return <></>;
  }
}

export default AuthorView;
