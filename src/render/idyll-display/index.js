import * as React from 'react';
import Render from './render.js';
import Sidebar from './sidebar';
import { ipcRenderer } from 'electron';
import { WrappedAuthorView } from './components/author-view';
import { WrappedUndoRedo } from './components/undo-redo';
import Context from '../context/context';

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
            'grid ' +
            (this.state.collapsed || this.context.showPreview
              ? 'sidebar-collapse'
              : '')
          }>
          <Sidebar />
          <div className='output-container'>
            <Render />
            {this.context.showPreview ? null : <WrappedAuthorView />}
            {this.context.showPreview ? null : <WrappedUndoRedo />}

            {this.context.showPreview ? (
              <div
                style={{
                  padding: '5px 10px',
                  color: '#fff',
                  background: '#333',
                  position: 'fixed',
                  bottom: '1em',
                  left: 'calc(300px + 1em)',
                  cursor: 'pointer'
                }}
                onClick={this.context.toggleShowPreview}>
                ← Edit
              </div>
            ) : null}
          </div>
        </div>
      </>
    );
  }
}

export default IdyllDisplay;
