import React from 'react';
import AST from 'idyll-ast';
import ComponentView from '../components/component-view.js';
import DatasetView from '../components/dataset-view.js';
import VariableView from '../components/variable-view';
import Context from '../../context';

import * as layouts from 'idyll-layouts';
import * as themes from 'idyll-themes';

console.log(layouts, themes);

class Component extends React.PureComponent {

  static contextType = Context;

  handleUpdateValue(propName) {
    return (e) => {
      const node = this.context.currentSidebarNode;
      node.properties[propName].value = e.target.value;
      this.context.setAst(this.context.ast);
    }
  }

  renderExpression(key, prop) {
    return <div style={{display: 'flex', flexDirection: 'row'}}>
      <input onChange={this.handleUpdateValue(key)} type="text" value={prop.value}></input>
      <div style={{background: '#B8E986'}}>{prop.type}</div>
    </div>
  }
  renderValue(key, prop) {
    return <div style={{display: 'flex', flexDirection: 'row'}}>
      <input onChange={this.handleUpdateValue(key)} type="text" value={prop.value}></input>
      <div style={{background: '#4A90E2'}}>{typeof prop.value}</div>
    </div>
  }
  renderVariable(key, prop) {
    const idyllState = this.context.context.data();
    return <div>
        <div style={{display: 'flex', flexDirection: 'row'}}>
        <input onChange={this.handleUpdateValue(key)} type="text" value={prop.value}></input>
        <div style={{background: '#50E3C2'}}>{prop.type}</div>
      </div>
      Current Value: {idyllState[prop.value]}
    </div>
  }

  renderProp(key, prop) {
    switch(prop.type) {
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
        <h2>
          {ASTNode.name} component
        </h2>
        <div>
        {
          Object.keys(ASTNode.properties).map((propName) => {
            const prop = ASTNode.properties[propName];
            return <div key={propName} style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
              {propName}
              {this.renderProp(propName, prop)}
            </div>
          })
        }
        </div>
      </div>
    );
  }
}

export default Component;
