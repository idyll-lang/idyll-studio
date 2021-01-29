import React from 'react';
import Context from '../../context/context';
import { DropTarget } from 'react-dnd';

class AuthorToolButtons extends React.PureComponent {
  static contextType = Context;

  constructor(props) {
    super(props);

    this.domId = props.idyllASTNode.name + '-' + props.idyllASTNode.id;
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


  onBlur(newMarkup) {
    this.setState({
      markup: newMarkup
    });
  }

  // Returns an entire author view, including the component itself,
  // a quill icon to indicate whether we're hovering in the component,
  // and debugging information when the icon is pressed
  render() {
    const { idyll, updateProps, idyllASTNode, hasError, ...props } = this.props;
    const { dropTarget } = this.props;

    return dropTarget(
      <div className='component-debug-view'>
        <div ref={ref => (this._componentRef = ref)}>{props.component}</div>
        <div className='author-view-container' id={this.domId}>
          <button
            className={`author-view-button`}
            onClick={this.handleClickProps.bind(this)}
            data-tip
            data-for={props.uniqueKey}>
            Edit
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

export default DropTarget('VARIABLE', variableTarget, collect)(
  AuthorToolButtons
);
