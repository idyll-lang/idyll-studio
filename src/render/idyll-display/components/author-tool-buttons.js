import React from 'react';
import Context from '../../context';
import { DropTarget } from 'react-dnd';
import { getNodeById } from '../utils/';
import EditableCodeCell from './code-cell';

const AST = require('idyll-ast');
const compile = require('idyll-compiler');

class AuthorToolButtons extends React.PureComponent {
  static contextType = Context;

  constructor(props) {
    super(props);
    this.state = {
      showCode: false,
      markup: this.getMarkup(props)
    };

    this.domId = props.idyllASTNode.name + '-' + props.idyllASTNode.id;
  }

  // Flips between whether we are in the author view of a component
  handleClickCode() {
    if (this.state.showCode) {
      let shouldClose = true;
      if (this.getMarkup(this.props) !== this.state.markup) {
        shouldClose = confirm(
          'Closing this code cell means any changes made to it will be lost. Are you sure you want to close?'
        );
      }

      if (shouldClose) {
        this.setState({
          showCode: false
        });
      }
    } else {
      // get the latest
      this.setState({
        markup: this.getMarkup(this.props),
        showCode: true
      });
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

  onExecute(newMarkup) {
    this.setState(
      {
        markup: newMarkup
      },
      () => {
        this.updateAst();
      }
    );
  }

  onBlur(newMarkup) {
    this.setState({
      markup: newMarkup
    });
  }

  updateAst() {
    const output = compile(this.state.markup, { async: false });
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
  }

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
            <EditableCodeCell
              onExecute={this.onExecute.bind(this)}
              onBlur={this.onBlur.bind(this)}
              markup={this.state.markup}
            />
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
