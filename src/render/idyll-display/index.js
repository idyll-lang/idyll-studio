import * as React from 'react';
import Render from './render.js';
import Sidebar from './sidebar';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
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
    console.log(
      'rendering theme, ',
      this.state.theme,
      'layout, ',
      this.state.layout
    );
    return (
      <DndProvider backend={HTML5Backend}>
        <div
          className={'grid ' + (this.state.collapsed ? 'sidebar-collapse' : '')}
        >
          <Sidebar />
          <div className='output-container'>
            <Render />
            {this.context.activeComponent ? <AuthorView /> : <></>}
          </div>
        </div>
      </DndProvider>
    );
  }
}

export default IdyllDisplay;
