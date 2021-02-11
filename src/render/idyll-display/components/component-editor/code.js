import * as React from 'react';
import { getNodeById, getParentNodeById, getRandomId } from '../../utils/';
import { withContext } from '../../../context/with-context';
import EditableCodeCell from './code-cell';

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
        children: [props.context.activeComponent]
      });
    }

    onExecute(newMarkup) {
      this.updateAst(newMarkup);
    }

    onBlur(newMarkup) {}

    updateAst(newMarkup) {
      const output = compile(newMarkup || this.getMarkup(this.props), {
        async: false
      });
      let node = output.children[0];

      while (node.type === 'component' && node.name === 'TextContainer') {
        node = node.children;
      }

      if (node.length === 1) {
        node = node[0];

        const targetNode = getNodeById(
          this.props.context.ast,
          this.props.context.activeComponent.id
        );

        Object.keys(node).forEach(key => {
          if (key === 'id') {
            return;
          }
          targetNode[key] = node[key];
        });
      } else {
        const parentNode = getParentNodeById(
          this.props.context.ast,
          this.props.context.activeComponent.id
        );
        if (!parentNode) {
          console.warn('Could not identify parent node');
          return;
        }

        const childIdx = (parentNode.children || []).findIndex(
          c => c.id === this.props.context.activeComponent.id
        );

        node.forEach(n => {
          n.id = getRandomId();
        });

        // parentNode.children.splice(childIdx, 0, ...node);
        parentNode.children = parentNode.children
          .slice(0, childIdx)
          .concat(node)
          .concat(parentNode.children.slice(childIdx + 1));
      }

      this.props.context.setAst(this.props.context.ast);
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
              justifyContent: 'space-between'
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
