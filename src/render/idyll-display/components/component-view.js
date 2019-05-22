import React from 'react';
import Select from 'react-select';
import Context from '../../context';
import Component from './component';

class ComponentView extends React.PureComponent {
  static contextType = Context;
  constructor(props) {
    super(props);
  }

  render() {
    const { components } = this.context;
    return (
      <div className='component-view'>
        <div className='component-container'>
          {(components || []).map((component, i) => {
            return <Component key={i} component={component} />;
          })}
        </div>
      </div>
    );
  }
}

export default ComponentView;
