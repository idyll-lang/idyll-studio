import React from 'react';
import Context from '../../context';
import { DropTarget } from 'react-dnd'
import { updateNodeById } from '../utils';

class Component extends React.PureComponent {
  static contextType = Context;

  constructor(props) {
    super(props);
    this.state = {
      showDetails: false
    }
  }

  handleUpdateValue(propName) {
    return (e) => {
      const node = this.props.node;
      let val = e.target.value;
      if (val.trim() !== '') {
        val = Number(e.target.value);
      }
      if (isNaN(val)) {
        val = e.target.value;
      }

      node.properties[propName].value = val;
      this.context.setAst(this.context.ast);
    }
  }

  handleUpdateType(propName, type) {
    return () => {
      const node = this.props.node;
      node.properties[propName].type = type;
      this.context.setAst(this.context.ast);
    }
  }

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

  renderExpression(key, prop) {
    return <div style={{display: 'flex', flexDirection: 'row', width: '100%'}}>
      <input className={"prop-input"} style={{fontFamily: 'monospace'}} onChange={this.handleUpdateValue(key)} type="text" value={prop.value}></input>
      <div className={"prop-type"} onClick={this.handleUpdateType(key, 'variable')} style={{marginLeft: 0, borderRadius: '0 20px 20px 0', background: this.getBackgroundColor('expression'), color: this.getColor('expression')}}>{prop.type}</div>
      <div>
      </div>
    </div>
  }
  renderValue(key, prop) {
    return <div style={{display: 'flex', flexDirection: 'row', width: '100%'}}>
      <input className={"prop-input"} onChange={this.handleUpdateValue(key)} type="text" value={prop.value}></input>
      <div className={"prop-type"} onClick={this.handleUpdateType(key, 'expression')} style={{marginLeft: 0, borderRadius: '0 20px 20px 0', background: this.getBackgroundColor('value'), color: this.getColor('value')}}>{typeof prop.value}</div>
      <div>
        {/* Current Value: {idyllState[prop.value]} */}
      </div>
    </div>
  }
  renderVariable(key, prop) {
    const idyllState = this.context.context.data();
    return <div>
      <div style={{display: 'flex', flexDirection: 'row', width: '100%'}}>
        <input className={"prop-input"} style={{fontFamily: 'monospace'}} onChange={this.handleUpdateValue(key)} type="text" value={prop.value}></input>
        <div className={"prop-type"} onClick={this.handleUpdateType(key, 'value')} style={{marginLeft: 0, borderRadius: '0 20px 20px 0', background: this.getBackgroundColor('variable'), color: this.getColor('variable')}}>{prop.type}</div>
      </div>
      <div>
        Current Value: {idyllState[prop.value]}
      </div>
    </div>
  }

  renderProp(key, prop) {
    switch(prop.type) {
      case 'variable':
        return this.renderVariable(key, prop);
      case 'value':
        return this.renderValue(key, prop);
      case 'expression':
        return this.renderExpression(key, prop);
    }
  }

  render() {
    const { name, value, isOver, dropTarget } = this.props;

    let ret;
    if (!this.state.showDetails) {
      ret = <div className={"prop-type"} onClick={() => this.setState({ showDetails: true })} style={{marginLeft: 0, border: isOver ? 'solid 2px green' : undefined, borderRadius: '0 20px 20px 0', background: this.getBackgroundColor(value.type), color: this.getColor(value.type)}}>{name}</div>
    } else {
      ret = this.renderProp(name, value);
    }
    return dropTarget(<div>
      {ret}
    </div>)
  }
}


const variableTarget = {
  drop(props, monitor, component) {
    // component.insertComponent(monitor.getItem().component);
    console.log('dropped on property!!');
    const name = monitor.getItem().name;
    const node = props.node;

    // node.properties[props.name].value = name;
    // node.properties[props.name].type = 'variable';
    // console.log('updating ast');
    updateNodeById(props.ast, node.id, { properties: { [props.name]: { value: name, type: 'variable' }} })
    props.setAst(props.ast);
  }
}

function collect(connect, monitor) {
  return {
    dropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  }
}


export default DropTarget('VARIABLE', variableTarget, collect)(Component)
// export default Component;
