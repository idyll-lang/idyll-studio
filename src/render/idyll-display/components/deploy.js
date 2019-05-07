import React from 'react';
import Select from 'react-select';
const compile = require('idyll-compiler');
const idyllAST = require('idyll-ast');

class Deploy extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return <div className='deploy' />;
  }
}

export default Deploy;
