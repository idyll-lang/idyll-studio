

import * as React from 'react';
import { getNodeById } from '../../utils/';
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
      this.updateAst();
    }

    onBlur(newMarkup) {
    }

    updateAst() {
      const output = compile(this.getMarkup(this.props), { async: false });
      let node = output.children[0];
      if (node.children && node.children.length) {
        node = node.children[0];
      }
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

      this.props.context.setAst(this.props.context.ast);
    }

    render() {
      return  (
        <div className={'idyll-code-editor'}>
          <EditableCodeCell
            onExecute={this.onExecute.bind(this)}
            onBlur={this.onBlur.bind(this)}
            markup={this.getMarkup(this.props)}
          />
          <div className={'code-instructions'} style={{color: '#ccc',  fontSize: 10, fontStyle: 'italic', margin: '5px 16px', display: 'flex', justifyContent: 'space-between'}}>
            <div>shift + enter to execute</div>
            <div><a style={{color: '#ccc', textDecoration:  'underline'}} href={'https://idyll-lang.org/docs/syntax'}>Syntax Guide</a></div>
          </div>
        </div>
      )
    }
  }
);
