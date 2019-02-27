import React from 'react';
import IdyllAST from 'idyll-ast';

class Sidebar extends React.PureComponent {
  constructor(props) {
    super(props);
    this.modifyAST = this.modifyAST.bind(this);
  }

  modifyAST() {
    const currentAST = this.props.ast;
    //const text = IdyllAST.getText(currentAST);
    //console.log('printing text');
    //console.log(text);
    currentAST.children[0].children[1].children[0].value = "alan took over";
    this.props.handleASTChange({...currentAST});
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
