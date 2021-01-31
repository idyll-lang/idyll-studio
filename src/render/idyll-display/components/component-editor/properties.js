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

      this.state = {
        newProp: '',
        variableData: props.context.context.data()
      }

      props.context.context.onUpdate((newData) => {
        this.setState({
          variableData: { ...props.context.context.data(), ...newData }
        })
      })
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

    handleClickAddProp() {
      this.setState({
        newProp: ''
      })
    }

    handleSubmitProp() {
      let node = getNodeById(
        this.props.context.ast,
        this.props.context.activeComponent.id
      );

      const newPropList = getUpdatedPropertyList(
        node,
        this.state.newProp,
        '',
      );
      node.properties = newPropList;
      this.props.context.setAst(this.props.context.ast);
      this.props.context.setActiveComponent(node);
      this.setState({
        newProp: ''
      })
    }

    deleteProperty(key) {
      let node = getNodeById(
        this.props.context.ast,
        this.props.context.activeComponent.id
      );
      delete node.properties[key];
      this.props.context.setAst(this.props.context.ast);
      this.props.context.setActiveComponent(node);
    }

    handleUpdateNewPropName(event) {
      this.setState({
        newProp: event.target.value
      })
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
          variableData={this.state.variableData}
          deleteProperty={this.deleteProperty.bind(this)}
        />
        <div>
          <div className='prop-name'>Add new property</div>
          <div style={{display: 'flex', alignItems: 'center', marginBottom: '1em', fontSize: 12}}>
            <input style={{margin: 0, fontSize: 12, paddingLeft: 10, width: '100%'}} placeholder={'Enter name'} value={this.state.newProp} onChange={this.handleUpdateNewPropName.bind(this)} />
            <div style={{paddingLeft: '0.5em', textAlign: 'center', width: '50%', cursor: 'pointer', textTransform: 'uppercase', fontSize: 12, background: '#666', padding: '3px 0'}} onClick={this.handleSubmitProp.bind(this)}>Submit</div>
          </div>
        </div>
      </div>
      )
    }
  }
);
