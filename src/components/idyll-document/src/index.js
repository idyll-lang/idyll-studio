
import React from 'react';
import Runtime from './runtime';
import compile from 'idyll-compiler';

export const hashCode = (str) => {
  var hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

class IdyllDocument extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      ast: props.ast || [],
      previousAST: props.ast || [],
      hash: '',
      error: null
    }
    this.addBlock = this.addBlock.bind(this);
    this.removeBlock = this.removeBlock.bind(this);
  }

  componentDidMount() {
    if (!this.props.ast && this.props.markup) {
      compile(this.props.markup, this.props.compilerOptions)
        .then((ast) => {
          this.setState({ ast, hash: hashCode(this.props.markup), error: null });
        })
    }
  }

  componentDidCatch(error, info) {
    this.props.onError && this.props.onError(error);
    this.setState({ error: error.message });
  }

  componentWillReceiveProps(newProps) {
    if (newProps.ast) {
      console.log('newProps.ast',newProps.ast)
      //this.setState({ast: newProps.ast})
      return;
    }

    if (newProps.markup) {
    const hash = hashCode(newProps.markup);
    if (hash !== this.state.hash) {
      this.setState({ previousAST: this.state.ast });
      compile(newProps.markup, newProps.compilerOptions)
        .then((ast) => {
          this.setState({ previousAST: ast, ast, hash, error: null });
        })
        .catch(this.componentDidCatch.bind(this));
    }
  }
  }

  getErrorComponent() {
    if (!this.state.error) {
      return null;
    }
    return React.createElement(this.props.errorComponent || 'pre', {
      className: "idyll-document-error"
    }, this.state.error);
  }

  addBlock(ast){
    this.runtime.addBlock(ast);

  }

  removeBlock(ast){
    this.runtime.removeBlock(ast);
  }

  render() {
    return (
      <div >
        <Runtime ref={(child) => { this.runtime = child; }}
          {...this.props}
          key={ this.state.hash }
          context={(context) => {
            this.idyllContext = context;
            typeof this.props.context === 'function' && this.props.context(context);
          }}
          initialState={this.props.initialState || (this.idyllContext ? this.idyllContext.data() : {})}
          ast={ this.props.ast || this.state.ast }
          />
        { this.getErrorComponent() }
      </div>
    )
  }
}


export default IdyllDocument;
