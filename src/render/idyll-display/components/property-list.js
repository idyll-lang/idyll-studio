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
    const propertiesCopy = {};
    Object.keys(this.props.node.properties).forEach((property) => {
      const propertyObject = this.props.node.properties[property];

      if (property === propName) {
        propertiesCopy[propName] = {
          ...propertyObject,
          value: propValue,
        };
      } else {
        propertiesCopy[property] = { ...propertyObject };
      }
    });

    // send to author view with info
    this.props.updateNodeWithNewProperties(
      this.props.node,
      propertiesCopy,
      propName,
      e
    );
  }

  updateNodeType(propName, propType) {
    this.props.updateNodeType(propName, propType, this.props.node);
  }

  render() {
    const ASTNode = this.props.node;
    const properties = [];
    return (
      <div>
        {Object.keys(ASTNode.properties || {}).map((propName) => {
          const prop = ASTNode.properties[propName];

          return (
            <div
              key={propName}
              style={{ marginBottom: '1em', padding: '0 0.25em' }}>
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
                  value={prop}
                  variableData={this.props.variableData}
                  updateNodeType={this.updateNodeType.bind(this)}
                  updateShowPropDetailsMap={this.props.updateShowPropDetailsMap}
                  showDetails={this.props.showPropDetailsMap[propName]}
                  activePropName={this.props.activePropName}
                  cursorPosition={this.props.cursorPosition}
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
