import React from 'react';
import AST from 'idyll-ast';
import ComponentView from '../components/component-view.js';
import DatasetView from '../components/dataset-view.js';
import VariableView from '../components/variable-view';
import Context from '../../context/context';

import * as layouts from 'idyll-layouts';
import * as themes from 'idyll-themes';

class Component extends React.PureComponent {
  static contextType = Context;

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
    const node = this.context.currentSidebarNode;
    node.properties = node.properties || {};
    node.properties[this.state.newPropName] = {
      type: 'value',
      value: '',
    };

    this.setState({ newPropName: '' });
    this.context.setAst(this.context.ast);
  }

  handleUpdateValue(propName) {
    return (e) => {
      const node = this.context.currentSidebarNode;
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
      const node = this.context.currentSidebarNode;
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
            background: '#B8E986',
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
            color: '#fff',
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
              background: '#50E3C2',
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
    const ASTNode = this.context.currentSidebarNode;
    const properties = [];

    return (
      <div>
        <a onClick={() => this.context.setSidebarNode(null)}>← Back</a>
        <h2>{ASTNode.name} component</h2>
        <div>
          {Object.keys(ASTNode.properties || {}).map((propName) => {
            const prop = ASTNode.properties[propName];
            return (
              <div style={{ marginBottom: '1em', padding: '0 1em' }}>
                <div style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                  {propName}
                </div>
                <div
                  key={propName}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  {this.renderProp(propName, prop)}
                </div>
              </div>
            );
          })}
          <div>
            Add property
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <input
                type='text'
                placeholder='Property Name'
                value={this.state.newPropName}
                onChange={this.handleUpdateNewPropName.bind(this)}
              />
              <button onClick={this.addProperty.bind(this)}>Add</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Component;
