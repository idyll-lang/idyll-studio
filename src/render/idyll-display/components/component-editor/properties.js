import * as React from 'react';
import PropertyList from './property-list';
import {
  getNodeById,
  throttle,
  getUpdatedPropertyList,
  deleteNodeById,
} from '../../utils/';
import { withContext } from '../../../context/with-context';
import { DEBOUNCE_PROPERTY_MILLISECONDS } from '../../../../constants';
import * as IdyllComponents from 'idyll-components';

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
        variableData: props.context.context.data(),
        deleteConfirm: false,
      };
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
        newProp: '',
      });
    }

    handleDeleteComponent() {
      if (!this.state.deleteConfirm) {
        this.setState({
          deleteConfirm: true,
        });
        return;
      } else {
        this.setState({
          deleteConfirm: false,
        });
      }
      deleteNodeById(
        this.props.context.ast,
        this.props.context.activeComponent.id
      );
      this.props.context.setActiveComponent(null);
      this.props.context.setAst(this.props.context.ast);
    }

    handleSubmitProp() {
      let node = getNodeById(
        this.props.context.ast,
        this.props.context.activeComponent.id
      );

      const newPropList = getUpdatedPropertyList(node, this.state.newProp, '');
      node.properties = newPropList;
      this.props.context.setAst(this.props.context.ast);
      this.props.context.setActiveComponent(node);
      this.setState({
        newProp: '',
      });
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
        newProp: event.target.value,
      });
    }

    render() {
      const {
        ast,
        activeComponent,
        setAst,
        setActiveComponent,
        context,
      } = this.props.context;

      return (
        <div style={{ margin: '0 1em' }}>
          <div
            style={{
              margin: '0 5px 1em 0',
              fontSize: 14,
              display: 'flex',
              justifyContent: 'space-between',
            }}>
            <div>{activeComponent.name} component</div>
            <div>
              {IdyllComponents[activeComponent.name] ? (
                <a
                  target='_blank'
                  style={{ color: '#ccc', textDecoration: 'underline' }}
                  href={`https://idyll-lang.org/docs/component/${activeComponent.name.toLowerCase()}`}>
                  docs
                </a>
              ) : null}
            </div>
          </div>
          <PropertyList
            ast={ast}
            node={activeComponent}
            updateNodeWithNewProperties={this.updateNodeWithNewProperties.bind(
              this
            )}
            setAst={setAst}
            setActiveComponent={setActiveComponent}
            updateNodeType={this.updateNodeType.bind(this)}
            variableData={this.state.variableData}
            deleteProperty={this.deleteProperty.bind(this)}
          />
          <div>
            <div className='prop-name'>Add new property</div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1em',
                fontSize: 12,
              }}>
              <input
                style={{
                  margin: 0,
                  fontSize: 12,
                  paddingLeft: 10,
                  width: '100%',
                  height: 38,
                }}
                placeholder={'Enter name'}
                value={this.state.newProp}
                onChange={this.handleUpdateNewPropName.bind(this)}
              />
              <div
                style={{
                  textAlign: 'center',
                  width: '50%',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  fontSize: 12,
                  background: '#666',
                  padding: 0,
                  height: 38,
                  lineHeight: '38px',
                  border: 'none',
                }}
                onClick={this.handleSubmitProp.bind(this)}>
                Submit
              </div>
            </div>
          </div>
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '1em',
                fontSize: 12,
              }}>
              <button
                style={{
                  paddingLeft: '0.5em',
                  textAlign: 'center',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  fontSize: 12,
                  padding: '3px 0',
                  background: this.state.deleteConfirm ? '#cc0000' : '#999999',
                  color: 'white',
                  lineHeight: 'unset',
                  width: '100%',
                  border: 'none',
                }}
                onClick={this.handleDeleteComponent.bind(this)}>
                {this.state.deleteConfirm
                  ? 'Confirm Remove'
                  : 'Remove Component'}
              </button>
            </div>
          </div>
        </div>
      );
    }
  }
);
