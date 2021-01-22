import React from 'react';
import ReactDataGrid from 'react-data-grid';
import Context from '../../context/context';
import IdyllAST from 'idyll-ast';
import fs from 'fs';
import { DragSource } from 'react-dnd';
import { stringify } from '../utils';

class VariableFormatter extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const { value, isDragging, dragSource } = this.props;
    return dragSource(
      <div style={{ opacity: isDragging ? 0.5 : 1 }}>{value}</div>
    );
  }
}

/**
 * Implement the drag source contract.
 */
const variableSource = {
  beginDrag: props => ({ name: props.value })
};

function variableCollect(connect, monitor) {
  return {
    dragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

const DraggableFormatter = DragSource(
  'VARIABLE',
  variableSource,
  variableCollect
)(VariableFormatter);

class VariableView extends React.PureComponent {
  static contextType = Context;

  constructor(props) {
    super(props);
    this.addVariable = this.addVariable.bind(this);
    this.getRows = this.getRows.bind(this);
    this.state = {
      rows: [],
      contextUpdates: 0
    };
  }

  componentDidMount() {
    // TODO - ensure that there isn't a problem registering multiple listeners.
    this.context.context.onUpdate(() => {
      this.setState({ contextUpdates: this.state.contextUpdates + 1 });
    });
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

  getRows() {
    const rows = [];
    const currentChildren = this.context.ast.children;
    const currentData = this.context.context.data();
    this._rowsToVars = [];
    currentChildren.map(child => {
      const childType = child.type;
      if (childType === 'var' || childType === 'data') {
        // allow for derivedVar types too
        const properties = child.properties;
        const varName = properties.name.value;
        let varValue;
        let initialValue;
        if(childType === 'data') {
          initialValue =  this.readDatasetFile(properties);
          varValue = initialValue;
        } else {
          initialValue = properties.value.value;

          // current value updates should propagate to ast
          varValue = currentData[varName];
        }
        
        rows.push({
          type: childType,
          name: varName,
          initialValue: stringify(initialValue),
          currentValue: stringify(varValue)
        });
        this._rowsToVars.push(child);
      }
    });
    return rows;
  }

  readDatasetFile(properties) {
    try {
      const data = fs.readFileSync(properties.source.value, 'utf8');
      return data;
    } catch(err) {
      console.error(err);
      return null;
    }
  }

  handleGridUpdated(update) {
    if (update.action === 'CELL_UPDATE') {
      Object.keys(update.updated).forEach(key => {
        const val = update.updated[key];
        switch (key) {
          case 'currentValue':
            // TODO: update ast
            this.context.context.update({ [update.fromRowData.name]: val });
            break;
          case 'initialValue':
            // should changing data initial value change the file itself?
            // or null this out and only be able to change current value
            if(this._rowsToVars[update.fromRow].type !== 'data') {
              this._rowsToVars[update.fromRow].properties.value.value = val;
            }
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
    const columns = [
      { key: 'type', name: 'Type', editable: true },
      {
        key: 'name',
        name: 'Name',
        editable: true,
        formatter: DraggableFormatter
      },
      // make some way so not editable but viewable
      { key: 'initialValue', name: 'Initial value', editable: false },
      { key: 'currentValue', name: 'Current value', editable: true }
    ];

    console.log(this.context.ast);
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
        <div className='add-variable-button'>
          <button onClick={() => this.addVariable(this.context.ast)}>
            Add variable
          </button>
        </div>
      </div>
    );
  }
}

export default VariableView;
