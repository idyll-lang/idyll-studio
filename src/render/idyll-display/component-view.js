import React from "react";
import Select from "react-select";

class ComponentView extends React.PureComponent {
  constructor(props) {
    super(props);

    this.insertComponent = this.insertComponent.bind(this);
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
      var children = tagInfo.children !== undefined ? tagInfo.children[0] : "";
      tag += "]" + children + "[/" + tagInfo.name + "]";
    }
    const { insertComponent } = this.props;
    insertComponent(tag);
  }

  render() {
    const { components } = this.props;
    console.log("components", components);
    return (
      <div className="component-view">
        <div className="label">Components</div>
        <div className="component-container">
          {components && components.length ? (
            <Select
              placeholder="Select a component"
              ref="select"
              // on change callback
              options={components.map(component => {
                console.log({ value: component, label: component.name });
                return { value: component, label: component.name };
              })}
              onChange={({ value }) => {
                const component = value;
                console.log("you selected", component);
                this.insertComponent(component.name);
              }}
            />
          ) : null}
        </div>
      </div>
    );
  }
}

export default ComponentView;
