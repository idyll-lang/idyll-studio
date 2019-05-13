import React from 'react';
import Context from '../../context';

class AuthorTool extends React.PureComponent {
  static contextType = Context;

  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  // Flips between whether we are in the author view of a component
  handleClick() {
    if (this.context.currentSidebarNode && this.context.currentSidebarNode.id === this.props.idyllASTNode.id) {
      this.context.setSidebarNode(null);
    } else {
      this.context.setSidebarNode(this.props.idyllASTNode);
    }
  }

  // Returns an entire author view, including the component itself,
  // a quill icon to indicate whether we're hovering in the component,
  // and debugging information when the icon is pressed
  render() {
    const isAuthorView = this.context.currentSidebarNode && this.context.currentSidebarNode.id === this.props.idyllASTNode.id;
    const { idyll, updateProps, hasError, ...props } = this.props;
    const addBorder = isAuthorView
      ? {
          boxShadow: '5px 5px 10px 1px lightGray',
          transition: 'box-shadow 0.35s linear',
          padding: '0px 10px 10px',
          margin: '0px -10px 20px'
        }
      : null;
    const putButtonBack = isAuthorView
      ? {
          right: '10px',
          top: '3px'
        }
      : null;

    return (
      <div
        className="component-debug-view"
        style={addBorder}
        ref={ref => (this._refContainer = ref)}
      >
        {props.component}
        <button
          className="author-view-button"
          style={putButtonBack}
          onClick={this.handleClick}
          data-tip
          data-for={props.uniqueKey}
        />
      </div>
    );
  }
}

export default AuthorTool;
