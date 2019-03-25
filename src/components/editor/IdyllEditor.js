import Draft from 'draft-js';
import { Map } from 'immutable';
import React from "react";

import TeXBlock from './TeXBlock';
import { insertTeXBlock } from './modifiers/insertTeXBlock';
import { removeTeXBlock } from './modifiers/removeTeXBlock';

import * as components from "idyll-components";
import IdyllDocument from "../idyll-document/src";
import compile from 'idyll-compiler';
import IdyllAST from 'idyll-ast';

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
      ast: []
    };

    this._blockRenderer = (block) => {

      // console.log('_blockRenderer')
      const type = block.getType();
      // console.log('type', type)
      var text = block.getText();
      // console.log('text', text)
      const key = block.getKey();
      // console.log('key', key)

      if (text !== '') {
        compile(text)
          .then((ast) => {
            // console.log('ast', ast, 'length', ast.length)
            // this.setState({ ast, hash: hashCode(this.props.markup), error: null });
            //console.log('array?',Array.isArray(key));
            IdyllAST.setProperty(ast[0], 'id', key)
            //this.setState({ ast: ast });
            this.doc.addBlock(ast);
          })
      }

      // const entity = block.getEntityAt(0)
      // console.log('entity', entity)
      // if (entity !== null) {
      //   const contentState = this.state.editorState.getCurrentContent();
      //   const entityInstance = contentState.getEntity(entity);
      //   const data = entityInstance.getData();

      //   console.log('editorState', this.state.editorState)

      //   console.log('data', data)
      // }
      // //   compile(this.props.markup, this.props.compilerOptions)
      // //     .then((ast) => {
      // //       this.setState({ ast, hash: hashCode(this.props.markup), error: null });
      // //     })
      // // }

      // if (block.getType() === 'atomic') {


      // console.log('block', block)
      // return {
      //   component: TeXBlock,
      //   editable: false,
      //   props: {
      //     onStartEdit: (blockKey) => {
      //       console.log('onStartEdit')
      //       var { liveTeXEdits } = this.state;
      //       this.setState({ liveTeXEdits: liveTeXEdits.set(blockKey, true) });
      //     },
      //     onFinishEdit: (blockKey, newContentState) => {
      //       console.log('onFinishEdit')
      //       var { liveTeXEdits } = this.state;
      //       this.setState({
      //         liveTeXEdits: liveTeXEdits.remove(blockKey),
      //         editorState: EditorState.createWithContent(newContentState),
      //       });
      //     },
      //     onRemove: (blockKey) => {
      //       console.log('onRemove')
      //       this._removeTeX(blockKey)}
      //       ,
      //   },
      // };
      // }

      return {
        component: TeXBlock,
        editable: true,
        props: {
          onEdit: (block) => {
            // console.log('onEdit')
            var newText = block.getText();
            // console.log('newText', newText)
            const newKey = block.getKey();
            if (newText != '') {
              compile(newText)
                .then((ast) => {
                  // console.log('ast', ast, 'length', ast.length)
                  // this.setState({ ast, hash: hashCode(this.props.markup), error: null });
                  //console.log('array?',Array.isArray(key));
                  IdyllAST.setProperty(ast[0], 'id', newKey)
                  //this.setState({ ast: ast });
                  this.doc.addBlock(ast);
                })
            }

          }
        },
      }



      return null;
    };

    this._focus = () => this.refs.editor.focus();
    this._onChange = (editorState) => {
      var lastChangeType = editorState.getLastChangeType()
      console.log('change', lastChangeType);

// TODO regenerate previous block if split-block
// TODO handle remove-range
// TODO handle multi-line insert-fragment

      if (lastChangeType === 'insert-characters' ||
        lastChangeType === 'backspace-character' ||
        lastChangeType === 'split-block' ||
        lastChangeType === 'insert-fragment'
        ) {

        var selectionState = editorState.getSelection();
        var anchorKey = selectionState.getAnchorKey();
        var currentContent = editorState.getCurrentContent();
        var currentContentBlock = currentContent.getBlockForKey(anchorKey);
        var selectedText = currentContentBlock.getText();
        console.log(anchorKey, selectedText)

        //if (selectedText != '') {
          compile(selectedText)
            .then((ast) => {
              console.log('compiled', anchorKey, selectedText)
              console.log('ast', ast, 'length', ast.length)
              // this.setState({ ast, hash: hashCode(this.props.markup), error: null });
              //console.log('array?',Array.isArray(key));
              IdyllAST.setProperty(ast[0], 'id', anchorKey)
              //this.setState({ ast: ast });
              this.doc.addBlock(ast);
            })
        //}

      }
      this.setState({
        editorState
      })
    };

    this._handleKeyCommand = (command, editorState) => {
      var newState = RichUtils.handleKeyCommand(editorState, command);
      if (newState) {
        this._onChange(newState);
        return true;
      }
      return false;
    };

    this._removeTeX = (blockKey) => {
      console.log('_removeTeX')
      var { editorState, liveTeXEdits } = this.state;
      this.setState({
        liveTeXEdits: liveTeXEdits.remove(blockKey),
        editorState: removeTeXBlock(editorState, blockKey),
      });
    };

    this._insertTeX = () => {
      console.log('_insertTeX')
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
        <div className="TexEditor-container">
          <div className="TeXEditor-root">
            {/* <button onClick={this._insertTeX} className="TeXEditor-insert">
              {'Insert new TeX'}
            </button> */}
            <div className="TeXEditor-editor" onClick={this._focus}>
              <Editor
                // blockRendererFn={this._blockRenderer}
                editorState={this.state.editorState}
                handleKeyCommand={this._handleKeyCommand}
                onChange={this._onChange}
                placeholder="Start writing here"
                // readOnly={this.state.liveTeXEdits.count()}
                ref="editor"
                spellCheck={true}
              />
            </div>
          </div>
        </div>
        <div className={`renderer `}>
          <div className={`renderer-container `}>
            <IdyllDocument
              ref={(child) => { this.doc = child; }}
              components={components}
              layout={"blog"}
              context={context => {
                window.IDYLL_CONTEXT = context;
              }}
              datasets={{}}
            >
            </IdyllDocument>
          </div>
        </div>
        <style jsx>{`
.container {
  display: flex;
  flex: 2;
  background: #fffff8;
  padding: 15px;
  font-size: 13px;
  overflow-y: auto;
}
.renderer, .TexEditor-container {
  margin-left: auto;
  margin-right: auto;
  padding-left: 6.25%;
  color: #111;
  counter-reset: sidenote-counter;
  text-align: left;
}
`}</style>
      </div>


    );
  }
}

export default IdyllEditor;
