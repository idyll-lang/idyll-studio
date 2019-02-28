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
  }  

  render() {
    if (this.props.ast) {
      console.log('ast in sidebar');
    } else {
      console.log('ast not defined in sidebar');
    }
    return (
      <div>
        <h1>Sidebar View</h1>
        <button onClick={this.modifyAST}>
          Change the ast!
        </button>
      </div>
    );
  }
}

export default Sidebar;
