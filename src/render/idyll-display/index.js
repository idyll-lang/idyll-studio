import * as React from 'react';
import Render from './render.js';
import Sidebar from './sidebar';
import { ipcRenderer } from 'electron';
import { WrappedAuthorView } from './components/author-view';
import { WrappedUndoRedo } from './components/undo-redo';
import Context from '../context/context';

import './components/custom-editors/bitmap';

class IdyllDisplay extends React.PureComponent {
  static contextType = Context;

  constructor(props) {
    super(props);
    this.state = {
      // TODO - get these values from the project config!
      collapsed: false
    };
  }

  componentDidMount() {
    ipcRenderer.on('toggleSidebar', () => this.handleToggle());
  }

  handleToggle() {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  render() {
    return (
      <>
        <div
          className={
            'grid ' + (this.state.collapsed ? 'sidebar-collapse' : '')
          }>
          <Sidebar />
          <div className='output-container'>
            <Render />
            <WrappedAuthorView />
            <WrappedUndoRedo />
          </div>
        </div>
      </>
    );
  }
}

export default IdyllDisplay;
