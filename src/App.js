import React from 'react';
import './App.css';
import IdyllEditor from './components/editor/IdyllEditor';
import exampleMarkup from './components/editor/initial';
import { hashCode } from './components/editor/utils';


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

    if (hashCode(this.currentMarkup) !== hashCode(exampleMarkup)) {
      this.setState({ edited: true });
    }
  }

  render() {
    if (!this.currentMarkup) {
      this.currentMarkup = exampleMarkup;
    }

    return (
      <div className="App">
        {/* <EditorArea /> */}
        <IdyllEditor markup={exampleMarkup} onChange={this.handleChange} />
      </div>
    );
  }
}

export default App;
