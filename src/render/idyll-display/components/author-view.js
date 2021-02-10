import * as React from 'react';
import { getNodeById, throttle, getUpdatedPropertyList } from '../utils/';
import { withContext } from '../../context/with-context';
import { DEBOUNCE_PROPERTY_MILLISECONDS } from '../../../constants';
import Properties from './component-editor/properties';
import Code from './component-editor/code';
import Styles from './component-editor/styles';

/**
 * An AuthorView is associated with an active component.
 * If a component is registered as active, renders
 * a property list of all the components properties for editing.
 */
export const WrappedAuthorView = withContext(
  class AuthorView extends React.PureComponent {
    constructor(props) {
      super(props);

      this.state = {
        activeDomNode: null,
        dimensions: null,
        selectedView: 'properties'
      };
    }

    componentWillUnmount() {
      this.props.context.setActiveComponent(null);
      window.removeEventListener('resize', this.handleWindowEvent);

      const parent = document.getElementsByClassName('output-container')[0];
      parent.removeEventListener('scroll', this.handleWindowEvent);
    }

    componentDidMount() {
      window.addEventListener('resize', this.handleWindowEvent);

      const parent = document.getElementsByClassName('output-container')[0];
      parent.addEventListener('scroll', this.handleWindowEvent);
    }

    componentDidUpdate(prevProps) {
      const { context } = this.props;
      const isValidActiveComponent =
        context.activeComponent &&
        Object.keys(context.activeComponent).length != 0;

      // update which dom node represents the "active" component being worked on
      if (
        prevProps.context.activeComponent != context.activeComponent &&
        isValidActiveComponent
      ) {
        const activeComponentDomNode = document.getElementById(
          context.activeComponent.name + '-' + context.activeComponent.id
        );

        if (activeComponentDomNode) {
          this.setState({
            activeDomNode: activeComponentDomNode,
            dimensions: activeComponentDomNode.getClientRects()[0]
          });
        } else {
          this.setState({
            activeDomNode: null,
            dimensions: null
          });
        }
      } else if (!isValidActiveComponent && prevProps.context.activeComponent) {
        this.setState({
          activeDomNode: null,
          dimensions: null
        });
      }
    }

    /**
     * On scroll or resize events, stores the new dimensions
     * of the active component
     */
    handleWindowEvent = () => {
      if (this.state.activeDomNode) {
        const activeComponentDimensions = this.state.activeDomNode.getClientRects();

        this.setState({
          dimensions: activeComponentDimensions[0]
        });
      }
    };

    close() {
      this.props.context.setActiveComponent(null);
    }

    renderInner() {
      switch (this.state.selectedView) {
        case 'properties':
          return <Properties />;
        case 'code':
          return <Code />;
        case 'style':
          return <Styles />;
        default:
          return null;
      }
    }

    render() {
      const { activeComponent } = this.props.context;
      const { dimensions, selectedView } = this.state;

      if (activeComponent && dimensions) {
        return (
          <div
            className='author-view-overlay'
            style={{
              top: dimensions.top + 30,
              left: dimensions.left - 10
            }}>
            <div className='author-view-overlay-header'>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div
                  className={
                    'author-view-overlay-header-button author-view-overlay-header-close-button'
                  }
                  onClick={() => {
                    this.close();
                  }}>
                  ×
                </div>
                <div
                  className={`author-view-overlay-header-button ${
                    selectedView === 'properties' ? 'selected' : ''
                  }`}
                  onClick={() => {
                    this.setState({ selectedView: 'properties' });
                  }}>
                  Properties
                </div>
                <div
                  className={`author-view-overlay-header-button ${
                    selectedView === 'code' ? 'selected' : ''
                  }`}
                  onClick={() => {
                    this.setState({ selectedView: 'code' });
                  }}>
                  Markup
                </div>
                <div
                  className={`author-view-overlay-header-button ${
                    selectedView === 'style' ? 'selected' : ''
                  }`}
                  onClick={() => {
                    this.setState({ selectedView: 'style' });
                  }}>
                  Styles
                </div>
              </div>
            </div>
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {this.renderInner()}
            </div>
          </div>
        );
      }
      return <></>;
    }
  }
);
