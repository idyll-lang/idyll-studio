import React from 'react';
import Edit from './edit.js';
import Render from './render.js';
import Sidebar from './sidebar.js';
import ComponentView from './component-view.js';
import DatasetView from './dataset-view.js';
import { path } from 'change-case';

class IdyllDisplay extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currentMarkup: this.props.markup
    };
  }

  render() {
    const {
      components,
      propsMap,
      datasets,
      maxNodeId,
      setAST,
      ast
    } = this.props;

    return (
      <div className='grid'>
        <div className='header'>
          <ComponentView
            components={components}
            ast={ast}
            handleASTChange={setAST}
            propsMap={propsMap}
            maxNodeId={maxNodeId}
          />
          <DatasetView
            datasets={datasets}
            ast={this.props.ast}
            handleASTChange={setAST}
            maxNodeId={maxNodeId}
          />
        </div>
        {/* <div className='edit-container'>
          <Edit markup={markup} onChange={this.handleChange} />
        </div> */}
        <div className='output-container'>
          <Render components={components} ast={this.props.ast} />
        </div>
        <div className='sidebar-view'>
          <Sidebar ast={this.props.ast} handleASTChange={this.props.setAST} />
        </div>
      </div>
    );
  }
}

export default IdyllDisplay;
