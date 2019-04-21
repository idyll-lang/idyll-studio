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

  handleComponentChange(node) {
    this.setState({
      currentSidebarNode : node
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
        <Sidebar
          ast={ast}
          handleASTChange={setAST}
          currentSidebarNode={this.state.currentSidebarNode}
          propsMap={propsMap}
          maxNodeId={maxNodeId}
          updateMaxId={updateMaxId}
          datasets={datasets}
          components={components}
        />
        <div className='output-container'>
          <Render
            components={components}
            ast={this.props.ast}
            handleComponentChange={this.handleComponentChange}
          />
        </div>
      </div>
    );
  }
}

export default IdyllDisplay;
