import React from 'react';
import Context from '../../context/context';
import {
  COMPONENTS_CATEGORY_MAP,
  INPUT,
  LAYOUT,
  LOGIC,
  PRESENTATION,
  HELPERS,
} from '../../../constants';
import ComponentAccordion from './component-accordion';
import { withContext } from '../../context/with-context';

export const WrappedComponentView = withContext(
  class ComponentView extends React.PureComponent {
    static contextType = Context;
    constructor(props) {
      super(props);

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

    render() {
      return (
        <div className='component-view'>
          <div className='component-container'>
            {Object.keys(this.categoriesMap).map((category, i) => {
              return (
                <ComponentAccordion
                  category={category}
                  key={'component_category:' + i}
                  components={this.categoriesMap[category]}
                />
              );
            })}
          </div>
        </div>
      );
    }
  }
);

export default WrappedComponentView;
