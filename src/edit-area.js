import React from 'react';
import { Editor, EditorState, ContentState } from 'draft-js';

class EditArea extends React.Component {
  // constructor(props) {
  //   super(props);
  //   this.state = { editorState: EditorState.createEmpty() };
  //   this.onChange = (editorState) => this.setState({ editorState });
  // }

  // render() {
  //   return (
  //     <Editor editorState={this.state.editorState} onChange={this.onChange} />
  //   )
  // }

  constructor(props) {
    super(props);
    const content = ContentState.createFromText("[var name:'hello' value: 3 /] hi");
    this.state = {
      editorState: EditorState.createWithContent(content),
      shouldRenderEditor: false,
    }
  }

  componentDidMount() {
    this.setState({ shouldRenderEditor: true });
  }

  // createEditorChange(text) {
  //   return EditorState.createWithContent(ContentState.createFromText(text))
  // }

  onEditorChange = (editorState) => {
    this.setState({ editorState })
    const { onChange } = this.props // onChange is equal to this.props.onChange
    if (onChange) {
      onChange(editorState.getCurrentContent().getPlainText()) // gets current state of editor
    }
  }

  render() {
    const { editorState, shouldRenderEditor } = this.state
    return (
      <div className='editor'>
        {shouldRenderEditor &&
          <Editor
            editorState={editorState}
            onChange={this.onEditorChange}
            editorKey='idyll-editor'
          />
        }

        <style jsx>{`
          .editor {
            flex: 1.5;
            overflow-y: auto;
            padding: 10px;
            font-size: 17px;
            line-height: 26px;
            border-left: solid 10px #ddd;
            border-right: solid 2px #ddd;
          }
        `}</style>
      </div>
    )
  }

}

export default EditArea;