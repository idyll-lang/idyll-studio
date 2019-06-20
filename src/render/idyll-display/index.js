import React from 'react';
import Edit from './edit.js';
import Render from './render.js';
import Sidebar from './sidebar';
import { path } from 'change-case';
import { DragDropContextProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
const { ipcRenderer } = require('electron');

class IdyllDisplay extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // TODO - get these values from the project config!
      collapsed: false
    };
  }

  componentDidMount(){
    ipcRenderer.on('toggleSidebar', () => this.handleToggle());
  }

  handleToggle() {
    this.setState({
      collapsed: !this.state.collapsed
    });
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
        <div className={'grid ' + (this.state.collapsed ? 'sidebar-collapse' : '')}>
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
