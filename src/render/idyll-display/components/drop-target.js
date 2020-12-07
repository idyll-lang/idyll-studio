import React from 'react';
import { DropTarget } from 'react-dnd';
import Context from '../../context/context';
const compile = require('idyll-compiler');
const idyllAST = require('idyll-ast');

const getRandomId = () => {
  return Math.floor(Math.random() * 10000000000) + 100000000;
};
class ComponentDropTarget extends React.PureComponent {
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
      tagInfo.props.forEach((prop) => {
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
    const { insertBefore, insertAfter } = this.props;
    const { ast } = this.context;

    let targetNode;
    let position;
    if (insertBefore !== undefined) {
      targetNode = insertBefore;
      position = 'BEFORE';
    } else {
      targetNode = insertAfter;
      position = 'AFTER';
    }

    console.log('Searching for ', targetNode, position);
    compile(componentMarkup).then((componentAST) => {
      let componentNode = componentAST.children[0];
      if (componentNode.name === 'TextContainer') {
        componentNode = componentNode.children[0];
      }
      componentNode.id = getRandomId();
      console.log('component node', componentNode);

      const handleNode = (node) => {
        let foundMatch = false;
        let matchIndex = -1;
        if (!node.children || !node.children.length) {
          return false;
        }
        for (var i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          if (child.id === targetNode) {
            foundMatch = true;
            matchIndex = i;
            break;
          }
        }

        if (foundMatch) {
          console.log('Found match in node', node);
          const idx = position === 'BEFORE' ? matchIndex : matchIndex + 1;
          const before = node.children.slice(0, idx);
          const after = node.children.slice(idx);
          console.log('before', before);
          console.log('after', after);
          node.children = [...before, componentNode, ...after];
          console.log('New children', node.children);
          return true;
        }

        for (var i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          const updated = handleNode(child);
          if (updated) {
            return true;
          }
        }

        return false;
      };

      for (var i = 0; i < ast.children.length; i++) {
        const child = ast.children[i];
        const updated = handleNode(child);
        if (updated) {
          break;
        }
      }

      this.context.setAst(ast); // must pass info up level
    });
  }

  render() {
    const { isOver, dropTarget } = this.props;
    return dropTarget(
      <div
        style={{
          width: '100%',
          height: isOver ? 65 : 10,
          border: isOver ? '#999999'  :  'none',
          borderWidth: isOver ? 2  :  0,
          background: isOver ? '#666666' : 'none',
          transition: 'all 1s'
        }}
      ></div>
    );
  }
}

const componentBlockTarget = {
  drop(props, monitor, component) {
    // console.log('dropped', monitor.getItem());
    // console.log('dropped props', props);
    // console.log('dropped component', component);
    component.insertComponent(monitor.getItem().component);
  },
};

function collect(connect, monitor) {
  return {
    dropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  };
}

export default DropTarget(
  'COMPONENT',
  componentBlockTarget,
  collect
)(ComponentDropTarget);
