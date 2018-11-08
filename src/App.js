import React from 'react';
import './App.css';
import IdyllEditor from './IdyllEditor';
import exampleMarkup from './initial';
import { hashCode } from './components/editor/utils';
import EditorArea from './edit-area';


class App extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      edited: false
    }
  }

  getInitialProps() {
    return { initialMarkup: exampleMarkup };
  }

  handleChange = (markup) => {
    this.currentMarkup = markup;
    if (hashCode(markup) !== hashCode(this.props.initialMarkup)) {
      this.setState({ edited: true });
    }
  }

  render() {
    if (!this.currentMarkup) {
      this.currentMarkup = this.props.initialMarkup;
    }

    return (
      <div className="App">
        {/* <EditorArea /> */}
        <IdyllEditor markup={this.props.initialMarkup} onChange={this.handleChange} />
      </div>
    );
  }
}

export default App;
