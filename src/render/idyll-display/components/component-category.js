import * as React from 'react';
import Component from './component';

class ComponentCategory extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const { category, components } = this.props;

    return (
      <div>
        <h2>{category}</h2>
        {(components || []).map((component, i) => {
          console.log(component);
          return <Component key={i} component={component} />;
        })}
      </div>
    );
  }
}

export default ComponentCategory;
