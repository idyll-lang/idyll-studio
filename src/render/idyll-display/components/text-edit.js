import React from 'react';
import Context from '../../context/context';
import copy from "fast-copy";
const AST = require('idyll-ast');
const compile = require('idyll-compiler');


const { getNodeById, deleteNodeById } = require('../utils');

class TextEdit extends React.PureComponent {
  static contextType = Context;

  constructor(props) {
    super(props);
    this.state = {
      showMarkup: false
    };
    this._markup = this.getMarkup(props);
  }

  getMarkup(props) {
    if (props.idyllASTNode.name === 'p') {
      return AST.toMarkup({
        id: -1,
        type: 'component',
        name: 'div',
        children: props.idyllASTNode.children
      });
    }
    return AST.toMarkup({
      id: -1,
      type: 'component',
      name: 'div',
      children: [props.idyllASTNode]
    });
  }

  toggleMarkup() {
    if (this.state.showMarkup) {
      this.updateAST();
      return;
    }

    this.setState({
      showMarkup: !this.state.showMarkup
    });
  }

  updateAST() {
    if (!this._markupRef) {
      return;
    }

    const markup = this._markupRef.textContent;

    if (markup.trim() === '') {
      // If it is empty, delete the existing node
      deleteNodeById(this.context.ast, this.props.idyllASTNode.id);
    } else {
      // console.log(markup);
      const output = compile(markup, { async: false });
      let node = output.children[0];

      // TODO - handle merging multiple nodes / paragraphs
      while (node.type === 'component' && node.name === 'TextContainer') {
        node = node.children[0];
      }

      const targetNode = getNodeById(
        this.context.ast,
        this.props.idyllASTNode.id
      );
      Object.keys(node).forEach(key => {
        if (key === 'id') {
          return;
        }
        targetNode[key] = node[key];
      });
    }

    this.context.setAst(this.context.ast);
    this.setState({
      showMarkup: false
    });
  }

  render() {
    const { idyll, updateProps, hasError, ...props } = this.props;
    if (this.state.showMarkup) {
      return (
        <div
          ref={ref => (this._markupRef = ref)}
          style={{
            whiteSpace: 'pre-wrap',
            marginLeft: -10,
            paddingLeft: 10,
            borderLeft: 'solid 2px #222',
            fontFamily: 'monospace'
          }}
          contentEditable='true'
          suppressContentEditableWarning={true}
          onBlur={this.toggleMarkup.bind(this)}>
          {this.getMarkup(this.props)}
        </div>
      );
    }
    return (
      <div className='editable-text' onClick={this.toggleMarkup.bind(this)}>
        {props.children}
      </div>
    );
  }
}

export default TextEdit;
