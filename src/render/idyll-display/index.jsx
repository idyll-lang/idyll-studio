import React from "react";
import Edit from "./edit.jsx";
import Render from "./render.jsx";

class IdyllDisplay extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { markup } = this.props;
    return (
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Edit markup={markup} />
        <Render markup={markup} />
      </div>
    );
  }
}

export default IdyllDisplay;
