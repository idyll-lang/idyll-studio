import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Context from '../../context/context';
import { withContext } from '../../context/with-context';
import { getNodeById, debounce } from '../utils/';
import { DEBOUNCE_PROPERTY_MILLISECONDS } from '../../../constants';
import PropertyList from './property-list';

export const AuthorView2 = withContext(
  class AuthorView extends React.PureComponent {
    static contextType = Context;

    constructor(props) {
      super(props);

      this.state = {
        activeDomNode: null,
        dimensions: null
      };
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
      const { dimensions, activeDomNode } = this.state;
      const componentDomNode = document.getElementById('app');

      if (activeDomNode) {
        console.log('WHAT');
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
              node={this.props.context.activeComponent}
              updateNodeWithNewProperties={this.updateNodeWithNewProperties.bind(
                this
              )}
              updateNodeType={this.updateNodeType.bind(this)}
              variableData={this.props.context.context.data()}
            />
          </div>
        );

        return ReactDOM.createPortal(childComponent, componentDomNode);
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
}

// {/* <div style={{
// top: dimensions.top + 75,
// bottom: dimensions.bottom,
// right: dimensions.right,
// left: dimensions.left - 75,
// position: 'absolute'
//                 }}>HELLLO </div> */}
