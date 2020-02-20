import * as React from 'react';
import Render from './render.js';
import Sidebar from './sidebar';
import { ipcRenderer } from 'electron';
import AuthorView from './components/author-view';
import Context from '../context';

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
    const { activeComponent } = this.context;
    return (
      <>
        <div
          className={'grid ' + (this.state.collapsed ? 'sidebar-collapse' : '')}
        >
          <Sidebar />
          <div className='output-container'>
            <Render />
            <AuthorView
              activeId={
                activeComponent
                  ? this.context.activeComponent.name +
                    '-' +
                    this.context.activeComponent.id
                  : ''
              }
            />
          </div>
        </div>
      </>
    );
  }
}

export default IdyllDisplay;
