import React from 'react';
import Context from '../../../context/context';
import {
  COMPONENTS_CATEGORY_MAP,
  INPUT,
  LAYOUT,
  LOGIC,
  PRESENTATION,
  HELPERS,
} from '../../../../constants';
import ComponentAccordion from './component-accordion';
import { withContext } from '../../../context/with-context';
import Component from './component';

export const WrappedComponentView = withContext(
  class ComponentView extends React.PureComponent {
    static contextType = Context;
    constructor(props) {
      super(props);

      this.state = {
        searchValue: '',
        filteredComponents: [],
      };

      this.categoriesMap = {
        [INPUT]: [],
        [LAYOUT]: [],
        [LOGIC]: [],
        [PRESENTATION]: [],
        [HELPERS]: [],
        Other: [],
      };

      if (
        this.props.context.components &&
        this.props.context.components.length > 0
      ) {
        this.props.context.components.map((component) => {
          if (COMPONENTS_CATEGORY_MAP.has(component.name)) {
            this.categoriesMap[
              COMPONENTS_CATEGORY_MAP.get(component.name)
            ].push(component);
          } else {
            this.categoriesMap.Other.push(component);
          }
        });
      }
    }

    searchComponents = (e) => {
      const value = e.target.value;
      const filteredResults = this.props.context.components.filter(
        (component) => component.name.startsWith(value)
      );

      this.setState({
        searchValue: value,
        filteredComponents: filteredResults,
      });
    };

    renderAccordion = () =>
      Object.keys(this.categoriesMap).map((category, i) => {
        return (
          <ComponentAccordion
            category={category}
            key={'component_category:' + i}
            components={this.categoriesMap[category]}
          />
        );
      });

    renderFilteredResults = () => {
      if (this.state.filteredComponents.length === 0) {
        return <p>No results found</p>;
      } else {
        return this.state.filteredComponents.map((component, i) => {
          return (
            <div
              className='component-container'
              key={'component-container:' + i}
            >
              <Component key={i} component={component} />
            </div>
          );
        });
      }
    };

    render() {
      return (
        <div className='component-view'>
          <input
            type='text'
            placeholder='Search Components'
            onChange={this.searchComponents}
            value={this.state.searchValue}
            style={{
              padding: '0.25em 1em',
              border: 'none',
              width: '100%',
              borderBottom: '1px solid rgb(0, 0, 0, .33)',
            }}
          />
          <div className='component-container'>
            {this.state.searchValue.length > 0
              ? this.renderFilteredResults()
              : this.renderAccordion()}
          </div>
        </div>
      );
    }
  }
);

export default WrappedComponentView;
