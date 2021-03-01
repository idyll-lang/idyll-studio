import React from 'react';
import { DropTarget } from 'react-dnd';
import { RENDER_WINDOW_NAME } from '../../../constants';
import Context from '../../context/context';
import { getRandomId } from '../utils';
const compile = require('idyll-compiler');

const BASE_CLASS_NAME = 'idyll-studio-drop-target';

const componentBlockTarget = {
  drop(props, monitor, component) {
    const visibleDropTargets = document.querySelectorAll('.is-dragging');
    component.insertComponent(monitor.getItem().component, visibleDropTargets);
  },
};

function collect(connect, monitor) {
  return {
    dropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  };
}

// export default DropTarget(
//   'COMPONENT',
//   componentBlockTarget,
//   collect
// )();

const withDropListener = (callback) => {
  return class ComponentDropTarget extends React.PureComponent {
    static contextType = Context;

    constructor(props) {
      super(props);

      this.state = {
        isIntersecting: false,
      };

      this.insertComponent = this.insertComponent.bind(this);
      this.handleASTChange = this.handleASTChange.bind(this);

      this._ref = React.createRef();
    }

    componentDidMount() {
      // const viewport = document.querySelector(`.${RENDER_WINDOW_NAME}`);
      const options = {
        root: null,
        threshold: 0.1,
      };

      this.observer = new IntersectionObserver(([entry]) => {
        this.setState({
          isIntersecting: entry.isIntersecting,
        });
      }, options);
      this.observer.observe(this._ref.current);
    }

    componentWillUnmount() {
      this.observer.disconnect();
    }

    // Generates the tag associated with the given component name
    insertComponent(name, visibleDropTargets) {
      var tagInfo = this.context.propsMap.get(name);

      var tag = '[' + tagInfo.name + ' ';
      if (tagInfo.props !== undefined) {
        tagInfo.props
          .filter((prop) => prop.example !== undefined)
          .forEach((prop) => {
            tag += prop.name + ':' + prop.example + ' ';
          });
      }
      if (tagInfo.tagType === 'closed') {
        tag += ' /]';
      } else {
        var children =
          tagInfo.children !== undefined ? tagInfo.children[0] : '';
        tag += ']' + children + '[/' + tagInfo.name + ']';
      }
      this.handleASTChange(tag, visibleDropTargets);
    }

    // Given String tag of component, adds corresponding nodes to ast
    // and sends modified ast back up to top level
    handleASTChange(componentMarkup, visibleDropTargets) {
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

      compile(componentMarkup).then((componentAST) => {
        let componentNode = componentAST.children[0];
        while (
          componentNode.name &&
          (componentNode.name.toLowerCase() === 'textcontainer' ||
            componentNode.name.toLowerCase() === 'text-container')
        ) {
          componentNode = componentNode.children[0];
        }

        componentNode.id = getRandomId();

        (componentNode.children || []).forEach((child) => {
          child.id = getRandomId();
        });

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
            const idx = position === 'BEFORE' ? matchIndex : matchIndex + 1;
            const before = node.children.slice(0, idx);
            const after = node.children.slice(idx);
            node.children = [...before, componentNode, ...after];
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

        let numBefore = 0;

        visibleDropTargets.forEach((target, i) => {
          if (target === this._ref.current) {
            numBefore = i;
          }
        });

        const height = this._ref.current.getBoundingClientRect().height;
        const scrollPosition = document.getElementsByClassName(
          RENDER_WINDOW_NAME
        )[0].scrollTop;

        this.context.setAst(ast); // must pass info up level
        if (callback) {
          callback(scrollPosition, height);
        }
      });
    }

    render() {
      const { isIntersecting } = this.state;
      const { canDrop, isOver, dropTarget } = this.props;

      return dropTarget(
        <div
          className={`${BASE_CLASS_NAME} ${isOver ? 'is-over' : ''} ${
            canDrop && isIntersecting ? 'is-dragging' : ''
          }`}
          ref={this._ref}
        />
      );
    }
  };
};

export const WrappedDropTarget = (callback) =>
  DropTarget(
    'COMPONENT',
    componentBlockTarget,
    collect
  )(withDropListener(callback));
