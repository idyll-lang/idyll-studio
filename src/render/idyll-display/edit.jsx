import React from "react";
import { Editor, EditorState, ContentState } from "draft-js";

class Edit extends React.PureComponent {
  constructor(props) {
    super(props);

    // Create content state based on markup prop
    var content = ContentState.createFromText(this.props.markup);

    this.state = {
      editorState: EditorState.createWithContent(content)
    };
    this.onChange = editorState => this.setState({ editorState });
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
    // const { markup } = this.props;

    return (
      <div className="editor" style={{ width: "100%" }}>
        <Editor editorState={this.state.editorState} onChange={this.onChange} />
      </div>
    );
  }
}

export default Edit;
