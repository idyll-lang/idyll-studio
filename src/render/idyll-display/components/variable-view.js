import React from 'react';
import ReactDataGrid from 'react-data-grid';
import Context from '../../context';
import IdyllAST from 'idyll-ast';

 class VariableView extends React.PureComponent {
  static contextType = Context;
  static columns = [
    { key: 'type', name: "Type", editable: true },
    { key: 'name', name: "Name", editable: true },
    { key: 'initialValue', name: "Initial value", editable: true },
    { key: 'currentValue', name: "Current value", editable: true }
  ];

  constructor(props) {
    super(props);
    this.addVariable = this.addVariable.bind(this);
    this.getVariableTable = this.getVariableTable.bind(this);
    this.getRows = this.getRows.bind(this);
    this.state = ({
      rows: []
    });
  }

  componentDidMount() {
    this.getRows(this.context.ast);
  }

  addVariable(ast) {
    const newID = this.context.ast.children.length + 2;
    const nameOfVar = 'var' + newID;
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

  getRows(ast) {
    const rows = [];
    const currentChildren = ast.children;
    currentChildren.map((child) => {
      const childType = child.type;
      if (childType === 'var' || childType === 'data') { // allow for derivedVar types too
        const properties = child.properties;
        const varName = properties.name.value;
        const varValue = childType === 'var' ? properties.value.value : properties.source.value;
        const initialValue = 'TODO';
        rows.push({
          type: childType,
          name: varName,
          initialValue: initialValue,
          currentValue: varValue
        });
      }
    });
    this.setState({rows: rows});
  }

   // Returns a list of all variables in the AST
  render() {
    //const variablesTable = this.getVariableTable(this.context.ast);
    const columns = [
      { key: 'type', name: "Type", editable: true },
      { key: 'name', name: "Name", editable: true },
      { key: 'initialValue', name: "Initial value", editable: true },
      { key: 'currentValue', name: "Current value", editable: true }
    ];
    return (
      <div className='variables-view'>
        <h2>Variable Views below!</h2>
        <div className='variables-table-view'>
          <ReactDataGrid
            columns={columns}
            rowGetter={i => this.state.rows[i]}
            rowsCount={this.state.rows.length}
            enableCellSelect={true}
          />
        </div>
        <div className='add-variable-button'>
          <button onClick={() => this.addVariable(this.context.ast)}>Add variable</button>
        </div>
      </div>
    )
  }
}

 export default VariableView;