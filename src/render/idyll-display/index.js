import React from "react";
import Edit from "./edit.js";
import Render from "./render.js";
import ComponentView from "./component-view.js";

class IdyllDisplay extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currentMarkup: this.props.markup,
      newMarkup: ""
    };
    this.handleChange = this.handleChange.bind(this);
    this.insertNewComponent = this.insertNewComponent.bind(this);
  }

  // When editor detects changes, updates current markup
  // to the newMarkup passed in
  handleChange(newMarkup) {
    this.setState({ currentMarkup: newMarkup });
    const { onChange } = this.props;
    if (onChange) {
      onChange(newMarkup);
    }
  }

  // Update renderer to reflect newly uploaded file
  // if previous markup is any different from current
  componentDidUpdate(prevProps) {
    if (this.props.markup !== prevProps.markup) {
      this.handleChange(this.props.markup);
    }
  }

  // Insert a new component into editor and renderer given
  // component tag
  insertNewComponent(componentTag) {
    var markup = this.state.currentMarkup + "\n" + componentTag;
    this.setState({ currentMarkup: markup });
    // this.setState({ newMarkup: "\n" + componentTag });

    // TODO: find working way to update editor state
  }

  render() {
    const { markup, components } = this.props;
    const { currentMarkup, newMarkup } = this.state;

    return (
      <div>
        <ComponentView
          components={components}
          insertNewComponent={this.insertNewComponent}
        />
        <div style={{ display: "flex", flexDirection: "row" }}>
          <Edit markup={markup + newMarkup} onChange={this.handleChange} />
          <Render markup={currentMarkup} components={components} />
        </div>
      </div>
    );
  }
}

export default IdyllDisplay;
