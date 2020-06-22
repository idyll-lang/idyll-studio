import React from 'react';
import { DragSource } from 'react-dnd';
import { formatString } from '../../utils';

class Component extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const { component, isDragging, dragSource, searchValue } = this.props;

    let name = formatString(component.name);

    if (searchValue && searchValue.length > 0) {
      let boldIndex =
        name.toLowerCase().indexOf(searchValue.toLowerCase()) +
        searchValue.length;
      name = (
        <>
          <strong>{name.substring(0, boldIndex)}</strong>
          {name.substring(boldIndex)}
        </>
      );
    }

    return dragSource(
      <div
        style={{
          opacity: isDragging ? 0.5 : 1,
        }}
        className="component">
        {name}
      </div>
    );
  }
}

/**
 * Implement the drag source contract.
 */
const cardSource = {
  beginDrag: (props) => ({ component: props.component.name }),
};

function collect(connect, monitor) {
  return {
    dragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  };
}

export default DragSource('COMPONENT', cardSource, collect)(Component);
