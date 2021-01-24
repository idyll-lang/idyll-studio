import React from 'react';
import ReactDataGrid from 'react-data-grid';
import { DragSource } from 'react-dnd';
import { withContext } from '../../context/with-context';
import Context from '../../context/context';
import {
  stringify,
  getRandomId,
  getNodeById,
  numberfy,
  formatVariable,
  getTextContainerIndex,
  readFile
} from '../utils';

const TYPE_OPTIONS = [
    {id: 'var', value: 'var'},
    {id: 'data', value: 'data'},
    {id: 'derived', value: 'derived'}
];

const ALLOWED_TYPES = TYPE_OPTIONS.map((type) => type.id);

const VariableViewV2 = withContext(
  class VariableView extends React.PureComponent {
    static contextType = Context;

    constructor(props) {
      super(props);

      this.state = {
        rows: [],
        error: null
      };

      this.addVariable = this.addVariable.bind(this);
      this.getRows = this.getRows.bind(this);
      this.handleGridUpdate = this.handleGridUpdate.bind(this);
    }

    componentDidMount() {
      this.getRows();
    }

    componentDidUpdate(prevProps) {
      if (
        prevProps.context.ast.children.length !==
        this.props.context.ast.children.length
      ) {
        this.getRows();
      }
    }

    addVariable() {
      const nameId = this.props.context.ast.children.length + 2;
      const nameOfVar = `var${nameId}`;

      const nodeId = getRandomId();

      const newVarNode = {
        id: nodeId,
        type: 'var',
        properties: {
          name: {
            type: 'value',
            value: nameOfVar
          },
          value: {
            type: 'value',
            value: 0
          }
        }
      };

      const ast = JSON.parse(JSON.stringify(this.props.context.ast));

      const currentNodeIndex = getTextContainerIndex(ast);
      ast.children.splice(currentNodeIndex, 0, newVarNode);

      this.props.context.setAst(ast);
      this.props.context.context.update({ [nameOfVar]: 0 });
    }

    getRows() {
      const currentChildren = this.props.context.ast.children;
      const currentData = this.props.context.context.data();

      const rowsCopy = [];
      currentChildren.map(child => {
        if (ALLOWED_TYPES.includes(child.type)) {
          const childData = this.handleChild(child, currentData);
          if (childData) {
            rowsCopy.push(childData);
          }
        }
      });

      this.setState({ rows: rowsCopy });
    }

    handleChild(child, currentData) {
      const properties = child.properties;
      const name = properties.name.value;

      let initialValue;
      let currentValue;

      if (child.type === 'var' || child.type === 'derived') {
        initialValue = properties.value.value;
        currentValue = currentData[name];
      } else {
        initialValue = this.readDatasetFile(properties);

        if (initialValue) {
            currentValue = this.getCurrentDatasetValue(initialValue, currentData, name);
        } else {
            return null;
        }
      }

      return {
        type: child.type,
        name: name,
        initialValue: stringify(formatVariable(initialValue)),
        currentValue: stringify(formatVariable(currentValue)),
        id: child.id
      };
    }

    getCurrentDatasetValue(initialValue, currentData, name) {
        let currentValue;
        if(!currentData[name]) {
            currentValue = initialValue;
            this.props.context.context.update({
              [name]: formatVariable(currentValue)
            });
        } else {
            currentValue = currentData[name];
        }

        return currentValue;
    }

    readDatasetFile(properties) {
      const { content, error } = readFile(properties.source.value);

      if (error) {
        this.setState({ error: error });
        return null;
      }

      return content;
    }

    handleGridUpdate(update) {
      if (update.action === 'CELL_UPDATE') {
        Object.keys(update.updated).forEach(key => {
          const newValue = formatVariable(numberfy(update.updated[key]));
            
          switch(key) {
              case 'currentValue':
                  this.handleCurrentValueUpdate(update, newValue);
                  break;
              case 'name':
                  this.handleNameUpdate(update, newValue);
                  break;
              case 'initialValue':
                  this.handleNodeUpdate(update, newValue, 'value');
                  break;
              case 'type':
                  this.handleTypeUpdate(update, newValue);
                  break;
          }
        });
        this.getRows();
      }
    }

    handleCurrentValueUpdate(update, newValue) {
        this.props.context.context.update({
            [update.fromRowData.name]: newValue
        });
    }

    handleNameUpdate(update, newValue) {
        this.handleNodeUpdate(update, newValue, 'name');

        // delete old variable name TODO: from ast as well
        const contextDataCopy = this.props.context.context.data();
        contextDataCopy[newValue] = contextDataCopy[update.fromRowData.name];

        console.log(update.fromRowData.name);
        delete contextDataCopy[update.fromRowData.name];
        this.props.context.context.update(contextDataCopy)
    }

    handleNodeUpdate(update, newValue, propertyName) {
        const { ast } = this.props.context;
        const node = getNodeById(ast, update.fromRowId);
        node.properties[propertyName].value = newValue;

        this.props.context.setAst(ast);
    }

    handleTypeUpdate(update, newValue) {
        if((update.fromRowData.type === 'var' || 
            update.fromRowData.type === 'derived') && newValue !== 'data') {
            const { ast } = this.props.context;
            const node = getNodeById(ast, update.fromRowId);
            const typeOfValue = newValue === 'var' ? 'value' : 'expression';

            if(ALLOWED_TYPES.includes(newValue)) {
                node.type = newValue;
                node.properties.value.type = typeOfValue;
                this.props.context.setAst(ast);
            }
        }
    }

    render() {
      const { error, rows } = this.state;
      const columns = [
        { key: 'type', name: 'Type', editable: row => row.type !== 'data' },
        {
          key: 'name',
          name: 'Name',
          editable: true,
          formatter: DraggableFormatter
        },
        // make some way so not editable but viewable
        {
          key: 'initialValue',
          name: 'Initial value',
          editable: row => row.type !== 'data'
        },
        { key: 'currentValue', name: 'Current value', editable: true }
      ];

      console.log(this.props.context.context.data(), this.props.context.ast);
      return (
        <div className='variables-view'>
          <div className='variables-table-view'>
            <ReactDataGrid
              columns={columns}
              rowGetter={i => rows[i]}
              rowsCount={rows.length}
              enableCellSelect={true}
              onGridRowsUpdated={this.handleGridUpdate}
            />
          </div>
          <div className='add-variable-button'>
            <button onClick={this.addVariable}>Add variable</button>
          </div>
          {error ? <div>{error}</div> : <></>}
        </div>
      );
    }
  }
);

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

export default VariableViewV2;
