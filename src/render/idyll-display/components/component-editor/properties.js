import * as React from 'react';
import PropertyList from './property-list';
import { getNodeById, throttle, getUpdatedPropertyList } from '../../utils/';
import { withContext } from '../../../context/with-context';
import { DEBOUNCE_PROPERTY_MILLISECONDS } from '../../../../constants';

/**
 * An AuthorView is associated with an active component.
 * If a component is registered as active, renders
 * a property list of all the components properties for editing.
 */
export default withContext(
  class Properties extends React.PureComponent {
    constructor(props) {
      super(props);
    }

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
    debouncedSetAst = throttle(
      (node, propertyName, propertyValue) => {
        const newPropList = getUpdatedPropertyList(
          node,
          propertyName,
          propertyValue
        );
        node.properties = newPropList;
        this.props.context.setAst(this.props.context.ast);
        this.props.context.setActiveComponent(node);
      },
      DEBOUNCE_PROPERTY_MILLISECONDS,
      { leading: true, trailing: true }
    );

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
      const { ast, activeComponent, setAst, context } = this.props.context;
      return  (
        <div style={{margin: "0 1em"}}>
        <PropertyList
          ast={ast}
          node={activeComponent}
          updateNodeWithNewProperties={this.updateNodeWithNewProperties.bind(
            this
          )}
          setAst={setAst}
          updateNodeType={this.updateNodeType.bind(this)}
          variableData={context.data()}
        />
      </div>
      )
    }
  }
);
