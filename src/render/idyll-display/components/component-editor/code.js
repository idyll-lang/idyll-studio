import * as React from 'react';
import { getNodeById, getParentNodeById, getRandomId } from '../../utils/';
import { withContext } from '../../../context/with-context';
import EditableCodeCell from './code-cell';
import copy from 'fast-copy';

const AST = require('idyll-ast');
const compile = require('idyll-compiler');

/**
 * An AuthorView is associated with an active component.
 * If a component is registered as active, renders
 * a property list of all the components properties for editing.
 */
export default withContext(
  class Code extends React.PureComponent {
    constructor(props) {
      super(props);
    }

    getMarkup(props) {
      return AST.toMarkup({
        id: -1,
        type: 'component',
        name: 'div',
        children: [props.context.activeComponent],
      });
    }

    onExecute(newMarkup) {
      this.updateAst(newMarkup);
    }

    onBlur(newMarkup) {}

    updateAst(newMarkup) {
      const { context } = this.props;

      const output = compile(newMarkup || this.getMarkup(this.props), {
        async: false,
      });

      let node = output.children[0]; // text container or actual component
      if (node.type === 'component' && node.name === 'TextContainer') {
        node = node.children[0];
      }

      node.id = context.activeComponent.id;
      const astCopy = copy(context.ast);
      if (!node.children || node.children.length === 0) {
        const targetNode = getNodeById(astCopy, context.activeComponent.id);

        Object.keys(node).forEach((key) => {
          if (key === 'id') {
            return;
          }
          targetNode[key] = node[key];
        });
      } else {
        const parentNode = getParentNodeById(
          astCopy,
          context.activeComponent.id
        );
        if (!parentNode) {
          console.warn('Could not identify parent node');
          return;
        }

        const childIdx = (parentNode.children || []).findIndex(
          (c) => c.id === context.activeComponent.id
        );

        for (let i = 0; i < node.children.length; i++) {
          node.children[i].id = context.activeComponent.children[i].id;
        }

        // parentNode.children.splice(childIdx, 0, ...node);
        parentNode.children = parentNode.children
          .slice(0, childIdx)
          .concat(node)
          .concat(parentNode.children.slice(childIdx + 1));
      }

      context.setAst(astCopy);
      context.setActiveComponent(node);
    }

    render() {
      return (
        <div className={'idyll-code-editor'}>
          <EditableCodeCell
            onExecute={this.onExecute.bind(this)}
            onBlur={this.onBlur.bind(this)}
            markup={this.getMarkup(this.props)}
          />
          <div
            className={'code-instructions'}
            style={{
              color: '#ccc',
              fontSize: 10,
              fontStyle: 'italic',
              margin: '5px 16px',
              display: 'flex',
              justifyContent: 'space-between',
            }}>
            <div>shift + enter to execute</div>
            <div>
              <a
                target='_blank'
                style={{ color: '#ccc', textDecoration: 'underline' }}
                href={'https://idyll-lang.org/docs/syntax'}>
                Syntax Guide
              </a>
            </div>
          </div>
        </div>
      );
    }
  }
);
