import React from 'react';
import Select from 'react-select';
import Context from '../../context';

const getRandomId = () => {
  return Math.floor(Math.random() * 10000000000) + 100000000;
};
const compile = require('idyll-compiler');
const idyllAST = require('idyll-ast');

class ComponentView extends React.PureComponent {
  static contextType = Context;
  constructor(props) {
    super(props);

    this.insertComponent = this.insertComponent.bind(this);
    this.handleASTChange = this.handleASTChange.bind(this);
  }

  // Generates the tag associated with the given component name
  insertComponent(name) {
    var tagInfo = this.context.propsMap.get(name);
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
      // Manipulate TextContainer child of current AST and update
      var ast = this.context.ast;
      var lastChild = ast.children[ast.children.length - 1];
      if (
        lastChild.name === 'TextContainer' &&
        componentAST.children[0].name === 'TextContainer'
      ) {
        // Collapse component textcontainer and add component to existing
        // text container
        var textContainer = lastChild;
        componentAST.children[0].children.forEach(node => {
          node.id = getRandomId();
          textContainer.children.push(node);
        });
      } else {
        // append to root for other cases
        var componentNode = componentAST.children[0];
        componentNode.id = +uuidv4().replace(/-/g, '');
        ast = idyllAST.appendNode(ast, componentNode);
      }

      this.context.setAst(ast); // must pass info up level
    });
  }

  render() {
    const { components } = this.context;
    return (
      <div className='component-view'>
        <div className='label'>Components</div>
        <div className='component-container'>
          {components && components.length ? (
            <Select
              style={{ width: `50px` }}
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
