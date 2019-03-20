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
    // this.handleChange = this.handleChange.bind(this);
    this.handleComponentChange = this.handleComponentChange.bind(this);
  }

  handleComponentChange(newComponent) {
    this.setState({
      currentComponent : newComponent
    });
  }

  render() {
    const {
      components,
      propsMap,
      datasets,
      maxNodeId,
      setAST,
      ast,
      updateMaxId
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
            updateMaxId={updateMaxId}
          />
          <DatasetView
            datasets={datasets}
            ast={ast}
            handleASTChange={setAST}
            maxNodeId={maxNodeId}
            updateMaxId={updateMaxId}
          />
        </div>
        {/* <div className='edit-container'>
          <Edit markup={markup} onChange={this.handleChange} />
        </div> */}
        <div className='output-container'>
          <Render
            components={components}
            ast={this.props.ast}
            handleComponentChange={this.handleComponentChange}
          />
        </div>
        <div className='sidebar-view'>
          <Sidebar
            ast={this.props.ast}
            handleASTChange={this.props.setAST}
            handleComponentChange={this.handleComponentChange}
            currentComponent={this.state.currentComponent} />
        </div>
      </div>
    );
  }
}

export default IdyllDisplay;
