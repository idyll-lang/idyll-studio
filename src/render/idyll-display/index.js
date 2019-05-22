import React from 'react';
import Edit from './edit.js';
import Render from './render.js';
import Sidebar from './sidebar';
import { path } from 'change-case';
import { DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

class IdyllDisplay extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // TODO - get these values from the project config!
    };
  }

  render() {
    console.log(
      'rendering theme, ',
      this.state.theme,
      'layout, ',
      this.state.layout
    );
    return (
      <DragDropContextProvider backend={HTML5Backend}>
        <div className='grid'>
          <Sidebar />
          <div className='output-container'>
            <Render />
          </div>
        </div>
      </DragDropContextProvider>
    );
  }
}

export default IdyllDisplay;
