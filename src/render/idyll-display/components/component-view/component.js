import React from 'react';
import { DragSource } from 'react-dnd';

// {components && components.length ? (
//   <Select
//     style={{width: `50px`}}
//     placeholder='Select a component'
//     ref='select'
//     // on change callback
//     options={components.map(component => {
//       //console.log({ value: component, label: component.name });
//       return { value: component, label: component.name };
//     })}
//     onChange={({ value }) => {
//       const component = value;
//       this.insertComponent(component.name);
//     }}
//   />
// ) : null}

class Component extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const { component, isDragging, dragSource } = this.props;
    return dragSource(
      <div
        style={{
          opacity: isDragging ? 0.5 : 1,
        }}
        className='component'
      >
        {component.name}
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
