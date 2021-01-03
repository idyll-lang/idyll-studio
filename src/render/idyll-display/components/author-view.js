import * as React from 'react';
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
        activeDomNode: null,
        dimensions: null
      };
    }

    componentWillUnmount() {
      this.props.context.setActiveComponent(null);
      window.removeEventListener('resize', this.handleResize);

      const parent = document.getElementsByClassName('output-container')[0];
      parent.removeEventListener('scroll', this.handleResize);
    }

    componentDidMount() {
      window.addEventListener('resize', this.handleResize);

      const parent = document.getElementsByClassName('output-container')[0];
      parent.addEventListener('scroll', this.handleResize);
    }

    handleResize = e => {
      if (this.state.activeDomNode) {
        const activeComponentDimensions = this.state.activeDomNode.getClientRects();

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

      if (prevProps.context.activeComponent != context.activeComponent 
          && isValidActiveComponent) {
        const activeComponentDomNode = document.getElementById(
          context.activeComponent.name + '-' + context.activeComponent.id
        );

        this.setState({
          activeDomNode: activeComponentDomNode,
          dimensions: activeComponentDomNode.getClientRects()[0]
        });
      } else if (!isValidActiveComponent && prevProps.context.activeComponent) {
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
    updateNodeWithNewProperties(propName, propValue) {
      this.setState({
        activePropName: propName,
        activePropInput: propValue
      });

      // update node
      let node = getNodeById(this.props.context.ast, this.props.context.activeComponent.id);

      this.debouncedSetAst(node, propName, propValue);
    }

    debouncedSetAst = debounce((node, propName, propValue) => {
      const newPropList = getUpdatedPropList(node, propName, propValue);
      node.properties = newPropList;
      this.props.context.setAst(this.props.context.ast);
    }, DEBOUNCE_PROPERTY_MILLISECONDS);

    /**
     * Updates the prop type to the given one
     * in the ast
     * @param {string} propName the name of the prop
     * @param {string} propType the next type of the prop
     *                      (value, variable, expression)
     */
    updateNodeType(propName, propType) {
      const node = getNodeById(this.props.context.ast, this.props.context.activeComponent);
      node.properties[propName].type = propType;
      this.props.context.setAst(this.props.context.ast);
      this.props.context.setActiveComponent(node);
    }

    render() {
      const { activeComponent } = this.props.context;
      const { dimensions } = this.state;

      if (activeComponent && dimensions) {
        return (
          <div
            className="author-view-overlay"
            style={{
              top: dimensions.top + 60,
              left: dimensions.left - 110
            }}>
            <PropertyList
              node={activeComponent}
              updateNodeWithNewProperties={this.updateNodeWithNewProperties.bind(
                this
              )}
              updateNodeType={this.updateNodeType.bind(this)}
              variableData={this.props.context.context.data()}
            />
          </div>
        );
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
