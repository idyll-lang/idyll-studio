import * as React from 'react';
import PropertyList from './property-list';
import { getNodeById, debounce, getUpdatedPropertyList } from '../utils/';
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
        activeDomNode: null,
        dimensions: null
      };
    }

    componentWillUnmount() {
      this.props.context.setActiveComponent(null);
      window.removeEventListener('resize', this.handleWindowEvent);

      const parent = document.getElementsByClassName('output-container')[0];
      parent.removeEventListener('scroll', this.handleWindowEvent);
    }

    componentDidMount() {
      window.addEventListener('resize', this.handleWindowEvent);

      const parent = document.getElementsByClassName('output-container')[0];
      parent.addEventListener('scroll', this.handleWindowEvent);
    }

    componentDidUpdate(prevProps) {
      const { context } = this.props;
      const isValidActiveComponent =
        context.activeComponent &&
        Object.keys(context.activeComponent).length != 0;

      // update which dom node represents the "active" component being worked on
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
      } else if (!isValidActiveComponent && prevProps.context.activeComponent) {
        this.setState({
          activeDomNode: null,
          dimensions: null
        });
      }
    }

    /**
     * On scroll or resize events, stores the new dimensions
     * of the active component
     */
    handleWindowEvent = () => {
      if (this.state.activeDomNode) {
        const activeComponentDimensions = this.state.activeDomNode.getClientRects();

        this.setState({
          dimensions: activeComponentDimensions[0]
        });
      }
    };

    /**
     * On a prop change for the given active node,
     * updates the ast with its new prop values and
     * updates the context's active component to the
     * changed node
     * @param {IdyllAstNode} idyllASTNode the current active node
     * @param {Object} newPropList the new properties list
     * @param {string} propertyName the prop name changed
     * @param {React.ChangeEvent} e the change event associated
     *                               w/ the prop change
     */
    updateNodeWithNewProperties(propertyName, propertyValue) {
      // update node
      let node = getNodeById(
        this.props.context.ast,
        this.props.context.activeComponent.id
      );

      this.debouncedSetAst(node, propertyName, propertyValue);
    }

    /**
     * Returns a function that will update the context with the new
     * property values for the active component after DEBOUNCE_PROPERTY_MILLISECONDS
     * amount of time has passed since the last function invoke
     */
    debouncedSetAst = debounce((node, propertyName, propertyValue) => {
      const newPropList = getUpdatedPropertyList(node, propertyName, propertyValue);
      node.properties = newPropList;
      this.props.context.setAst(this.props.context.ast);
      this.props.context.setActiveComponent(node);
    }, DEBOUNCE_PROPERTY_MILLISECONDS);

    /**
     * Updates the prop type to the given one
     * in the ast
     * @param {string} propertyName the name of the prop
     * @param {string} propertyType the next type of the prop
     *                      (value, variable, expression)
     */
    updateNodeType(propertyName, propertyType) {
      const node = getNodeById(
        this.props.context.ast,
        this.props.context.activeComponent.id
      );
      node.properties[propertyName].type = propertyType;
      this.props.context.setAst(this.props.context.ast);
      this.props.context.setActiveComponent(node);
    }

    render() {
      const { activeComponent } = this.props.context;
      const { dimensions } = this.state;

      if (activeComponent && dimensions) {
        return (
          <div
            className='author-view-overlay'
            style={{
              top: dimensions.top + 60,
              left: dimensions.left
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
