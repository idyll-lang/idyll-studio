import React from 'react';


class Sidebar extends React.PureComponent {
  constructor(props) {
    super(props);
    this.modifyAST = this.modifyAST.bind(this);
  }

  modifyAST() {
    const currentAST = this.props.ast;
    console.log('printing ast in sidebar');
    console.log(currentAST);
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
