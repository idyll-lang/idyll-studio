import React from 'react';
import Property from './property';
import Context from '../../context';

class Component extends React.PureComponent {
  static contextType = Context;

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
    this.context.setAst(this.context.ast);
  }

  handleUpdateValue(propName) {
    return e => {
      const node = this.props.node;
      let val = e.target.value;
      if (val.trim() !== '') {
        val = Number(e.target.value);
      }
      if (isNaN(val)) {
        val = e.target.value;
      }

      node.properties[propName].value = val;
      this.context.setAst(this.context.ast);
    };
  }

  handleUpdateType(propName, type) {
    return () => {
      const node = this.props.node;
      node.properties[propName].type = type;
      this.context.setAst(this.context.ast);
    };
  }

  renderExpression(key, prop) {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
        <input
          className={'prop-input'}
          style={{ fontFamily: 'monospace' }}
          onChange={this.handleUpdateValue(key)}
          type='text'
          value={prop.value}
        ></input>
        <div
          className={'prop-type'}
          onClick={this.handleUpdateType(key, 'variable')}
          style={{
            marginLeft: 0,
            borderRadius: '0 20px 20px 0',
            background: '#B8E986'
          }}
        >
          {prop.type}
        </div>
        <div></div>
      </div>
    );
  }
  renderValue(key, prop) {
    return (
      <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
        <input
          className={'prop-input'}
          onChange={this.handleUpdateValue(key)}
          type='text'
          value={prop.value}
        ></input>
        <div
          className={'prop-type'}
          onClick={this.handleUpdateType(key, 'expression')}
          style={{
            marginLeft: 0,
            borderRadius: '0 20px 20px 0',
            background: '#4A90E2',
            color: '#fff'
          }}
        >
          {typeof prop.value}
        </div>
        <div>{/* Current Value: {idyllState[prop.value]} */}</div>
      </div>
    );
  }
  renderVariable(key, prop) {
    const idyllState = this.context.context.data();
    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
          <input
            className={'prop-input'}
            style={{ fontFamily: 'monospace' }}
            onChange={this.handleUpdateValue(key)}
            type='text'
            value={prop.value}
          ></input>
          <div
            className={'prop-type'}
            onClick={this.handleUpdateType(key, 'value')}
            style={{
              marginLeft: 0,
              borderRadius: '0 20px 20px 0',
              background: '#50E3C2'
            }}
          >
            {prop.type}
          </div>
        </div>
        <div>Current Value: {idyllState[prop.value]}</div>
      </div>
    );
  }

  renderProp(key, prop) {
    switch (prop.type) {
      case 'variable':
        return this.renderVariable(key, prop);
      case 'value':
        return this.renderValue(key, prop);
      case 'expression':
        return this.renderExpression(key, prop);
    }
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
                  setAst={this.context.setAst}
                  ast={this.context.ast}
                  node={ASTNode}
                  name={propName}
                  value={prop}
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
