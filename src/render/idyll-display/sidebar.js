import React from 'react';

class Sidebar extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.ast) {
      console.log('ast in sidebar');
    } else {
      console.log('ast not defined in sidebar');
    }
    return <div>This is a div sidebar</div>
  }
}

export default Sidebar;
