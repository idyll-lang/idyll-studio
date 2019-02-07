import React from 'react';
import { Editor, EditorState, ContentState } from 'draft-js';

class Edit extends React.PureComponent {
  constructor(props) {
    super(props);

    // Create content state based on markup prop
    var content = ContentState.createFromText(this.props.markup);
    this.state = {
      editorState: EditorState.createWithContent(content)
    };

    this.handleChange = this.handleChange.bind(this);
  }

  // When user types or editor area is changed, updates
  // current editing state to new one
  handleChange(newEditorState) {
    this.setState({ editorState: newEditorState });

    // update index.jsx to reflect new markup changes
    // based on its handleChange function
    const { onChange } = this.props;
    if (onChange) {
      onChange(newEditorState.getCurrentContent().getPlainText());
    }
  }

  // Receives previous props and checks to see if
  // markup has changed based on what file is selected
  componentDidUpdate(prevProps) {
    if (this.props.markup !== prevProps.markup) {
      var content = ContentState.createFromText(this.props.markup);
      this.setState({ editorState: EditorState.createWithContent(content) });
    }
  }

  render() {
    return (
      <div className='editor' style={{ width: '50%' }}>
        <Editor
          editorState={this.state.editorState}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}

export default Edit;
