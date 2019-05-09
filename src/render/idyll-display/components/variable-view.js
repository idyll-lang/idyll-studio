import React from 'react';
import VariableForm from './variable-form';
import Context from '../../context';
import IdyllAST from 'idyll-ast';

 class VariableView extends React.PureComponent {
  static contextType = Context;

  constructor(props) {
    super(props);
    this.addVariable = this.addVariable.bind(this);
    this.getVariableTable = this.getVariableTable.bind(this);
  }

  addVariable(ast) {
    const newID = this.context.ast.children.length + 2;
    const nameOfVar = 'alansVar' + newID;
    const valueOfVar = newID;
    const newVarNode = {
      id: newID,
      type: 'var',
      properties: {
        name: {
          type: 'value',
          value: nameOfVar
        },
        value: {
          type: 'value',
          value: valueOfVar
        }
      }
    };
    const updatedAST = IdyllAST.appendNode(ast, newVarNode);
    this.context.setAst(updatedAST);
  }

  getVariableTable(ast) {
    const currentChildren = ast.children;
    const variableInfoRows = currentChildren.map((child) => {
      const childType = child.type;
      if (childType === 'var' || childType === 'data') { // allow for derivedVar types too
        const properties = child.properties;
        const varName = properties.name.value;
        const varValue = childType === 'var' ? properties.value.value : properties.source.value;
        const initialValue = 'TODO';
        return (
          <tr key={JSON.stringify(varName)} className='variables-table-row'>
            <td>{childType}</td>
            <td>{varName}</td>
            <td>{initialValue}</td>
            <td>{varValue}</td>
          </tr>
        );
      }
    });
    return (
        <table>
          <tbody>
            <tr>
              <th>Type</th>
              <th>Name</th>
              <th>Initial value</th>
              <th>Current value</th>
            </tr>
            {variableInfoRows}
          </tbody>
        </table>
    );
  }

   // Returns a list of all variables in the AST
  render() {
    const variablesTable = this.getVariableTable(this.context.ast);
    return (
      <div className='variables-view'>
        <h2>Variable Views below!</h2>
        <div className='variables-table-view'>
          {variablesTable}
        </div>
        <div className='add-variable-button'>
          <button onClick={() => this.addVariable(this.context.ast)}>Add variable</button>
        </div>
      </div>
    )
  }
}

 export default VariableView;