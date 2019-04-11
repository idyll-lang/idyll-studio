import React from 'react';
import IdyllAST from 'idyll-ast';
import VariableForm from './components/variable-form';

class Sidebar extends React.PureComponent {
  constructor(props) {
    super(props);
    this.modifyAST = this.modifyAST.bind(this);
    this.assignNewVarValue = this.assignNewVarValue.bind(this);
  }

  modifyAST() {
    const currentAST = this.props.ast;
    const h2Nodes = IdyllAST.modifyNodesByName(currentAST, 'h2',
      (node) => {
        node.children[0].value = 'alan took over';
        return node;
    });
    this.props.handleASTChange({...h2Nodes});
  }

  // Returns a list of all variables made in this ast
  getAllVariables() {
    //console.log(this.props.ast);
    const currentChildren = this.props.ast.children;
    const variables = [];
    for (var i = 0; i < currentChildren.length - 1; i++) {
      const variable = currentChildren[i];
      const varProperties = variable.properties;
      const varName = varProperties.name.value;
      const varValue = varProperties.value.value;
      variables.push(
        <div className='variables-view' key={varName}>
          <li key={variable}>{varName}, whose current value is {varValue}</li>
          <VariableForm handleASTChange={this.props.handleASTChange} node={variable} ast={this.props.ast} />
        </div>
      );
    }
    return variables;
  }

  // Returns list of components in ast -- doesn't distinguish further
  // for components not separated by inline
  // i.e. the .idyll markup needs to have blank lines between certain
  // components
  getAllComponents() {
    const components = [];
    const currentChildren = this.props.ast.children;
    const componentNodes = currentChildren[currentChildren.length - 1];
    const nodesChildren = componentNodes.children;
    for (var i = 0; i < nodesChildren.length; i++) {
      const currentChild = nodesChildren[i];
      // only try non-text components for now
      if (currentChild.name !== 'p') {
        components.push(
          <li key={i}>{currentChild.name}</li>
        );
      }
    }
    return (
      <div className='list-components-view'>
        <ul>{components}</ul>
      </div>
    );
  }

  // Returning list of each prop of this component
  getComponentInfo(ASTNode) {
    console.log(ASTNode);
    const properties = [];
    debugger;
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
          <h1>Sidebar View (Please load an Idyll project</h1>
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
    return (
      <div>
        <h1>Sidebar View</h1>
        <button onClick={this.modifyAST}>
          Change the ast!
        </button>
        {/* {this.getAllVariables()} */}
        {this.getAllComponents()}
      </div>
    );
  }
}

export default Sidebar;
