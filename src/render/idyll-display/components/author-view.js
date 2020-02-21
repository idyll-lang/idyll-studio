import * as React from 'react';
import * as ReactDOM from 'react-dom';
import PropertyList from './property-list';
import { getNodeById } from '../utils/';
import Context from '../../context';
const AST = require('idyll-ast');

const withContext = WrappedConsumer => props => (
  <Context.Consumer>
    {context => <WrappedConsumer {...props} context={context} />}
  </Context.Consumer>
);

/**
 * An AuthorView is associated with an active component.
 * If a component is registered as active, renders
 * a property list of all the components properties for editing.
 */
export const WrappedAuthorView = withContext(
  class AuthorView extends React.PureComponent {
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
      const { activeComponent } = this.props.context;

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

      this.props.context.setActiveComponent(null);
    }

    componentDidUpdate(prevProps) {
      if (
        prevProps.context.activeComponent !== this.props.context.activeComponent
      ) {
        this.setState({
          showPropDetailsMap: {},
          activePropName: '',
          cursorPosition: -1
        });
      }
    }

    updateShowPropDetailsMap(propName) {
      this.setState({
        showPropDetailsMap: {
          ...this.state.showPropDetailsMap,
          [propName]: true
        }
      });
    }

    updateNodeWithNewProperties(
      idyllASTNode,
      newPropertyList,
      e,
      propertyName
    ) {
      const selectionStart = e.target.selectionStart;

      this.setState({
        activePropName: propertyName,
        cursorPosition: selectionStart
      });

      // update node
      let node = getNodeById(this.props.context.ast, idyllASTNode.id);
      const newNode = { ...node, properties: newPropertyList };

      const childrenCopy = AST.getChildren(node);
      if (newNode.children) {
        newNode.children = childrenCopy;
      }

      node.properties = newPropertyList;
      this.props.context.setAst(this.props.context.ast);

      console.log(this.props.context.activeComponent, 'active component');
    }

    updateNodeType(propName, type) {
      return () => {
        const node = this.props.context.activeComponent;
        node.properties[propName].type = type;
        this.props.context.setAst(this.props.context.ast);
      };
    }

    render() {
      const { activeComponent } = this.props.context;

      if (activeComponent) {
        const childComponent = (
          <div className='author-view-overlay'>
            <PropertyList
              node={activeComponent}
              updateNodeWithNewProperties={this.updateNodeWithNewProperties.bind(
                this
              )}
              updateNodeType={this.updateNodeType.bind(this)}
              updateShowPropDetailsMap={this.updateShowPropDetailsMap.bind(
                this
              )}
              variableData={this.props.context.context.data()}
              showPropDetailsMap={this.state.showPropDetailsMap}
              activePropName={this.state.activePropName}
              cursorPosition={this.state.cursorPosition}
            />
          </div>
        );

        const componentDomNode = activeComponent
          ? document.getElementById(
              this.props.context.activeComponent.name +
                '-' +
                this.props.context.activeComponent.id
            )
          : null;

        if (componentDomNode) {
          return ReactDOM.createPortal(childComponent, componentDomNode);
        }
      }
      return <></>;
    }
  }
);
