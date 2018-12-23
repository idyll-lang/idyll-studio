import React from "react";
import * as components from "idyll-components";
import IdyllDocument from "idyll-document";

class Renderer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidCatch(e) {
    this.setState({
      error: e
    });
  }

  render() {
    const { markup } = this.props;
    return (
      <div className="renderer" style={{ width: "50%" }}>
        <div className="renderer-container">
          {/* <IdyllDocument
            markup={markup}
            components={components}
            layout={"centered"}
            context={context => {
              window.IDYLL_CONTEXT = context;
            }}
            datasets={{}}
          /> */}
          {markup}
        </div>
      </div>
    );
  }
}

export default Renderer;
