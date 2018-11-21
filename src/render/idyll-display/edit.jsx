
import React from 'react'
/**
 * TODO - implement this component
 */
class Edit extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {}
  }
  render() {
    const { markup } = this.props;
    return (
      <div style={{width: '100%'}}>
        <code>
          {markup}
        </code>
      </div>
    )
  }
}



export default Edit