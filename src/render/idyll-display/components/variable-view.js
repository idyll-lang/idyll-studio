import React from 'react';
import VariableForm from './variable-form';

 class VariableView extends React.PureComponent {
  constructor(props) {
    super(props);
    this.getVariableTable = this.getVariableTable.bind(this);
  }

  getVariableTable(ast) {
    const currentChildren = ast.children;
    const variableInfoRows = currentChildren.map((child) => {
      const childType = child.type;
      if (childType !== 'component') { // allow for derivedVar types too
        const properties = child.properties;
        const varName = properties.name.value;
        const varValue = properties.value.value;
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
    const variablesTable = this.getVariableTable(this.props.ast);
    return (
      <div className='variables-view'>
        <h2>Variable Views below!</h2>
        {variablesTable}
      </div>
    )
  }
}

 export default VariableView;