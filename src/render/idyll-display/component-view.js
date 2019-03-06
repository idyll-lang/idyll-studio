import React from 'react';
import Select from 'react-select';
const compile = require('idyll-compiler');
const idyllAST = require('idyll-ast');

class ComponentView extends React.PureComponent {
  constructor(props) {
    super(props);

    this.insertComponent = this.insertComponent.bind(this);
    this.handleASTChange = this.handleASTChange.bind(this);
  }

  // Generates the tag associated with the given component name
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
    this.handleASTChange(tag);
  }

  // Given String tag of component, adds corresponding nodes to ast
  // and sends modified ast back up to top level
  handleASTChange(componentMarkup) {
    compile(componentMarkup).then(componentAST => {
      // grab last id by walking rightmost children of tree
      console.log(componentAST);
      var currNode = this.props.ast;
      while (
        currNode.children !== undefined &&
        currNode.children.length !== 0
      ) {
        currNode = currNode.children[currNode.children.length - 1];
      }

      // Assign ids to componentAST
      // children nodes + curr node
      var numCompNodes = componentAST.children[0].children.length + 1;
      var currID = currNode.id + numCompNodes + 1;
      idyllAST.walkNodes(componentAST, node => {
        node.id = currID;
        currID -= 1;
      });

      // Manipulate TextContainer child of current AST and update
      // TODO: Scroller special case
      var ast = this.props.ast;
      var textContainer = ast.children[ast.children.length - 1];
      componentAST.children[0].children.forEach(node => {
        textContainer.children.push(node);
      });

      const { handleASTChange } = this.props;
      handleASTChange(ast); // must pass info up level
    });
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
