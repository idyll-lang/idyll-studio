import React from "react";

// Stylings
const ViewContainer = {
  display: "flex",
  flexDirection: "row",
  height: "15vh",
  width: "50vw",
  marginBottom: "20px"
};

const ComponentContainer = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  width: "70%",
  overflow: "scroll",

  // Placeholder styling for now
  position: "relative",
  top: "10%",
  transform: "translateX(30%)",
  background: "beige",
  marginRight: "5%"
};

const Component = {
  width: "50px",
  height: "50px",
  padding: "15px",
  cursor: "pointer"
};

const Label = {
  backgroundColor: "beige",
  position: "relative",
  top: "30%",
  transform: "translateX(30%)",
  display: "flex",
  alignItems: "center",
  height: "8vh",
  padding: "3px",
  maxWidth: "15vw"
};

class ComponentView extends React.PureComponent {
  constructor(props) {
    super(props);

    this.displayComponents = this.displayComponents.bind(this);
    this.insertComponent = this.insertComponent.bind(this);
  }

  // Returns a component div that is clickable
  displayComponents(component) {
    return (
      <div
        key={component.name}
        className="component"
        style={Component}
        onClick={() => {
          this.insertComponent(component.name);
        }}
      >
        {component.name}
      </div>
    );
  }

  // Returns the text mapping between component and tag
  insertComponent(name) {
    var tagInfo = this.props.propsMap.get(name);
    var tag = "[" + tagInfo.name + " ";
    if (tagInfo.props != undefined) {
      tagInfo.props.forEach(prop => {
        tag += prop.name + ":" + prop.example + " ";
      });
    }
    if (tagInfo.tagType === "closed") {
      tag += " /]";
    } else {
      tag += "]";
      if (name === "equation") {
        tag += "y = \\int x^2 dx";
      }
      tag += "[/" + tagInfo.name + "]";
    }
    const { insertComponent } = this.props;
    insertComponent(tag);
  }

  render() {
    const { components } = this.props;
    return (
      <div id="component-view" style={ViewContainer}>
        <div className="label" style={Label}>
          Components
        </div>
        <div id="component-container" style={ComponentContainer}>
          {components.map(component => this.displayComponents(component))}
        </div>
      </div>
    );
  }
}

export default ComponentView;
