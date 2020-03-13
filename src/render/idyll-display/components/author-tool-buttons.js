import React from 'react';
import Context from '../../context';
import { DropTarget } from 'react-dnd';
import { getNodeById, isChildOf, getRandomId } from '../utils/';

const AST = require('idyll-ast');
const compile = require('idyll-compiler');

const cursorPositions = {};

function getCurrentCursorPosition(parent) {
  var selection = window.getSelection(),
    charCount = -1,
    node;

  if (selection.focusNode) {
    if (isChildOf(selection.focusNode, parent)) {
      node = selection.focusNode;
      charCount = selection.focusOffset;

      while (node) {
        if (node === parent) {
          break;
        }

        if (node.previousSibling) {
          node = node.previousSibling;
          charCount += node.textContent.length;
        } else {
          node = node.parentNode;
          if (node === null) {
            break;
          }
        }
      }
    }
  }

  return charCount;
}

function createRange(node, chars, range) {
  if (!range) {
    range = document.createRange();
    range.selectNode(node);
    range.setStart(node, 0);
  }

  if (chars.count === 0) {
    range.setEnd(node, chars.count);
  } else if (node && chars.count > 0) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent.length < chars.count) {
        chars.count -= node.textContent.length;
      } else {
        range.setEnd(node, chars.count);
        chars.count = 0;
      }
    } else {
      for (var lp = 0; lp < node.childNodes.length; lp++) {
        range = createRange(node.childNodes[lp], chars, range);

        if (chars.count === 0) {
          break;
        }
      }
    }
  }

  return range;
}

function setCurrentCursorPosition(node, chars) {
  if (chars >= 0) {
    var selection = window.getSelection();

    const range = createRange(node.parentNode, { count: chars });

    if (range) {
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
}

class AuthorToolButtons extends React.PureComponent {
  static contextType = Context;

  constructor(props) {
    super(props);
    this.state = {
      showCode: false
    };
    this._markup = this.getMarkup(props);
    cursorPositions[props.idyllASTNode.id] = -1;

    this.domId = props.idyllASTNode.name + '-' + props.idyllASTNode.id;
  }

  updateNode(node, oldString, newString) {
    let updated = false;
    Object.keys(node.properties || {}).forEach(key => {
      const prop = node.properties[key];
      if (
        prop.type === 'value' &&
        ('' + prop.value).trim() == ('' + oldString).trim()
      ) {
        prop.value = newString;
        updated = true;
      }
    });
    let localUpdate = false;
    (node.children || []).forEach(child => {
      localUpdate = this.updateNode(child, oldString, newString);
      updated = updated || localUpdate;
    });
    return updated;
  }

  // Flips between whether we are in the author view of a component
  handleClickCode() {
    if (this.state.showCode) {
      const output = compile(this._markup, { async: false });
      let node = output.children[0];
      if (node.children && node.children.length) {
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

      this.context.setAst(this.context.ast);
      this.setState({
        showCode: false
      });
    } else {
      this._markup = this.getMarkup(this.props);
      this.setState({ showCode: true });
    }
  }

  handleClickProps() {
    if (
      this.context.activeComponent &&
      this.context.activeComponent.id === this.props.idyllASTNode.id
    ) {
      this.context.setActiveComponent(null);
    } else {
      this.context.setActiveComponent({ ...this.props.idyllASTNode });
    }
  }

  getMarkup(props) {
    return AST.toMarkup({
      id: -1,
      type: 'component',
      name: 'div',
      children: [props.idyllASTNode]
    });
  }

  onExecute(value) {
    console.log(value);
  }

  // registerObserver() {
  //   if (!this._componentRef) {
  //     return;
  //   }
  //   const node = getNodeById(this.context.ast, this.props.idyllASTNode.id);
  //   let updated = false;
  //   var observer = new MutationObserver(mutations => {
  //     mutations.forEach(mutation => {
  //       console.log('mutation', mutation);
  //       updated = this.updateNode(
  //         node,
  //         mutation.oldValue,
  //         mutation.target.data
  //       );
  //     });
  //     if (updated) {
  //       const ast = this.context.ast;
  //       ast.id = getRandomId();
  //       this.context.setAst(ast);
  //     }
  //   });
  //   var config = {
  //     subtree: true,
  //     characterData: true,
  //     characterDataOldValue: true
  //   };
  //   observer.observe(this._componentRef, config);
  //   this.observer = observer;
  // }

  // componentDidMount() {
  //   setCurrentCursorPosition(
  //     this._componentRef,
  //     cursorPositions[this.props.idyllASTNode.id]
  //   );
  //   // Set up mutation observer to catch DOM changes.
  //   this.registerObserver();
  // }

  // handleMarkupRef(ref) {
  //   if (!ref) {
  //     return;
  //   }
  //   if (this.markupObserver) {
  //     this.markupObserver.disconnect();
  //   }
  //   if (this.observer) {
  //     this.observer.disconnect();
  //   }
  //   this._markupRef = ref;

  //   // Set up mutation observer to catch DOM changes.
  //   const node = getNodeById(this.context.ast, this.props.idyllASTNode.id);
  //   var observer = new MutationObserver(mutations => {
  //     mutations.forEach(mutation => {
  //       const input = mutation.target.data;
  //       this._markup = input;
  //     });
  //     // const ast = this.context.ast;
  //     // ast.id = getRandomId();
  //     // this.context.setAst(ast);
  //   });
  //   var config = {
  //     subtree: true,
  //     characterData: true,
  //     characterDataOldValue: true
  //   };
  //   observer.observe(this._markupRef, config);
  //   this.markupObserver = observer;
  // }

  // componentWillUnmount() {
  //   this.observer && this.observer.disconnect();
  //   this.markupObserver && this.markupObserver.disconnect();
  //   this._componentRef
  //     ? (cursorPositions[this.props.idyllASTNode.id] = getCurrentCursorPosition(
  //         this._componentRef.parentNode
  //       ))
  //     : null;
  // }

  // componentDidUpdate(prevProps, prevState) {
  //   if (!this.state.showCode && this.state.showCode !== prevState.showCode) {
  //     this.registerObserver();
  //   }
  // }

  // Returns an entire author view, including the component itself,
  // a quill icon to indicate whether we're hovering in the component,
  // and debugging information when the icon is pressed
  render() {
    const { idyll, updateProps, idyllASTNode, hasError, ...props } = this.props;
    const { dropTarget } = this.props;

    return dropTarget(
      <div className='component-debug-view'>
        <div
          contentEditable={true}
          suppressContentEditableWarning={true}
          ref={ref => (this._componentRef = ref)}
        >
          {props.component}
        </div>
        {this.state.showCode ? (
          <div className={'idyll-code-editor'}>
            {/* <div
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  ref={ref => this.handleMarkupRef(ref)}
                >
                  {this._markup}
                </div> */}
            <EditableCodeCell onExecute={this.onExecute.bind(this)} />
          </div>
        ) : null}
        <div className='author-view-container' id={this.domId}>
          <button
            className='author-view-button'
            onClick={this.handleClickProps.bind(this)}
            data-tip
            data-for={props.uniqueKey}
          >
            Properties
          </button>
          <button
            className='author-view-button'
            onClick={this.handleClickCode.bind(this)}
            data-tip
            data-for={props.uniqueKey}
          >
            Code
          </button>
        </div>
      </div>
    );
  }
}

const variableTarget = {
  drop(props, monitor, component) {
    // component.insertComponent(monitor.getItem().component);
  }
};

function collect(connect, monitor) {
  return {
    dropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
}

export default DropTarget(
  'VARIABLE',
  variableTarget,
  collect
)(AuthorToolButtons);

/**
 * props.onExecute
 */
export class EditableCodeCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
      value: ''
    };
  }

  toggleEdit = e => {
    e.stopPropagation();
    console.log('hi');
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
        this._cellCodeRef.focus();
      }
    );
  };

  // send to parent on change
  execute = () => {
    this.props.onExecute(this.state.value);
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
            ref={codeRef => (this._cellCodeRef = codeRef)}
            contentEditable={editing}
            suppressContentEditableWarning={true}
            onKeyDown={this.handleKeyDown}
          >
            {this.state.value}
          </div>
        </code>
      </pre>
    );
  }
}
