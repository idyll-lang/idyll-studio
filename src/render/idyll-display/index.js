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

  // // When editor detects changes, updates current markup
  // // to the newMarkup passed in
  // handleChange(newMarkup) {
  //   this.setState({ currentMarkup: newMarkup });
  //   const { onChange } = this.props; // must pass info up one level
  //   if (onChange) {
  //     onChange(newMarkup);
  //   }
  // }

  // Update renderer to reflect newly uploaded file
  // if previous markup is any different from current
  // don't need this method right now
  // componentDidUpdate(prevProps) {
  //   if (this.props.markup !== prevProps.markup) {
  //     this.handleChange(this.props.markup);
  //   }
  //   if (this.props.ast !== prevProps.ast) {
  //     this.handleASTChange(this.props.ast);
  //   }
  // }

  render() {
    const { components, propsMap, datasets } = this.props;
    return (
      <div className='grid'>
        <div className='header'>
          <ComponentView
            components={components}
            ast={this.props.ast}
            handleASTChange={this.props.setAST}
            propsMap={propsMap}
          />
          <DatasetView datasets={datasets} />
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
