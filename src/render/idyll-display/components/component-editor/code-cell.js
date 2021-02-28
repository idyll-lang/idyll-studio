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
      editing: true,
      referenceMarkup: props.markup,
      currentMarkup: props.markup

    };

    this._cellCodeRef = React.createRef();
  }

  // Executes code change
  execute = () => {
    this.setState({
      referenceMarkup: this._cellCodeRef.current.innerText,
      currentMarkup: this._cellCodeRef.current.innerText
    }, () => {
      this.props.onExecute(this._cellCodeRef.current.innerText);
    })

  };

  // Updates markup on blur
  onBlur = e => {
    this.props.onBlur && this.props.onBlur(this._cellCodeRef.current.innerText);
  };

  handleKeyUp = e => {
    e.stopPropagation();
    this.setState({
      currentMarkup: this._cellCodeRef.current.innerText.trim()
    })
  }

  handleKeyDown = e => {
    e.stopPropagation();
    if (e.shiftKey && e.key === EXECUTE_KEY) {
      e.preventDefault();
      this.execute();
    }
  };

  render() {
    const { editing, referenceMarkup, currentMarkup } = this.state;

    return (
      <pre style={{border: referenceMarkup === currentMarkup ? 'solid 1px #666' : 'solid 1px #cccc00'}}>
        <code>
          <div
            ref={this._cellCodeRef}
            contentEditable={editing}
            suppressContentEditableWarning={true}
            style={{minHeight: '1.33em', ...this.props.style}}
            onKeyDown={this.handleKeyDown}
            onKeyUp={this.handleKeyUp}
            onBlur={this.onBlur}>
            {this.props.markup}
          </div>
        </code>
      </pre>
    );
  }
}
