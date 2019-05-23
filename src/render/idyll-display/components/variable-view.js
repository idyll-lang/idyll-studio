import React from 'react';
import ReactDataGrid from 'react-data-grid';
import Context from '../../context';
import IdyllAST from 'idyll-ast';
import VariableForm from './variable-form';

const columns = [
  { key: 'type', name: "Type", editable: true },
  { key: 'name', name: "Name", editable: true },
  { key: 'initialValue', name: "Initial value", editable: true },
  { key: 'currentValue', name: "Current value", editable: true }
];

 class VariableView extends React.PureComponent {
  static contextType = Context;

  constructor(props) {
    super(props);
    this.addVariable = this.addVariable.bind(this);
    this.getRows = this.getRows.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.addVariable = this.addVariable.bind(this);
    this.state = ({
      rows: [],
      contextUpdates: 0
    });
  }

  componentDidMount() {
    // TODO - ensure that there isn't a problem registering multiple listeners.
    this.context.context.onUpdate(() => {
      this.setState({ contextUpdates: this.state.contextUpdates + 1 });
    });
  }

  handleChange(e) {
    e.preventDefault();
    this.setState({ [e.target.name] : e.target.value }); // hmm won't work if variable is called rows or contextUpdates
  }

  addVariable(event) {
    event.preventDefault();
    console.log(this.state.name);
    console.log(this.state.initialValue);
    const newID = this.context.ast.children.length + 2;
    const newVarNode = {
      id: newID,
      type: 'var',
      properties: {
        name: {
          type: 'value',
          value: this.state.name
        },
        value: {
          type: 'value',
          value: this.state.initialValue
        }
      }
    };
    const updatedAST = IdyllAST.appendNode(this.context.ast, newVarNode);
    this.context.setAst(updatedAST);
  }

  getRows() {
    const rows = [];
    const currentChildren = this.context.ast.children;
    const currentData = this.context.context.data();
    this._rowsToVars = [];
    currentChildren.map((child) => {
      const childType = child.type;
      if (childType === 'var' || childType === 'data') { // allow for derivedVar types too
        const properties = child.properties;
        const varName = properties.name.value;
        const varValue = currentData[varName];
        const initialValue = childType === 'var' ? properties.value.value : properties.source.value;
        rows.push({
          type: childType,
          name: varName,
          initialValue: initialValue,
          currentValue: varValue
        });
        this._rowsToVars.push(child);
      }
    });
    return rows;
  }

  handleGridUpdated(update) {
    if (update.action === 'CELL_UPDATE') {
      Object.keys(update.updated).forEach((key) => {
        const val = update.updated[key];
        switch(key) {
          case 'currentValue':
            this.context.context.update({ [update.fromRowData.name]: val });
            break;
          case 'initialValue':
            this._rowsToVars[update.fromRow].properties.value.value = val;
            break;
          case 'name':
            this._rowsToVars[update.fromRow].properties.name.value = val;
            break;
        }
      });

    }

    this.context.setAst(this.context.ast);
  }

   // Returns a list of all variables in the AST
  render() {
    const rows = this.getRows();
    //const variablesTable = this.getVariableTable(this.context.ast);
    return (
      <div className='variables-view'>
        <div className='variables-table-view'>
          <ReactDataGrid
            columns={columns}
            rowGetter={i => rows[i]}
            rowsCount={rows.length}
            enableCellSelect={true}
            onGridRowsUpdated={this.handleGridUpdated.bind(this)}
          />
        </div>
        <div>
          <form onSubmit={this.addVariable}>
            <label>
              New var name:
              <input type="text" name="name" value={this.state.value} onChange={this.handleChange} />
            </label>
            <label>
              New var initial value:
              <input type="text" name="initialValue" value={this.state.value} onChange={this.handleChange} />
            </label>
            <button type="submit">Add new variable!</button>
          </form>
        </div>
      </div>
    )
  }
}

 export default VariableView;