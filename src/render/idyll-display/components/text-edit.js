import React from 'react';
import Context from '../../context/context';
import copy from 'fast-copy';
const AST = require('idyll-ast');
const compile = require('idyll-compiler');
import { DropTarget } from 'react-dnd';

const {
  getNodeById,
  getRandomId,
  deleteNodeById,
  getParentNodeById
} = require('../utils');

class InlineDropTarget extends  React.PureComponent {
  static contextType = Context;

  insertComponent(name) {
    this.props.update(name)
  }

  render() {
    const { isOver, dropTarget } = this.props;
    return dropTarget(
      <span style={{width: isOver ? 60 : 30, height: '1.2em', display: 'inline-block', position: 'relative', top: '.1em', borderRadius: 3, margin: '0 6px', background: isOver  ? '#999' : '#ccc'}}></span>
    );
  }
}


const componentInlineTargetSpan = {
  drop(props, monitor, component) {
    component.insertComponent(monitor.getItem().component);
  },
};

function collectSpan(connect, monitor) {
  return {
    dropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  };
}

const InlineDropTargetWrapped = DropTarget(
  'COMPONENT',
  componentInlineTargetSpan,
  collectSpan
)(InlineDropTarget);


class TextEdit extends React.PureComponent {
  static contextType = Context;

  constructor(props) {
    super(props);
    this.state = {
      showMarkup: false
    };
    this._markup = this.getMarkup(props);
  }

  // Generates the tag associated with the given component name
  insertComponent(name) {
    // console.log('insert component into text', name);
  }

  getTag(name) {
    var tagInfo = this.context.propsMap.get(name);

    var tag = '[' + tagInfo.name + ' ';
    if (tagInfo.props !== undefined) {
      tagInfo.props.filter(prop => prop.example !== undefined).forEach((prop) => {
        tag += prop.name + ':' + prop.example + ' ';
      });
    }
    if (tagInfo.tagType === 'closed') {
      tag += ' /]';
    } else {
      var children = tagInfo.children !== undefined ? tagInfo.children[0] : '';
      tag += ']' + children + '[/' + tagInfo.name + ']';
    }

    return tag;
  }

  insertBefore(name) {
    return this.updateASTWithMarkup(`${this.getTag(name)} ${this.getMarkup(this.props)}`)
  }

  insertAfter(name) {
    return this.updateASTWithMarkup(`${this.getMarkup(this.props)} ${this.getTag(name)}`)
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

  getASTWithDropTargets() {
    if (props.idyllASTNode.name === 'p') {
      return this.props.idyllASTNode
    }
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

  updateASTWithMarkup(markup)  {
    const output = compile(markup, { async: false });
    let node = output.children ? output.children : output;
    while (node &&  node.length && node[0].type === 'component' && (node[0].name === 'TextContainer'  || node[0].name === 'text-container')) {
      node = node[0].children;
    }

    if (node.length === 1) {
      node = node[0];

      const targetNode = getNodeById(
        this.context.ast,
        this.props.idyllASTNode.id
      );

      node.children.forEach(n => {
        n.id = getRandomId();
      });

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

    this.setState({
      showMarkup: false
    });
    this.context.setAst(this.context.ast);
  }

  updateAST() {
    if (!this._markupRef) {
      return;
    }

    const markup = this._markupRef.innerText;

    if (markup.trim() === '') {
      // If it is empty, delete the existing node
      deleteNodeById(this.context.ast, this.props.idyllASTNode.id);
      this.context.setAst(this.context.ast);
      this.setState({
        showMarkup: false
      });
    } else {
      this.updateASTWithMarkup(markup)
    }

  }

  render() {
    const { idyll, updateProps, hasError, dropTarget,...props } = this.props;

    if (this.state.showMarkup && !props.canDrop) {
      return dropTarget((
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
      ));
    }

    if (props.isOver) {
      if (props.idyllASTNode.name === 'p') {
        return dropTarget(<div><p><InlineDropTargetWrapped update={this.insertBefore.bind(this)} />{props.children[0].props.children}<InlineDropTargetWrapped  update={this.insertAfter.bind(this)} /></p></div>);
      }
    }

    return dropTarget(
      <div className='editable-text' onClick={this.toggleMarkup.bind(this)}>
        {props.children}
      </div>
    );
  }
}

const componentInlineTarget = {
  drop(props, monitor, component) {
    component.insertComponent(monitor.getItem().component);
  },
};

function collect(connect, monitor) {
  return {
    dropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  };
}


export default DropTarget(
  'COMPONENT',
  componentInlineTarget,
  collect
)(TextEdit);

