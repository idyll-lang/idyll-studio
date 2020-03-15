import * as React from 'react';

/**
 * Renders editable code cell that executes on shift + enter
 * @props - onExecute, markup, isOpen
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

  // send to parent on change
  execute = () => {
    this.props.onExecute(this._cellCodeRef.current.textContent);
  };

  handleKeyDown = e => {
    e.stopPropagation();
    if (event.shiftKey && event.keyCode === 13) {
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
          >
            {this.props.markup}
          </div>
        </code>
      </pre>
    );
  }
}
