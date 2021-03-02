import React from 'react';
import { DragSource } from 'react-dnd';
import { formatString } from '../../utils';
const { ipcRenderer } = require('electron');

import { COMPONENT_NAME_MAP } from '../../../../constants';

class Component extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  handleEditClick() {
    const { component } = this.props;
    ipcRenderer.send('client:editComponent', component);
  }
  handleDuplicateClick() {
    const { component } = this.props;
    ipcRenderer.send('client:duplicateComponent', component);
  }

  render() {
    const {
      component,
      isDragging,
      dragSource,
      dragPreview,
      searchValue,
      isCustom,
    } = this.props;
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
        className='component'>
        {dragPreview(
          <div className='component-name'>
            {name.toLowerCase
              ? COMPONENT_NAME_MAP[name.toLowerCase()] || name
              : name}
          </div>
        )}
        {isDragging ? null : (
          <div>
            {isCustom ? (
              <div
                className='component-edit'
                onClick={this.handleEditClick.bind(this)}>
                Edit
              </div>
            ) : null}
            <div
              className='component-duplicate'
              onClick={this.handleDuplicateClick.bind(this)}>
              Duplicate
            </div>
          </div>
        )}
      </div>
    );
  }
}

/**
 * Implement the drag source contract.
 */
const cardSource = {
  beginDrag: (props, monitor, component) => {
    props.handleDrag(true);
    return { component: props.component.name };
  },
  endDrag: (props, monitor, component) => {
    props.handleDrag(false);
  },
};

function collect(connect, monitor) {
  return {
    dragSource: connect.dragSource(),
    dragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
  };
}

export default DragSource('COMPONENT', cardSource, collect)(Component);
