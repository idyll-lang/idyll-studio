

import * as React from 'react';
import { getNodeById } from '../../utils/';
import { withContext } from '../../../context/with-context';
import EditableCodeCell from './code-cell';

const AST = require('idyll-ast');
const compile = require('idyll-compiler');
const postcss = require('postcss')
const postcssJs = require('postcss-js')

/**
 * An AuthorView is associated with an active component.
 * If a component is registered as active, renders
 * a property list of all the components properties for editing.
 */
export default withContext(
  class Styles extends React.PureComponent {
    constructor(props) {
      super(props);
    }

    getStyles(props) {
      const _props =  props.context.activeComponent.properties || {};
      const _stylesProp =  _props.style || {};
      const _styles =  eval(`(function() { return ${_stylesProp.value  || ''} })()`);
      let cssString = postcss().process(_styles, { parser: postcssJs }).css || '';
      cssString = cssString.trim();
      if (cssString.length && cssString[cssString.length - 1] !== ';') {
        cssString += ';';
      }
      return cssString;
    }

    onExecute(cssString) {
      // todo  - update the styles
      const targetNode = getNodeById(
        this.props.context.ast,
        this.props.context.activeComponent.id
      );

      const root = postcss.parse(cssString);
      if (!targetNode.properties)  {
        targetNode.properties = {};
      }
      if (targetNode.properties.style)  {
        targetNode.properties.style.value = JSON.stringify(postcssJs.objectify(root));
      } else {
        targetNode.properties.style =  {
          type: 'expression',
          value: JSON.stringify(postcssJs.objectify(root))
        }
      }
      this.props.context.setAst(this.props.context.ast);
    }

    onBlur(newMarkup) {
      // maybe don't need?
    }

    updateAst() {
    }

    render() {
      return  (
        <div className={'idyll-code-editor'}>
          <EditableCodeCell
            onExecute={this.onExecute.bind(this)}
            onBlur={this.onBlur.bind(this)}
            markup={this.getStyles(this.props)}
          />
          <div className={'code-instructions'} style={{color: '#ccc',  fontSize: 10, fontStyle: 'italic', margin: '5px 16px', display: 'flex', justifyContent: 'space-between'}}>
            <div>shift + enter to execute</div>
            <div><a style={{color: '#ccc', textDecoration:  'underline'}}>CSS Syntax</a></div>
          </div>
        </div>
      )
    }
  }
);
