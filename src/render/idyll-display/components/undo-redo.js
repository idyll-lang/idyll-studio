import * as React from 'react';
import PropertyList from './property-list';
import { getNodeById, throttle, getUpdatedPropertyList } from '../utils/';
import { withContext } from '../../context/with-context';
import { DEBOUNCE_PROPERTY_MILLISECONDS } from '../../../constants';

/**
 * An UndoRedo is associated with an active component.
 * If a component is registered as active, renders
 * a property list of all the components properties for editing.
 */
export const WrappedUndoRedo = withContext(
  class UndoRedo extends React.PureComponent {
    constructor(props) {
      super(props);
    }

    render() {
      const { canUndo, canRedo, undo, redo } = this.props.context;
      const  buttonStyles = {
        background: 'rgba(0, 0, 0, 0.8)',
        color: '#ffffff',
        padding: '5px 0.5em 3px  0.5em',
        width: 50,
        display: 'block',
        fontSize: 12,
        marginRight: '0.5em',
        border: 'none',
        cursor: 'pointer'
      }

      return (
        <div style={{display: 'flex', position: 'absolute', bottom: '1em', right: '1em'}}>
          <button onClick={() => { undo() }} disabled={!canUndo()} style={buttonStyles}>Undo</button>
          <button onClick={() => { redo() }}  disabled={!canRedo()} style={buttonStyles}>Redo</button>
        </div>
      )
    }
  }
);
