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
    event.preventDefault();
  }

  // TODO changing type to number for vars that are numbers
  // and also other value confirmation checks
  render() {
    return (
      <form onSubmit={this.props.addVariable}>
        <label>
          New var name:
          <input type="text" value={this.state.value} onChange={this.handleChange} />
        </label>
        <button type="submit">Add new variable!</button>
      </form>
    );
  }
}

export default VariableForm;