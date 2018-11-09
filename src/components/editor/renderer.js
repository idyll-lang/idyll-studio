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
      <div className={`renderer `}>
        <div className={`renderer-container `}>
          {
            this.state.error ? (
              <pre>{this.state.error.toString()}</pre>
            ) :
              <IdyllDocument
                markup={markup}
                components={components}
                layout={'centered'}
                context={(context) => {
                  window.IDYLL_CONTEXT = context;
                }}
                datasets={{}}
              />
          }

        </div>

        <style jsx>{`
          .renderer {
            flex: 2;
            background: #fffff8;
            padding: 15px;
            font-size: 13px;
            overflow-y: auto;
          }
          .renderer-container {
            margin-left: auto;
            margin-right: auto;
            padding-left: 6.25%;
            font-family: et-book, Palatino, "Palatino Linotype", "Palatino LT STD", "Book Antiqua", Georgia, serif;
            color: #111;
            counter-reset: sidenote-counter;
          }
        `}</style>
      </div>
    )
  }

}

export default Renderer