import React from 'react';
import IdyllAST from 'idyll-ast';

class Sidebar extends React.PureComponent {
  constructor(props) {
    super(props);
    this.modifyAST = this.modifyAST.bind(this);
  }

  modifyAST() {
    const { ast, handleASTChange } = this.props;
    console.log('printing ast in sidebar');
    console.log(ast);
    handleASTChange(ast);
  }  

  render() {
    if (this.props.ast) {
      console.log('ast in sidebar');
    } else {
      console.log('ast not defined in sidebar');
    }
    return (
      <div>
        <button onClick={this.modifyAST}>
          Change the ast!
        </button>
      </div>
    );
  }
}

export default Sidebar;
