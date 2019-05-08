import React from 'react';
import Edit from './edit.js';
import Render from './render.js';
import Sidebar from './sidebar';
import { path } from 'change-case';

class IdyllDisplay extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // TODO - get these values from the project config!
    };
  }

  render() {
    console.log('rendering theme, ', this.state.theme, 'layout, ', this.state.layout);
    return (
        <div className='grid'>
          <Sidebar />
          <div className='output-container'>
            <Render />
          </div>
        </div>
    );
  }
}

export default IdyllDisplay;
