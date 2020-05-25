import * as React from 'react';
import Component from './component';

class ComponentAccordion extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      maxHeight: '0px',
    };

    this._panelRef = React.createRef();
  }

  handleClick = () => {
    const scrollHeight = this._panelRef.current.scrollHeight;
    this.setState({
      maxHeight: this.state.maxHeight === '0px' ? `${scrollHeight}px` : '0px',
    });

    console.log(this.state.maxHeight, scrollHeight);
  };

  render() {
    const { category, components } = this.props;

    return (
      <div style={{ margin: '0 -1em' }}>
        <button
          onClick={this.handleClick}
          style={{
            display: 'block',
            margin: 0,
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            padding: '1em',
          }}
          className='accordion-category'
        >
          <h3 style={{ margin: 0 }}>{category}</h3>
        </button>
        <div
          style={{
            maxHeight: this.state.maxHeight,
            overflow: 'hidden',
            transition: 'max-height 0.2s ease-out',
            width: '100%',
            paddingLeft: '10%',
          }}
          ref={this._panelRef}
        >
          {(components || []).map((component, i) => {
            return <Component key={i} component={component} />;
          })}
        </div>
      </div>
    );
  }
}

export default ComponentAccordion;
