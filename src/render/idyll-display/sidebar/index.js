import React from 'react';
import AST from 'idyll-ast';
import ComponentView from '../components/component-view.js';
import DatasetView from '../components/dataset-view.js';
import VariableView from '../components/variable-view';
import Deployment from '../components/deploy.js';
import ComponentDetails from './component.js';
import Context from '../../context';

import * as layouts from 'idyll-layouts';
import * as themes from 'idyll-themes';

console.log(layouts, themes);

class Sidebar extends React.PureComponent {
  static contextType = Context;

  constructor(props) {
    super(props);
    this.modifyAST = this.modifyAST.bind(this);
    this.assignNewVarValue = this.assignNewVarValue.bind(this);

    this.state = {
      collapsed: false
    };
  }

  handleThemeChange(event) {
    this.context.setTheme(event.target.value);
  }
  handleLayoutChange(event) {
    this.context.setLayout(event.target.value);
  }

  getStyleView() {
    return (
      <div>
        <div>
          Theme:{' '}
          <select
            onChange={this.handleThemeChange.bind(this)}
            value={this.context.theme}
          >
            {Object.keys(themes).map(themeName => {
              return (
                <option key={themeName} value={themeName}>
                  {themeName}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          Layout:{' '}
          <select
            onChange={this.handleLayoutChange.bind(this)}
            value={this.context.layout}
          >
            {Object.keys(layouts).map(layoutName => {
              return (
                <option key={layoutName} value={layoutName}>
                  {layoutName}
                </option>
              );
            })}
          </select>
        </div>
      </div>
    );
  }

  handleToggle() {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  modifyAST() {
    const currentAST = this.context.ast;
    const h2Nodes = AST.modifyNodesByName(currentAST, 'h2', node => {
      node.children[0].value = 'alan took over';
      return node;
    });
    this.context.setAst({ ...h2Nodes });
  }

  // Returns a list of all variables made in this ast
  getAllVariables() {
    return AST.getNodesByType(this.context.ast, 'var').map(variable => {
      const props = variable.properties;
      const name = props.name.value;
      const value = props.value.value;
      return (
        <div className='variables-view' key={name}>
          <li key={variable}>
            {name}, whose current value is {value}
          </li>
          <VariableForm node={variable} ast={this.context.ast} />
        </div>
      );
    });
  }

  assignNewVarValue(node) {
    node.properties.value.value = 20;
    this.context.setAst({ ...this.context.ast });
  }

  render() {
    const { ast, currentSidebarNode } = this.context;

    if (!ast) {
      return (
        <div>
          <h1>Sidebar View (Please load an Idyll project)</h1>
        </div>
      );
    }

    return (
      <div
        className='sidebar-information'
        style={{ width: this.state.collapsed ? 0 : undefined }}
      >
        {currentSidebarNode ? (
          <ComponentDetails />
        ) : (
          <div>
            <div className='look-and-feel'>
              <h2>LOOK AND FEEL</h2>
              {this.getStyleView()}
            </div>
            <div className='components-and-datasets'>
              <h2>COMPONENTS AND DATASETS</h2>
              <ComponentView />
              <DatasetView />
            </div>
            <VariableView />
            <div className='publish-view'>
              <h2>DEPLOYMENT</h2>
              <Deployment />
            </div>

            <div
              className='sidebar-collapse'
              onClick={this.handleToggle.bind(this)}
            >
              Collapse
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Sidebar;
