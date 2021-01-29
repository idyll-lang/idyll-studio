import React from 'react';
import { DropTarget } from 'react-dnd';
import { updateNodeById } from '../../utils';
import { stringify, numberfy } from '../../utils';

class Component extends React.PureComponent {
  constructor(props) {
    super(props);

    this._inputRef = React.createRef();
  }

  componentDidMount() {
    const { propertyObject } = this.props;

    const input = this._inputRef.current;
    input.value = propertyObject.value;
  }

  handleUpdateValue = () => {
    const propertyName = this.props.name;

    const value = numberfy(this._inputRef.current.value);

    this.props.updateProperty(propertyName, value);
  };

  getBackgroundColor(propertyType) {
    switch (propertyType) {
      case 'expression':
        return '#B8E986';
      case 'variable':
        return '#50E3C2';
      case 'value':
        return '#4A90E2';
    }
  }
  getColor(propertyType) {
    switch (propertyType) {
      case 'expression':
        return '#222';
      case 'variable':
        return '#222';
      case 'value':
        return '#fff';
    }
  }

  /**
   * Updates the prop type
   * @param {string} propertyName the prop name
   * @param {string} type the next type of the prop
   */
  updateNodeType(propertyName, type) {
    return e => {
      this.props.updateNodeType(propertyName, type);
    };
  }

  /**
   * Renders an input for the corresponding
   * prop name
   * @param {string} key the prop name
   * @param {string} prop the prop value
   * @param {string} nextType the next prop type
   */
  renderPropInput(key, propertyObject, nextType) {
    return (
      <div>
          <input
            className={'prop-input'}
            style={{ fontFamily: 'monospace' }}
            type='text'
            ref={this._inputRef}
            onChange={this.handleUpdateValue}
          />
      </div>
    );
  }

  renderProp(key, propertyObject) {
    switch (propertyObject.type) {
      case 'variable':
        return this.renderPropInput(key, propertyObject, 'value');
      case 'value':
        return this.renderPropInput(key, propertyObject, 'expression');
      case 'expression':
        return this.renderPropInput(key, propertyObject, 'variable');
    }
  }

  render() {
    const { name, propertyObject, isOver, dropTarget, variableData } = this.props;
    const  nextProps = {
      variable: 'value',
      value: 'expression',
      expression: 'variable',
    }
    let ret;
    ret = (
      <div
        style={{
          marginLeft: 0,
          border: isOver ? 'solid 2px green' : undefined,
          width: '100%',
          marginBottom: '1em'
        }}>
        <div style={{display:'flex'}}>
          <div className='prop-name'>{name}</div>
          <div
            className={'prop-type'}
            onClick={this.updateNodeType(name, nextProps[propertyObject.type])}
            style={{
              color: this.getBackgroundColor(propertyObject.type)
            }}>
            {propertyObject.type === 'value'
              ? typeof propertyObject.value
              : propertyObject.type}
          </div>
          {propertyObject.type === 'variable' ? (
              <div className='current-value' style={{maxWidth: 100, fontSize: 12, fontFamily: 'monospace', xoverflowX: 'auto', marginLeft: 8, whiteSpace: 'nowrap', textOverflow:'ellipsis' }}>
                {stringify(variableData[propertyObject.value])}
              </div>
            ) : (
              <></>
            )}
        </div>
        <div style={{width: '100%'}}>{this.renderProp(name, propertyObject)}</div>
      </div>
    );
    return dropTarget(ret);
  }
}

const variableTarget = {
  drop(props, monitor, component) {
    const name = monitor.getItem().name;
    const node = props.node;
    updateNodeById(props.ast, node.id, {
      properties: { [props.name]: { value: name, type: 'variable' } }
    });
    props.setAst(props.ast);
  }
};

function collect(connect, monitor) {
  return {
    dropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
}

export default DropTarget('VARIABLE', variableTarget, collect)(Component);
export { Component as Property };
