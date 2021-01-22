import React from 'react';
import ReactDataGrid from 'react-data-grid';
import IdyllAST from 'idyll-ast';
import fs from 'fs';
import { DragSource } from 'react-dnd';
import { withContext } from '../../context/with-context';
import { stringify, getRandomId, getNodeById, numberfy, formatVariableValue } from '../utils';

const ALLOWED_TYPES = ['var', 'data', 'derived'];

export const VariableViewV2 = withContext(
    class VariableView extends React.PureComponent {    
        constructor(props) {
            super(props);
    
            this.state = {
                rows: [],
                error: null
            }
    
            this.addVariable = this.addVariable.bind(this);
            this.getRows = this.getRows.bind(this);
            this.handleGridUpdate = this.handleGridUpdate.bind(this);
        }
    
        componentDidMount() {
            this.getRows();
        }

        componentDidUpdate(prevProps) {
            if(prevProps.context.ast.children.length !== 
                this.props.context.ast.children.length) {
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
                        value: "Initial value"
                    }
                }
            };
    
            const updatedAst = IdyllAST.appendNode(this.props.context.ast, newVarNode);
            this.props.context.setAst(updatedAst);
        }
    
        getRows() {
            const currentChildren = this.props.context.ast.children;
            const currentData = this.props.context.context.data();
    
            const rowsCopy = [];
            currentChildren.map(child => {
                if(ALLOWED_TYPES.includes(child.type)) {
                    const childData = this.handleChild(child, currentData);
                    if(childData) {
                        rowsCopy.push(childData);
                    }
                }
            })
    
            this.setState({ rows: rowsCopy });
        }
    
        handleChild(child, currentData) {
            const properties = child.properties;
            const name = properties.name.value;
            
            let propertyType;
            let initialValue;
            let currentValue;

            if(child.type === 'var' || child.type === 'derived') {
                initialValue = properties.value.value;
                currentValue = currentData[name];
                propertyType = properties.value.type;
            } else {
                initialValue = this.readDatasetFile(properties);
                this.props.context.context.update({ [name]: initialValue})
                propertyType = 'expression';
                // currentValue should be in the context
                if(initialValue) {
                    currentValue = initialValue;
                } else {
                    return null;
                }
            }
    
            return {
                type: child.type,
                name: name,
                initialValue: stringify(formatVariableValue(initialValue, propertyType)),
                currentValue: stringify(formatVariableValue(currentValue, propertyType)),
                id: child.id
            };
        }
    
        readDatasetFile(properties) {
            try {
                const data = fs.readFileSync(properties.source.value, 'utf8');
                return data;
            } catch(err) {
                console.error(err);
                this.setState({error: err});
                return null;
            }
        }
    
        handleGridUpdate(update) {
            if(update.action === 'CELL_UPDATE') {
                Object.keys(update.updated).forEach(key => {
                    const newValue = numberfy(update.updated[key]);
    
                    if(key === 'currentValue') {
                        this.props.context.context.update({ [update.fromRowData.name]: newValue })
                    } else {
                        const node = getNodeById(this.props.context.ast, update.fromRowId);
                        const nodeProperty = key === 'name' ? key : 'value';
                        node.properties[nodeProperty].value = newValue;
    
                        this.props.context.setAst(this.props.context.ast);
                    }
                })

                this.getRows();
            }
        }
    
        handleInitialValueUpdate(node) {
    
        }
    
        render() {
            const { error, rows } = this.state;
            console.log(this.props.context.ast);
            const columns = [
                { key: 'type', name: 'Type', editable: true },
                {
                  key: 'name',
                  name: 'Name',
                  editable: true,
                  formatter: DraggableFormatter
                },
                // make some way so not editable but viewable
                { key: 'initialValue', name: 'Initial value', editable: (row) => row.type !== 'data' },
                { key: 'currentValue', name: 'Current value', editable: true }
              ];
    
            return (
                <div className='variables-view'>
                    <div className='variables-table-view'>
                        <ReactDataGrid
                            columns={columns}
                            rowGetter={i => rows[i] }
                            rowsCount={rows.length}
                            enableCellSelect={true}
                            onGridRowsUpdated={this.handleGridUpdate}
                        />
                    </div>
                    <div className='add-variable-button'>
                        <button onClick={this.addVariable}>
                            Add variable
                        </button>
                    </div>
                    {error ? <div>{error}</div> : <></>}
                </div>
            )
        }
    }
)

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
