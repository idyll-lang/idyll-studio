import React from 'react';
import IdyllAST from 'idyll-ast';

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
          <button onClick={() => this.assignNewVarValue(variable)}>click to change value to 20</button>
        </div>
      );
      // Note -- why need to pass in function to onClick despite already binding?
    }
    return variables;
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
    return (
      <div>
        <h1>Sidebar View</h1>
        <button onClick={this.modifyAST}>
          Change the ast!
        </button>
        {this.getAllVariables()}
      </div>
    );
  }
}

export default Sidebar;
