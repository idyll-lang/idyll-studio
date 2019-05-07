import React from 'react';
import Edit from './edit.js';
import Render from './render.js';
import Sidebar from './sidebar';
import { path } from 'change-case';

class IdyllDisplay extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      currentMarkup: this.props.markup,
      // TODO - get these values from the project config!
      layout: 'centered',
      theme: 'default'
    };
    this.handleComponentChange = this.handleComponentChange.bind(this);
  }

  handleComponentChange(node) {
    this.setState({
      currentSidebarNode: node
    });
  }

  updateLayout(layout) {
    this.setState({
      layout: layout
    });
  }

  updateTheme(theme) {
    this.setState({
      theme: theme
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

    console.log(
      'rendering theme, ',
      this.state.theme,
      'layout, ',
      this.state.layout
    );
    return (
      <div className='grid'>
        <Sidebar
          ast={ast}
          handleASTChange={setAST}
          currentSidebarNode={this.state.currentSidebarNode}
          updateNode={this.handleComponentChange.bind(this)}
          propsMap={propsMap}
          maxNodeId={maxNodeId}
          updateMaxId={updateMaxId}
          datasets={datasets}
          components={components}
          layout={this.state.layout}
          theme={this.state.theme}
          updateTheme={this.updateTheme.bind(this)}
          updateLayout={this.updateLayout.bind(this)}
          deploy={this.props.deploy}
        />
        <div className='output-container'>
          <Render
            components={components}
            theme={this.state.theme}
            layout={this.state.layout}
            ast={this.props.ast}
            handleComponentChange={this.handleComponentChange}
          />
        </div>
      </div>
    );
  }
}

export default IdyllDisplay;
