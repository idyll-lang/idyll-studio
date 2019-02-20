import React from 'react';
import Select from 'react-select';

class ComponentView extends React.PureComponent {
  constructor(props) {
    super(props);

    this.insertComponent = this.insertComponent.bind(this);
  }

  // Inserts the tag associated with the given component name

  //   component : Represents an Idyll component.
  // textnode: Represents an Idyll textnode.
  // var: Represents a variable declaration in Idyll.
  // derive: Represents a derived variable. In Idyll, it represents a variable whose value is derived from other variables.
  // data: Represents a dataset in Idyll. In Idyll, datasets act like variables, but instead of value, they have a source field.
  insertComponent(name) {
    var tagInfo = this.props.propsMap.get(name);
    var tag = '[' + tagInfo.name + ' ';
    if (tagInfo.props !== undefined) {
      tagInfo.props.forEach(prop => {
        tag += prop.name + ':' + prop.example + ' ';
      });
    }
    if (tagInfo.tagType === 'closed') {
      tag += ' /]';
    } else {
      var children = tagInfo.children !== undefined ? tagInfo.children[0] : '';
      tag += ']' + children + '[/' + tagInfo.name + ']';
    }
    const { insertComponent } = this.props;
    insertComponent(tag); // must pass info up level
  }

  render() {
    const { components } = this.props;
    return (
      <div className='component-view'>
        <div className='label'>Components</div>
        <div className='component-container'>
          {components && components.length ? (
            <Select
              placeholder='Select a component'
              ref='select'
              // on change callback
              options={components.map(component => {
                //console.log({ value: component, label: component.name });
                return { value: component, label: component.name };
              })}
              onChange={({ value }) => {
                const component = value;
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
