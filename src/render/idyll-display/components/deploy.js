import React from 'react';
import Select from 'react-select';
const compile = require('idyll-compiler');
const idyllAST = require('idyll-ast');
import Context from '../../context';

class Deploy extends React.PureComponent {
  static contextType = Context;
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <button onClick={this.context.deploy}>Publish</button>
      </div>
    );
  }
}

export default Deploy;
