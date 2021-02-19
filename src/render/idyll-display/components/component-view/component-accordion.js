import * as React from 'react';
import Component from './component';
import { Arrow } from './icons/arrow';

class ComponentAccordion extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      maxHeight: '0px',
      isClosed: true
    };

    this._panelRef = React.createRef();
  }

  /**
   * Collapses and opens the accordion panel containing all the components
   */
  handleClick = () => {
    const scrollHeight = this._panelRef.current.scrollHeight;
    this.setState({
      maxHeight: this.state.maxHeight === '0px' ? `${scrollHeight}px` : '0px',
      isClosed: !this.state.isClosed
    });
  };

  render() {
    const { category, components, isCustom } = this.props;
    const { isClosed } = this.state;

    return (
      <div className='component-category'>
        <button onClick={this.handleClick} className='accordion-category'>
          <Arrow isClosed={isClosed} />
          <h3 style={{ margin: 0 }}>{category}</h3>
        </button>

        <div
          style={{
            maxHeight: this.state.maxHeight
          }}
          className='accordion-panel-container'
          ref={this._panelRef}>
          <div
            className='accordion-line'
            style={{ maxHeight: this.state.maxHeight }}
          />

          <div className='accordion-component'>
            {(components || []).map((component, i) => {
              return <Component key={i} component={component} isCustom={isCustom} />;
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default ComponentAccordion;
