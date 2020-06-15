import * as React from 'react';
import Component from './component';
import { Arrow } from './icons/arrow';

class ComponentAccordion extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      maxHeight: '0px',
      isClosed: true,
    };

    this._panelRef = React.createRef();
  }

  handleClick = () => {
    const scrollHeight = this._panelRef.current.scrollHeight;
    this.setState({
      maxHeight: this.state.maxHeight === '0px' ? `${scrollHeight}px` : '0px',
      isClosed: !this.state.isClosed,
    });
  };

  render() {
    const { category, components } = this.props;
    const { isClosed } = this.state;

    return (
      <div className="component-category">
        <button onClick={this.handleClick} className="accordion-category">
          <Arrow isClosed={isClosed} />
          <h3 style={{ margin: 0 }}>{category}</h3>
        </button>
        <div
          style={{
            maxHeight: this.state.maxHeight,
          }}
          className="accordion-panel-container"
          ref={this._panelRef}>
          <div
            style={{
              maxHeight: this.state.maxHeight,
              borderLeft: '1px solid black',
              opacity: '11%',
              marginLeft: '2em',
            }}
          />
          <div style={{ margin: '0 -2em', width: '100%' }}>
            {(components || []).map((component, i) => {
              return <Component key={i} component={component} />;
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default ComponentAccordion;
