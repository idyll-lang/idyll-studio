import * as React from 'react';
import * as ReactDOM from 'react-dom';
import PropertyList from './property-list';
import { getNodeById, isDifferentActiveNode } from '../utils/';
import Context from '../../context';
const AST = require('idyll-ast');

/**
 * Returns a component that is passed the context as a prop
 * to be its consumer.
 * @param {React.PureComponent} WrappedConsumer a component that will consume
 *                                              the context
 */
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

    /**
     * Resets the state under two conditions:
     *   1) if one node is null and the other is not
     *   2) if both nodes are non-null but represent different
     *      components
     */
    componentDidUpdate(previousProps) {
      const previousActiveComponent = previousProps.context.activeComponent;
      const currentActiveComponent = this.props.context.activeComponent;

      if (
        isDifferentActiveNode(
          previousActiveComponent,
          currentActiveComponent
        ) ||
        (previousActiveComponent &&
          currentActiveComponent &&
          previousActiveComponent.id !== currentActiveComponent.id)
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

    /**
     * On a prop change for the given active node,
     * updates the ast with its new prop values and
     * updates the context's active component to the
     * changed node
     * @param {IdyllAstNode} idyllASTNode the current active node
     * @param {Object} newPropertyList the new properties list
     * @param {string} propertyName the prop name changed
     * @param {React.ChangeEvent} e the change event associated
     *                               w/ the prop change
     */
    updateNodeWithNewProperties(
      idyllASTNode,
      newPropertyList,
      propertyName,
      e
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
      this.props.context.setActiveComponent(node);
    }

    /**
     * Updates the prop type to the given one
     * in the ast
     * @param {string} propName the name of the prop
     * @param {string} type the next type of the prop
     *                      (value, variable, expression)
     */
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
