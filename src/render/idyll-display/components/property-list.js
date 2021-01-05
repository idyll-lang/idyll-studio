import React from 'react';
import Property from './property';

/**
 * Returns a list of properties for the given node
 */
class PropertyList extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      newPropertyName: ''
    };
  }

  handleUpdateNewPropertyName(event) {
    this.setState({ newPropertyName: event.target.value });
  }

  addProperty() {
    const node = this.props.node;
    node.properties = node.properties || {};
    node.properties[this.state.newPropertyName] = {
      type: 'value',
      value: ''
    };

    this.setState({ newPropertyName: '' });
  }

  render() {
    const ASTNode = this.props.node;
    return (
      <div className='property-list'>
        {Object.keys(ASTNode.properties || {}).map(propertyName => {
          const propertyObject = ASTNode.properties[propertyName];
          return (
            <div
              key={propertyName}
              style={{ marginBottom: '5px', padding: '0 0.25em' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between'
                }}>
                <Property
                  updateProperty={this.props.updateNodeWithNewProperties}
                  name={propertyName}
                  propertyObject={propertyObject}
                  variableData={this.props.variableData}
                  updateNodeType={this.props.updateNodeType}
                />
              </div>
            </div>
          );
        })}
        {/* <div>
          Add property

          <div style={{display: 'flex', flexDirection: 'row'}}>
            <input type="text" placeholder="Property Name" value={this.state.newpropertyName} onChange={this.handleUpdateNewpropertyName.bind(this)} />
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
