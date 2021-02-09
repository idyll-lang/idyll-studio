import * as React from 'react';
import { EXECUTE_KEY } from '../../../../constants';

/**
 * Renders editable code cell that executes on shift + enter
 * @props - onExecute, onBlur, markup
 */
export default class EditableCodeCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false
    };

    this._cellCodeRef = React.createRef();
  }

  toggleEdit = e => {
    e.stopPropagation();
    if (this.state.editing) {
      this.setState({
        editing: false
      });
    } else {
      this.edit();
    }
  };

  edit = () => {
    this.setState(
      {
        editing: true
      },
      () => {
        this._cellCodeRef.current.focus();
      }
    );
  };

  // Executes code change
  execute = () => {
    this.props.onExecute(this._cellCodeRef.current.innerText);
  };

  // Updates markup on blur
  onBlur = e => {
    this.toggleEdit(e);
    this.props.onBlur(this._cellCodeRef.current.innerText);
  };

  handleKeyDown = e => {
    e.stopPropagation();
    if (e.shiftKey && e.key === EXECUTE_KEY) {
      e.preventDefault();
      this.execute();
    }
  };

  render() {
    const { editing } = this.state;

    return (
      <pre onClick={!editing ? this.toggleEdit : undefined}>
        <code>
          <div
            ref={this._cellCodeRef}
            contentEditable={editing}
            suppressContentEditableWarning={true}
            onKeyDown={this.handleKeyDown}
            onBlur={this.onBlur}>
            {this.props.markup}
          </div>
        </code>
      </pre>
    );
  }
}
