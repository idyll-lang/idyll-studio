import * as React from 'react';
import Render from './render.js';
import Sidebar from './sidebar';
import { ipcRenderer } from 'electron';
import { WrappedAuthorView } from './components/author-view';
import { WrappedUndoRedo } from './components/undo-redo';
import Context from '../context/context';
import { RENDER_WINDOW_NAME } from '../../constants.js';

class IdyllDisplay extends React.PureComponent {
  static contextType = Context;

  constructor(props) {
    super(props);
    this.state = {
      // TODO - get these values from the project config!
      collapsed: false,
      isLoading: false,
    };
  }

  componentDidMount() {
    ipcRenderer.on('toggleSidebar', () => this.handleToggle());
  }

  handleToggle() {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  handleDrop(scrollPosition, height) {
    const outputContainer = document.getElementsByClassName(
      RENDER_WINDOW_NAME
    )[0];

    this.setState({ isLoading: true });
    setTimeout(() => {
      outputContainer.scrollTo(0, scrollPosition - height);
      this.setState({ isLoading: false });
    }, 1500);

    console.log(this.context.ast);
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
          <div className={RENDER_WINDOW_NAME}>
            {this.state.isLoading ? <div className='drop-overlay' /> : <></>}
            <Render handleDrop={this.handleDrop.bind(this)} />
            {this.context.showPreview ? null : <WrappedAuthorView />}
            {this.context.showPreview ? null : <WrappedUndoRedo />}

            {this.context.showPreview ? (
              <div
                style={{
                  position: 'fixed',
                  bottom: '1em',
                  left: 'calc(300px + 1em)',
                  display: 'flex',
                }}>
                <div
                  style={{
                    padding: '5px 10px',
                    color: '#fff',
                    background: '#333',
                    cursor: 'pointer',
                  }}
                  onClick={this.context.toggleShowPreview}>
                  ← Edit
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </>
    );
  }
}

export default IdyllDisplay;
