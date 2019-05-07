import React from 'react';

class UserView extends React.PureComponent {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.handleComponentChange(this.props.idyllASTNode);
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