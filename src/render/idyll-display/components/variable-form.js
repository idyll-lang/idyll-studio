import React from 'react';
import Context from '../../context';

class VariableForm extends React.PureComponent {
  static contextType = Context;

  constructor(props) {
    super(props);

    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    const newValue = parseInt(this.state.value);
    this.context.node.properties.value.value = newValue;
    this.context.setAst({...this.context.ast});
    event.preventDefault();
  }

  // TODO changing type to number for vars that are numbers
  // and also other value confirmation checks
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Update value to:
          <input type="text" value={this.state.value} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

export default VariableForm;