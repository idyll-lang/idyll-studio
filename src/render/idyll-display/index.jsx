import React from "react";
import Edit from "./edit.jsx";
import Render from "./render.jsx";

class IdyllDisplay extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currentMarkup: this.props.markup
    };

    this.handleChange = this.handleChange.bind(this);
  }

  // When editor detects changes, updates current markup
  // to the newMarkup passed in
  handleChange(newMarkup) {
    this.setState({ currentMarkup: newMarkup });
  }

  render() {
    const { markup } = this.props;
    const { currentMarkup } = this.state;

    return (
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Edit markup={markup} onChange={this.handleChange} />
        <Render markup={currentMarkup} />
      </div>
    );
  }
}

export default IdyllDisplay;
