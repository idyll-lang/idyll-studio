import React from 'react';
import IdyllAST from 'idyll-ast';

class Sidebar extends React.PureComponent {
  constructor(props) {
    super(props);
    this.modifyAST = this.modifyAST.bind(this);
  }

  modifyAST() {
    const currentAST = this.props.ast;
    const h2Nodes = IdyllAST.modifyNodesByName(currentAST, 'h2',
      (node) => {
        node.children[0].value = 'alan took over';
        return node;
    });
    this.props.handleASTChange({...h2Nodes});
    debugger;
  }

  // Returns a list of all variables made in this ast
  getAllVariables() {
    const currentChildren = this.props.ast.children;
    const variables = [];
    for (var i = 0; i < currentChildren.length - 1; i++) {
      const variable = currentChildren[i].properties.name.value;
      variables.push(
        <li>{variable}</li>
      );
    }
    return variables;
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
