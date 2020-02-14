import * as React from 'react';
import * as ReactDOM from 'react-dom';
import PropertyList from './property-list';

/**
 *
 */
class AuthorView extends React.PureComponent {
  constructor(props) {
    super(props);
    console.log(props.activeComponent);
  }

  updateNodeWithNewProperties(idyllASTNode, propertiesCopy) {
    console.log(idyllASTNode, propertiesCopy);
  }

  render() {
    const { activeComponent } = this.props;
    const childComponent = (
      <div className='author-view-overlay'>
        <PropertyList
          node={activeComponent}
          updateNodeWithNewProperties={this.updateNodeWithNewProperties.bind(
            this
          )}
        />
      </div>
    );

    const componentDomNode = document.getElementById(
      activeComponent.name + '-' + activeComponent.id
    );

    if (componentDomNode) {
      return ReactDOM.createPortal(childComponent, componentDomNode);
    } else {
      return <></>;
    }
  }
}

export default AuthorView;
