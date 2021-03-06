import * as React from 'react';
import Render from './render.js';
import Sidebar from './sidebar';
import { ipcRenderer } from 'electron';
import { WrappedAuthorView } from './components/author-view';
import { WrappedUndoRedo } from './components/undo-redo';
import Context from '../context/context';
import { RENDER_WINDOW_NAME } from '../../constants.js';
import { IS_VISIBLE } from './components/drop-target.js';
import { getDistance } from './utils';

class IdyllDisplay extends React.PureComponent {
  static contextType = Context;

  constructor(props) {
    super(props);
    this.state = {
      // TODO - get these values from the project config!
      collapsed: false,
      mouseCoordinates: { x: 0, y: 0 },
      trackMouse: false,
    };

    this.nearestDropTarget = null;
  }

  componentDidMount() {
    ipcRenderer.on('toggleSidebar', () => this.handleToggle());

    this.outputContainer = document.getElementsByClassName(
      RENDER_WINDOW_NAME
    )[0];

    this.outputContainer.addEventListener(
      'dragover',
      this.trackMouse.bind(this)
    );
  }

  componentWillUnmount() {
    this.outputContainer.removeEventListener(
      'dragover',
      this.trackMouse.bind(this)
    );
  }

  handleToggle() {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  handleDrop(scrollPosition) {
    setTimeout(() => {
      this.outputContainer.scrollTo(0, scrollPosition);
    }, 1500);

    this.setState({
      trackMouse: false,
    });
  }

  trackMouse(e) {
    if (this.state.trackMouse) {
      const coordinates = { x: e.pageX, y: e.pageY };

      const hoveredElements = document.elementsFromPoint(
        coordinates.x,
        coordinates.y
      );

      if (
        !hoveredElements.some((element) =>
          element.classList.contains('editable-text')
        )
      ) {
        const dropTargets = [...document.querySelectorAll(`.${IS_VISIBLE}`)];

        const nearest = dropTargets.reduce((prev, current) => {
          const prevCoordinates = prev.getBoundingClientRect();
          const prevDistance = getDistance(coordinates, {
            x: prevCoordinates.x,
            y: prevCoordinates.y,
          });

          const currentCoordinates = current.getBoundingClientRect();
          const currentDistance = getDistance(coordinates, {
            x: currentCoordinates.x,
            y: currentCoordinates.y,
          });

          return prevDistance < currentDistance ? prev : current;
        });

        if (nearest !== this.nearestDropTarget) {
          if (this.nearestDropTarget !== null) {
            this.nearestDropTarget.classList.remove('is-dragging');
          }
          this.nearestDropTarget = nearest;
        }

        nearest.classList.add('is-dragging');
      } else {
      }
    }
  }

  trackComponentDrag(isDragging) {
    this.setState({
      trackMouse: isDragging,
    });

    if (!isDragging) {
      this.nearestDropTarget.classList.remove('is-dragging');
    }
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
          <Sidebar handleDrag={this.trackComponentDrag.bind(this)} />
          <div className={RENDER_WINDOW_NAME}>
            <Render
              handleDrop={this.handleDrop.bind(this)}
              coordinates={this.state.mouseCoordinates}
            />
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
