import React from 'react';
import VariableForm from './variable-form';

 class VariableView extends React.PureComponent {
  constructor(props) {
    super(props);
  }

   // Returns a list of all variables in the AST
  render() {
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
    return (
      <div className='variables-view'>
        <h2>Variable Views below!</h2>
        {variables}
      </div>
    )
  }
}

 export default VariableView;