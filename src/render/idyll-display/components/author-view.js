import * as React from 'react';
import * as ReactDOM from 'react-dom';
import PropertyList from './property-list';
import { getNodeById, debounce } from '../utils/';
import { withContext } from '../../context/with-context';
import { DEBOUNCE_PROPERTY_MILLISECONDS } from '../../../constants';

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
        activePropName: '',
        cursorPosition: -1,
        activePropInput: '',
      };
    }

    componentWillUnmount() {
      this.setState({
        activePropName: '',
        cursorPosition: -1,
      });

      this.props.context.setActiveComponent(null);
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
    updateNodeWithNewProperties(idyllASTNode, propName, propValue, e) {
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

    debouncedSetAst = debounce((node, propName, propValue) => {
      const newPropList = getUpdatedPropList(node, propName, propValue);
      node.properties = newPropList;
      this.props.context.setAst(this.props.context.ast);
      this.props.context.setActiveComponent(node);
    }, DEBOUNCE_PROPERTY_MILLISECONDS);

    onPropBlur() {
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
            
              variableData={this.props.context.context.data()}
              activePropName={this.state.activePropName}
              cursorPosition={this.state.cursorPosition}
              activePropInput={this.state.activePropInput}
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
