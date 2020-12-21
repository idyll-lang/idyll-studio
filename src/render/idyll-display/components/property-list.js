import React from 'react';
import Property from './property';

/**
 * Returns a list of properties for the given node
 */
class PropertyList extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      newPropName: '',
    };
  }

  handleUpdateNewPropName(event) {
    this.setState({ newPropName: event.target.value });
  }

  addProperty() {
    const node = this.props.node;
    node.properties = node.properties || {};
    node.properties[this.state.newPropName] = {
      type: 'value',
      value: '',
    };

    this.setState({ newPropName: '' });
  }

  /**
   * Makes a copy of the node's properties with the
   * new property value and notifies parent
   * @param {string} propName the name of the prop
   * @param {string} propValue the value of the prop
   * @param {React.ChangeEvent} e the change event associated
   *                              with the node input change
   */
  updateProperty(propName, propValue, e) {
    // send to author view with info
    this.props.updateNodeWithNewProperties(
      this.props.node,
      propName,
      propValue,
      e
    );
  }

  updateNodeType(propName, propType) {
    this.props.updateNodeType(propName, propType, this.props.node);
  }

  render() {
    const ASTNode = this.props.node;
    return (
      <div>
        {Object.keys(ASTNode.properties || {}).map((propName) => {
          const propertyObject = ASTNode.properties[propName];

          return (
            <div
              key={propName}
              style={{ marginBottom: '5px', padding: '0 0.25em' }}>
              {/* <div style={{fontFamily: 'monospace' ,fontWeight: 'bold'}}>{propName}</div> */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Property
                  updateProperty={this.updateProperty.bind(this)}
                  name={propName}
                  propertyObject={propertyObject}
                  variableData={this.props.variableData}
                  updateNodeType={this.updateNodeType.bind(this)}
                  activePropName={this.props.activePropName}
                  cursorPosition={this.props.cursorPosition}
                  activePropInput={this.props.activePropInput}
                  onPropBlur={this.props.onPropBlur}
                />
              </div>
            </div>
          );
        })}
        {/* <div>
          Add property

          <div style={{display: 'flex', flexDirection: 'row'}}>
            <input type="text" placeholder="Property Name" value={this.state.newPropName} onChange={this.handleUpdateNewPropName.bind(this)} />
            <button onClick={this.addProperty.bind(this)}>
              Add
            </button>
          </div>
        </div>
        </div> */}
      </div>
    );
  }
}

export default PropertyList;
