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
        activeDomNode: null,
        dimensions: null
      };
    }

    componentWillUnmount() {
      this.setState({
        activePropName: '',
        cursorPosition: -1
      });

      this.props.context.setActiveComponent(null);
    }

    componentDidMount() {
      window.addEventListener('resize', this.handleResize);
    }

    handleResize = e => {
      if (this.state.activeDomNode) {
        const activeComponentDimensions = this.state.activeDomNode.getClientRects();
        console.log(activeComponentDimensions[0]);

        this.setState({
          dimensions: activeComponentDimensions[0]
        });
      }
    };

    componentDidUpdate(prevProps) {
      const { context } = this.props;
      const isValidActiveComponent =
        context.activeComponent &&
        Object.keys(context.activeComponent).length != 0;

      if (
        prevProps.context.activeComponent != context.activeComponent &&
        isValidActiveComponent
      ) {
        const activeComponentDomNode = document.getElementById(
          context.activeComponent.name + '-' + context.activeComponent.id
        );

        this.setState({
          activeDomNode: activeComponentDomNode,
          dimensions: activeComponentDomNode.getClientRects()[0]
        });

        console.log('PUT');
      } else if (!isValidActiveComponent) {
        this.setState({
          activeDomNode: null,
          dimensions: null
        });
      }
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
    updateNodeWithNewProperties(idyllASTNode, propName, propValue) {
      this.setState({
        activePropName: propName,
        activePropInput: propValue
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
      const { dimensions } = this.state;

      if (activeComponent && dimensions) {
        const childComponent = (
          <div
            className="author-view-overlay"
            style={{
              top: dimensions.top + 75,
              bottom: dimensions.bottom,
              right: dimensions.right,
              left: dimensions.left - 75
            }}>
            <PropertyList
              node={activeComponent}
              updateNodeWithNewProperties={this.updateNodeWithNewProperties.bind(
                this
              )}
              updateNodeType={this.updateNodeType.bind(this)}
              variableData={this.props.context.context.data()}
              activePropName={this.state.activePropName}
              activePropInput={this.state.activePropInput}
            />
          </div>
        );

        const componentDomNode = activeComponent
          ? document.getElementById(
              // this.props.context.activeComponent.name +
              //   '-' +
              //   this.props.context.activeComponent.id
              'app'
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
  Object.keys(node.properties).forEach(property => {
    const propertyObject = node.properties[property];

    if (property === propName) {
      propertiesCopy[propName] = {
        ...propertyObject,
        value: propValue
      };
    } else {
      propertiesCopy[property] = { ...propertyObject };
    }
  });

  return propertiesCopy;
}
