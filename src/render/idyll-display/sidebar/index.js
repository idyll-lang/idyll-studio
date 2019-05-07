import React from 'react';
import AST from 'idyll-ast';
import ComponentView from '../components/component-view.js';
import DatasetView from '../components/dataset-view.js';
import VariableView from '../components/variable-view';

import * as layouts from 'idyll-layouts';
import * as themes from 'idyll-themes';

console.log(layouts, themes);

class Sidebar extends React.PureComponent {
  constructor(props) {
    super(props);
    this.modifyAST = this.modifyAST.bind(this);
    this.assignNewVarValue = this.assignNewVarValue.bind(this);

    this.state = {
      collapsed: false
    };
  }

  handleThemeChange(event) {
    this.props.updateTheme(event.target.value);
  }
  handleLayoutChange(event) {
    this.props.updateLayout(event.target.value);
  }

  getStyleView() {
    return (
      <div>
        <div>
          Theme: <select onChange={this.handleThemeChange.bind(this)} value={this.props.theme}>{Object.keys(themes).map(themeName => {
            return <option value={themeName}>{themeName}</option>
          })}</select>
        </div>
        <div>
          Layout: <select onChange={this.handleLayoutChange.bind(this)} value={this.props.layout}>{Object.keys(layouts).map(layoutName => {
            return <option value={layoutName}>{layoutName}</option>
          })}</select>
        </div>
      </div>
    )
  }

  handleToggle() {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  modifyAST() {
    const currentAST = this.props.ast;
    const h2Nodes = AST.modifyNodesByName(currentAST, 'h2',
      (node) => {
        node.children[0].value = 'alan took over';
        return node;
    });
    this.props.handleASTChange({...h2Nodes});
  }

  // Returns a list of all variables made in this ast
  getAllVariables() {
    return AST.getNodesByType(this.props.ast, 'var').map((variable) => {
      const props = variable.properties;
      const name = props.name.value;
      const value = props.value.value;
      return (
        <div className='variables-view' key={name}>
          <li key={variable}>{name}, whose current value is {value}</li>
          <VariableForm handleASTChange={this.props.handleASTChange} node={variable} ast={this.props.ast} />
        </div>
      )
    });
  }

  // Returning list of each prop of this component
  getComponentInfo(ASTNode) {
    console.log(ASTNode);
    const properties = [];
    for (let property in ASTNode.properties) {
      properties.push(
        <li key={property}>
          {/* TODO Handling if the current value is a variable */}
          {property}, current value is {ASTNode.properties[property].value}
        </li>
      );
    }
    return (
      <div>
        <a onClick={() => this.props.updateNode(null)}>← Back</a>
        <p>
          This is a {ASTNode.name} component.
          Its properties are below
        </p>
        <ul>
          {properties}
        </ul>
      </div>
    );
  }

  assignNewVarValue(node) {
    node.properties.value.value = 20;
    this.props.handleASTChange({...this.props.ast});
  }

  render() {
    if (!this.props.ast) {
      return (
        <div>
          <h1>Sidebar View (Please load an Idyll project)</h1>
        </div>
      );
    }
    if (this.props.currentSidebarNode) {
      return (
        <div>
          <h3>Below is the current one</h3>
          {this.getComponentInfo(this.props.currentSidebarNode)}
        </div>
      );
    }

    const {
      components,
      propsMap,
      datasets,
      maxNodeId,
      handleASTChange,
      ast,
      updateMaxId
    } = this.props;
    return (
      <div className='sidebar-information' style={{width: this.state.collapsed ? 0 : undefined}}>
        <div className='look-and-feel'>
          <h2>LOOK AND FEEL</h2>
          {this.getStyleView()}
        </div>
        <div className='components-and-datasets'>
          <h2>COMPONENTS AND DATASETS</h2>
          <ComponentView
              components={components}
              ast={ast}
              handleASTChange={handleASTChange}
              propsMap={propsMap}
              maxNodeId={maxNodeId}
              updateMaxId={updateMaxId}
          />
          <DatasetView
            datasets={datasets}
            ast={ast}
            handleASTChange={handleASTChange}
            maxNodeId={maxNodeId}
            updateMaxId={updateMaxId}
          />
        </div>
        <VariableView
          ast={ast}
          handleASTChange={handleASTChange}
        />
        <div className='publish-view'>
          <h2>DEPLOYMENT</h2>
        </div>

        <div className="sidebar-collapse" onClick={this.handleToggle.bind(this)}>
          Collapse
        </div>
      </div>
    );
  }
}

export default Sidebar;
