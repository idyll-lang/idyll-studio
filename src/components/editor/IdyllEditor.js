import React from "react";
import EditArea from "./edit-area";
import Renderer from "./renderer";

class IdyllEditor extends React.PureComponent {
  constructor(props) {
    super(props);
    const { markup } = props;
    this.state = {
      error: null,
      initialMarkup: markup,
      currentMarkup: markup
    };
  }

  setContent(value) {
    this.setState({ currentMarkup: value });
  }

  componentDidCatch(error, info) {
    console.log(error);
    this.setState({ error: error.message });
  }

  handleChange = newContent => {
    this.setContent(newContent);
    const { onChange } = this.props;
    if (onChange) {
      onChange(newContent);
    }
  };

  render() {
    const { fullscreen } = this.props;
    const { initialMarkup, currentMarkup, error, idyllHash } = this.state;
    return (
      <div className="container">
        {fullscreen ? null : (
          <EditArea
            initialContent={initialMarkup}
            onChange={this.handleChange}
          />
        )}
        <Renderer markup={currentMarkup} />
        {error && this.renderError()}
        <style jsx>{`
          .container {
            flex: 1;
            display: flex;
            flex-direction: row;
            overflow: auto;
          }
        `}</style>
      </div>
    );
  }

  renderError = () => (
    <div className="error-display">
      <pre>{this.state.error}</pre>
      <style jsx>{`
        .error-display {
          background: rgba(0, 0, 0, 0.8);
          color: white;
          font-family: Courier New, Courier, monospace;
          font-size: 12px;
          position: absolute;
          bottom: 0;
          right: 0;
          padding: 5px 10px;
        }
      `}</style>
    </div>
  );
}

export default IdyllEditor;
