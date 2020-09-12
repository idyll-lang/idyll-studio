import * as React from 'react';
import * as ReactDOM from 'react-dom';
import PropertyList from './property-list';
import { getNodeById, isDifferentActiveNode, debounce } from '../utils/';
const AST = require('idyll-ast');
import { withContext } from '../../context/with-context';

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
        cursorPosition: -1,
        activePropInput: '',
      };
    }

    debouncedSetAst = debounce((node, propName, propValue) => {
      const newPropList = getUpdatedPropList(node, propName, propValue);
      node.properties = newPropList;
      this.props.context.setAst(this.props.context.ast);
      this.props.context.setActiveComponent(node);
    }, 500);

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
        showPropDetailsMap: resultMap,
      });
    }

    componentWillUnmount() {
      this.setState({
        showPropDetailsMap: {},
        activePropName: '',
        cursorPosition: -1,
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
          cursorPosition: -1,
          activePropInput: '',
        });
      }
    }

    updateShowPropDetailsMap(propName) {
      this.setState({
        showPropDetailsMap: {
          ...this.state.showPropDetailsMap,
          [propName]: true,
        },
      });
    }

    /**
     * On a prop change for the given active node,
     * updates the ast with its new prop values and
     * updates the context's active component to the
     * changed node
     * @param {IdyllAstNode} idyllASTNode the current active node
     * @param {Object} newPropList the new properties list
     * @param {string} propName the prop name changed
     * @param {React.ChangeEvent} e the change event associated
     *                               w/ the prop change
     */
    updateNodeWithNewProperties(idyllASTNode, propValue, propName, e) {
      const selectionStart = e.target.selectionStart;

      this.setState({
        cursorPosition: selectionStart,
        activePropName: propName,
        activePropInput: propValue,
      });

      // update node
      let node = getNodeById(this.props.context.ast, idyllASTNode.id);

      this.debouncedSetAst(node, propName, propValue);
    }

    onPropFocus(propName, originalInput, cursorPosition) {
      this.setState({
        activePropName: propName,
        activePropInput: originalInput,
        cursorPosition: cursorPosition,
      });
    }

    onPropBlur() {
      console.log('BLUR');
      this.setState({
        activePropName: '',
        activePropInput: '',
        cursorPosition: -1,
      });
    }

    /**
     * Updates the prop type to the given one
     * in the ast
     * @param {string} propName the name of the prop
     * @param {string} propType the next type of the prop
     *                      (value, variable, expression)
     */
    updateNodeType(propName, propType, idyllASTNode) {
      const node = getNodeById(this.props.context.ast, idyllASTNode.id);
      node.properties[propName].type = propType;
      this.props.context.setAst(this.props.context.ast);
      this.props.context.setActiveComponent(node);
    }

    render() {
      const { activeComponent } = this.props.context;

      if (activeComponent) {
        const childComponent = (
          <div className="author-view-overlay">
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
              activePropInput={this.state.activePropInput}
              onPropFocus={this.onPropFocus.bind(this)}
              onPropBlur={this.onPropBlur.bind(this)}
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

function getUpdatedPropList(node, propName, propValue) {
  const propertiesCopy = {};
  Object.keys(node.properties).forEach((property) => {
    const propertyObject = node.properties[property];

    if (property === propName) {
      propertiesCopy[propName] = {
        ...propertyObject,
        value: propValue,
      };
    } else {
      propertiesCopy[property] = { ...propertyObject };
    }
  });

  return propertiesCopy;
}
