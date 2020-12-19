import React from 'react';
import { DropTarget } from 'react-dnd';
import { updateNodeById } from '../utils';

class Component extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handleUpdateValue = this.handleUpdateValue.bind(this);
    this.cursor = null;
  }

  /**
   * Returns a function that gets the input value
   * and notifies the parent of a prop value change
   * @param {string} propName the name of prop being updated
   */
  handleUpdateValue(propName) {
    return (e) => {
      let val = e.target.value;
      if (val.trim() !== '') {
        val = Number(e.target.value);
      }
      if (isNaN(val)) {
        val = e.target.value;
      }

      this.props.updateProperty(propName, val, e);
    };
  }

  handleUpdateValueV2 = (e) => {
    const propName = this.props.name;

    let val = e.target.value;
    if (val.trim() !== '') {
      val = Number(e.target.value);
    }
    if (isNaN(val)) {
      val = e.target.value;
    }

    this.props.updateProperty(propName, val, e);
  };

  getBackgroundColor(propType) {
    switch (propType) {
      case 'expression':
        return '#B8E986';
      case 'variable':
        return '#50E3C2';
      case 'value':
        return '#4A90E2';
    }
  }
  getColor(propType) {
    switch (propType) {
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
   * @param {string} propName the prop name
   * @param {string} type the next type of the prop
   */
  updateNodeType(propName, type) {
    return (e) => {
      this.props.updateNodeType(propName, type);
    };
  }

  onFocus = (e) => {
    e.target.selectionStart = this.props.cursorPosition;
    e.target.selectionEnd = this.props.cursorPosition;
    this.props.onPropFocus(
      this.props.name,
      e.target.value,
      e.target.selectionStart
    );
  };

  /**
   * Renders an input for the corresponding
   * prop name
   * @param {string} key the prop name
   * @param {string} prop the prop value
   * @param {string} nextType the next prop type
   */
  renderPropInput(key, prop, nextType) {
    const isActiveProp = this.props.activePropName === key;
    const inputValue = prop.value;

    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
          <div
            className={'prop-type'}
            onClick={this.updateNodeType(key, nextType)}
            style={{
              marginLeft: 0,
              // borderRadius: '0 20px 20px 0',
              background: this.getBackgroundColor(prop.type),
              color: this.getColor(prop.type)
            }}
          >
            {prop.type === 'value' ? typeof prop.value : prop.type}
          </div>
          <input
            className={'prop-input'}
            style={{ fontFamily: 'monospace' }}
            onChange={this.handleUpdateValueV2}
            type="text"
            value={isActiveProp ? this.props.activePropInput : inputValue}
            autoFocus={isActiveProp}
            onFocus={this.onFocus}
            onBlur={this.props.onPropBlur}
          />
        </div>

        {/* If variable, display current value */}
        {prop.type === 'variable' ? (
          <div className="current-value">Current Value: {this.props.variableData[prop.value]}</div>
        ) : (
          <></>
        )}
      </div>
    );
  }

  renderProp(key, prop) {
    switch (prop.type) {
      case 'variable':
        return this.renderPropInput(key, prop, 'value');
      case 'value':
        return this.renderPropInput(key, prop, 'expression');
      case 'expression':
        return this.renderPropInput(key, prop, 'variable');
    }
  }

  updatePropDetails() {
    this.props.updateShowPropDetailsMap(this.props.name);
  }

  render() {
    const { name, value, isOver, dropTarget, showDetails } = this.props;
    let ret;
      ret = (
        <div
          onClick={this.updatePropDetails.bind(this)}
          style={{
            marginLeft: 0,
            border: isOver ? 'solid 2px green' : undefined,
          }}
        >
          <div className="prop-name">
            {name}
          </div>
          <div>
            {this.renderProp(name, value)}
          </div>
        </div>
      );
    return dropTarget(<div>{ret}</div>);
  }
}

const variableTarget = {
  drop(props, monitor, component) {
    console.log('dropped on property!!');
    const name = monitor.getItem().name;
    const node = props.node;
    
    updateNodeById(props.ast, node.id, {
      properties: { [props.name]: { value: name, type: 'variable' } },
    });
    props.setAst(props.ast);
  },
};

function collect(connect, monitor) {
  return {
    dropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  };
}

export default DropTarget('VARIABLE', variableTarget, collect)(Component);
export { Component as Property };
