import Draft from 'draft-js';
import { Map } from 'immutable';
import React from "react";

import TeXBlock from './TeXBlock';
import { insertTeXBlock } from './modifiers/insertTeXBlock';
import { removeTeXBlock } from './modifiers/removeTeXBlock';

import * as components from "idyll-components";
import IdyllDocument from "../idyll-document/src";
import compile from 'idyll-compiler';

var { Editor, EditorState, RichUtils } = Draft;

export const hashCode = (str) => {
  var hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

class IdyllEditor extends React.PureComponent {
  constructor(props) {
    super(props);
    const { markup } = props;
    this.state = {
      editorState: EditorState.createEmpty(),
      liveTeXEdits: Map(),
    };

    this._blockRenderer = (block) => {

      const type = block.getType();
      console.log('type', type)
      const text = block.getText();
      console.log('text', text)

      if (text !== '') {
        compile(text)
          .then((ast) => {
            console.log('ast', ast)
            // this.setState({ ast, hash: hashCode(this.props.markup), error: null });
          })
      }

      const entity = block.getEntityAt(0)
      console.log('entity', entity)
      if (entity !== null) {
        const contentState = this.state.editorState.getCurrentContent();
        const entityInstance = contentState.getEntity(entity);
        const data = entityInstance.getData();

        console.log('editorState', this.state.editorState)

        console.log('data', data)
      }
      //   compile(this.props.markup, this.props.compilerOptions)
      //     .then((ast) => {
      //       this.setState({ ast, hash: hashCode(this.props.markup), error: null });
      //     })
      // }


      if (block.getType() === 'atomic') {
        console.log('block', block)
        return {
          component: TeXBlock,
          editable: false,
          props: {
            onStartEdit: (blockKey) => {
              var { liveTeXEdits } = this.state;
              this.setState({ liveTeXEdits: liveTeXEdits.set(blockKey, true) });
            },
            onFinishEdit: (blockKey, newContentState) => {
              var { liveTeXEdits } = this.state;
              this.setState({
                liveTeXEdits: liveTeXEdits.remove(blockKey),
                editorState: EditorState.createWithContent(newContentState),
              });
            },
            onRemove: (blockKey) => this._removeTeX(blockKey),
          },
        };
      }
      return null;
    };

    this._focus = () => this.refs.editor.focus();
    this._onChange = (editorState) => this.setState({ editorState });

    this._handleKeyCommand = (command, editorState) => {
      var newState = RichUtils.handleKeyCommand(editorState, command);
      if (newState) {
        this._onChange(newState);
        return true;
      }
      return false;
    };

    this._removeTeX = (blockKey) => {
      var { editorState, liveTeXEdits } = this.state;
      this.setState({
        liveTeXEdits: liveTeXEdits.remove(blockKey),
        editorState: removeTeXBlock(editorState, blockKey),
      });
    };

    this._insertTeX = () => {
      this.setState({
        liveTeXEdits: Map(),
        editorState: insertTeXBlock(this.state.editorState),
      });
    };
  }

  /**
   * While editing TeX, set the Draft editor to read-only. This allows us to
   * have a textarea within the DOM.
   */
  render() {
    return (
      <div className="container">
        <div className={`renderer `}>
          <div className={`renderer-container `}>
            <div className="TexEditor-container">
              <div className="TeXEditor-root">
                <div className="TeXEditor-editor" onClick={this._focus}>
                  <IdyllDocument
                    markup={""}
                    components={components}
                    layout={"centered"}
                    context={context => {
                      window.IDYLL_CONTEXT = context;
                    }}
                    datasets={{}}
                  >
                  </IdyllDocument>
                  <Editor
                    blockRendererFn={this._blockRenderer}
                    editorState={this.state.editorState}
                    handleKeyCommand={this._handleKeyCommand}
                    onChange={this._onChange}
                    placeholder="Start"
                    readOnly={this.state.liveTeXEdits.count()}
                    ref="editor"
                    spellCheck={true}
                  />
                  <style jsx>{`
          .renderer {
            flex: 2;
            background: #fffff8;
            padding: 15px;
            font-size: 13px;
            overflow-y: auto;
          }
          .renderer-container {
            margin-left: auto;
            margin-right: auto;
            padding-left: 6.25%;
            font-family: et-book, Palatino, "Palatino Linotype",
              "Palatino LT STD", "Book Antiqua", Georgia, serif;
            color: #111;
            counter-reset: sidenote-counter;
          }
        `}</style>
                </div>
              </div>
            </div>
            <button onClick={this._insertTeX} className="TeXEditor-insert">
              {'Insert new TeX'}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default IdyllEditor;
