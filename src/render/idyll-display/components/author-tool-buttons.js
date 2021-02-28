import React from 'react';
import Context from '../../context/context';
import { DropTarget } from 'react-dnd';
import { getComponentDomId } from '../utils';

class AuthorToolButtons extends React.PureComponent {
  static contextType = Context;

  constructor(props) {
    super(props);

    this.domId = getComponentDomId(
      props.idyllASTNode.name,
      props.idyllASTNode.id
    );
    this.state = {};
  }

  handleClickProps(e) {
    e.stopPropagation();
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
      markup: newMarkup,
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.isOver !== prevProps.isOver) {
      if (this.props.isOver) {
        this.context.setActiveComponent({ ...this.props.idyllASTNode });
      }
    }
  }

  componentDidCatch(e) {
    this.setState({
      hasError: true,
      error: e,
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
        <div ref={(ref) => (this._componentRef = ref)}>
          {this.state.hasError ? (
            <span className='error-container'>
              {this.state.error.toString()}
            </span>
          ) : (
            props.component
          )}
        </div>
        <div className='author-view-container' id={this.domId}>
          <button
            className={`author-view-button`}
            onClick={this.handleClickProps.bind(this)}
            data-tip
            data-for={props.uniqueKey}>
            <svg
              width='10'
              height='10'
              viewBox='0 0 10 10'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'>
              <path
                d='M0 4.07099V5.90814L1.125 6.09604C1.20832 6.40919 1.33332 6.70148 1.47918 6.952L0.8125 7.87056L2.10418 9.1858L3.04168 8.53863C3.3125 8.68476 3.60418 8.81002 3.89582 8.89355L4.08332 10H5.91668L6.10418 8.87265C6.41668 8.78915 6.6875 8.66389 6.95832 8.51777L7.875 9.16494L9.1875 7.87056L8.52082 6.952C8.66664 6.68058 8.79164 6.38832 8.875 6.07517L10 5.90814V4.07099L8.875 3.8831C8.79168 3.56995 8.66668 3.29852 8.52082 3.02713L9.1875 2.08767L7.89582 0.793297L6.95832 1.46137C6.6875 1.31524 6.39582 1.18998 6.08332 1.10645L5.89582 0H4.0625L3.875 1.12735C3.58332 1.21085 3.29168 1.33611 3.02082 1.48223L2.08332 0.814198L0.791677 2.10854L1.45832 3.048C1.3125 3.31942 1.1875 3.59081 1.10418 3.90396L0 4.07099ZM5 3.0689C6.0625 3.0689 6.91668 3.92483 6.91668 4.98955C6.91668 6.05427 6.04168 6.91023 5 6.91023C3.95832 6.91023 3.08332 6.05427 3.08332 4.98955C3.08332 3.92483 3.9375 3.0689 5 3.0689Z'
                fill='white'
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }
}

const variableTarget = {
  drop(props, monitor, component) {
    // component.insertComponent(monitor.getItem().component);
  },
};

function collect(connect, monitor) {
  return {
    dropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  };
}

export default DropTarget(
  'VARIABLE',
  variableTarget,
  collect
)(AuthorToolButtons);
