import React from 'react';
import Context from '../../context/context';
import copy from 'fast-copy';
const AST = require('idyll-ast');
const compile = require('idyll-compiler');

const {
  getNodeById,
  getRandomId,
  deleteNodeById,
  getParentNodeById
} = require('../utils');

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
      return AST.toMarkup(props.idyllASTNode);
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

    const markup = this._markupRef.innerText;

    if (markup.trim() === '') {
      // If it is empty, delete the existing node
      deleteNodeById(this.context.ast, this.props.idyllASTNode.id);
    } else {
      const output = compile(markup, { async: false });
      let node = output.children[0];

      while (node.type === 'component' && node.name === 'TextContainer') {
        node = node.children;
      }

      if (node.length === 1) {
        node = node[0];

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
      } else {
        const parentNode = getParentNodeById(
          this.context.ast,
          this.props.idyllASTNode.id
        );
        if (!parentNode) {
          console.warn('Could not identify parent node');
          return;
        }

        const childIdx = (parentNode.children || []).findIndex(
          c => c.id === this.props.idyllASTNode.id
        );

        node.forEach(n => {
          n.id = getRandomId();
        });

        // parentNode.children.splice(childIdx, 0, ...node);
        parentNode.children = parentNode.children
          .slice(0, childIdx)
          .concat(node)
          .concat(parentNode.children.slice(childIdx + 1));
      }
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
          ref={ref => { this._markupRef = ref; ref && ref.focus() }}
          style={{
            whiteSpace: 'pre-wrap',
            marginLeft: -10,
            paddingLeft: 10,
            borderLeft: 'solid 2px #222',
            marginBottom: 18
          }}
          tabIndex={0}
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
