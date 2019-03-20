import React from 'react';

class UserView extends React.PureComponent {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    console.log(this.props.idyllASTNode);
    this.props.handleComponentChange(this.props.component);
  }

  render() {
    return (
      <div>
        {this.props.component}
        <button onClick={this.handleClick}>Click to see this comp. in sidebar</button>
      </div>
    );
  }
}

export default UserView;