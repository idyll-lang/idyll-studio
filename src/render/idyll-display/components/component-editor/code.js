import * as React from 'react';
import {
  getNodeById,
  getParentNodeById,
  getRandomId,
  reassignNodeIds,
} from '../../utils/';
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

      let topNode = output.children[0]; // text container or actual component
      let nodesToUpdate;

      if (topNode.type === 'component' && (topNode.name === 'TextContainer' || topNode.name === 'text-container')) {
        nodesToUpdate = topNode.children; // get all nodes that need to update
      } else {
        nodesToUpdate = [topNode];
      }

      const astCopy = copy(context.ast);

      const parentNode = getParentNodeById(astCopy, context.activeComponent.id);

      if (!parentNode) {
        console.warn('Could not identify parent node');
        return;
      }

      // get the index to insert the updated/new nodes into
      const childIdx = (parentNode.children || []).findIndex(
        (c) => c.id === context.activeComponent.id
      );

      const reassignedNodes = [];
      nodesToUpdate.forEach((node) => {
        reassignedNodes.push(reassignNodeIds(node));
      });

      parentNode.children = parentNode.children
        .slice(0, childIdx)
        .concat(reassignedNodes)
        .concat(parentNode.children.slice(childIdx + 1));

      let updatedActiveNode; // find the updated active node in array
      if (nodesToUpdate.length === 1) {
        updatedActiveNode = reassignedNodes[0];
      } else {
        updatedActiveNode = null; // user added extra components to markup, so reset active component for now
      }

      context.setAst(astCopy);
      context.setActiveComponent(updatedActiveNode);
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
