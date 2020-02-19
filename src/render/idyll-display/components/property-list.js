import React from 'react';
import Property from './property';

class Component extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      newPropName: ''
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
      value: ''
    };

    this.setState({ newPropName: '' });
    // this.context.setAst(this.context.ast);
  }

  /**
   *
   * @param {string} propertyName the name of the prop
   * @param {string} propertyValue the value of the prop
   */
  updateProperty(propertyName, propertyValue) {
    const propertiesCopy = {};
    Object.keys(this.props.node.properties).forEach(property => {
      const propertyObject = this.props.node.properties[property];

      if (property === propertyName) {
        propertiesCopy[propertyName] = {
          ...propertyObject,
          value: propertyValue
        };
      } else {
        propertiesCopy[property] = { ...propertyObject };
      }
    });
    // send to author view with info
    this.props.updateNodeWithNewProperties(this.props.node, propertiesCopy);
  }

  render() {
    const ASTNode = this.props.node;
    const properties = [];
    return (
      <div>
        {Object.keys(ASTNode.properties || {}).map(propName => {
          const prop = ASTNode.properties[propName];

          return (
            <div
              key={propName}
              style={{ marginBottom: '1em', padding: '0 0.25em' }}
            >
              {/* <div style={{fontFamily: 'monospace' ,fontWeight: 'bold'}}>{propName}</div> */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between'
                }}
              >
                <Property
                  updateProperty={this.updateProperty.bind(this)}
                  node={ASTNode}
                  name={propName}
                  value={prop}
                  updateNodeType={this.props.updateNodeType}
                  variableData={this.props.variableData}
                  updateShowPropDetailsMap={this.props.updateShowPropDetailsMap}
                  showDetails={this.props.showPropDetailsMap[propName]}
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

export default Component;
