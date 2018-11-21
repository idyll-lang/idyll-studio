
import React from 'react';
import * as components from 'idyll-components';
import IdyllDocument from 'idyll-document';

class Renderer extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {}
  }

  componentDidCatch(e) {
    this.setState({
      error: e
    })
  }

  render() {
    const { markup } = this.props;
    return (
      <div>
        <IdyllDocument
          markup={ markup }
          components={ components }
          layout={ 'centered' }
          context={(context) => {
            window.IDYLL_CONTEXT = context;
          }}
          datasets={ {} }
        />
      </div>
    )
  }
}



export default Renderer