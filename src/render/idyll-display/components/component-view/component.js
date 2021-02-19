import React from 'react';
import { DragSource } from 'react-dnd';
import { formatString } from '../../utils';
const { ipcRenderer } = require('electron');






const nameMap = {
  'text container': 'Paragraph',
  'display': 'Display Value'
}

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
    // open(component.path);
  }

  render() {
    const { component, isDragging, dragSource, searchValue, isCustom } = this.props;
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
          opacity: isDragging ? 0.5 : 1
        }}
        className='component'>
          <div>
            {name.toLowerCase ? (nameMap[name.toLowerCase()] || name) : name}
          </div>
          {
            (isDragging || !isCustom) ? null : (
              <div>
                <div className="component-edit" onClick={this.handleEditClick.bind(this)}>
                  Edit
                </div>
                {/* <div className="component-duplicate" onClick={this.handleEditClick.bind(this)}>
                  Duplicate
                </div> */}
              </div>
            )
          }
      </div>
    );
  }
}

/**
 * Implement the drag source contract.
 */
const cardSource = {
  beginDrag: props => ({ component: props.component.name })
};

function collect(connect, monitor) {
  return {
    dragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

export default DragSource('COMPONENT', cardSource, collect)(Component);
