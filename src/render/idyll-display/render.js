import React from 'react';
import IdyllDocument from 'idyll-document';
import AuthorToolButtons from './components/author-tool-buttons';
import InlineAuthorToolButtons from './components/inline-author-tool-buttons';
import TextEdit from './components/text-edit.js';
import DropTarget from './components/drop-target';
import { withContext } from '../context/with-context';

const p = require('path');

const Renderer = withContext(
  class Renderer extends React.PureComponent {
    constructor(props) {
      super(props);
      this.state = {};
    }

    componentDidCatch(e) {
      this.setState({
        error: e,
      });
    }

    componentDidUpdate(prevProps) {
      const { context } = this.props;

      if (
        this.state.error &&
        JSON.stringify(prevProps.context.ast) !== JSON.stringify(context.ast)
      ) {
        this.setState({ error: null });
      } else if (this.hasUndefinedDatasets(context)) {
        context.loadDatasets();
      }
    }

    hasUndefinedDatasets(context) {
      for (let key in context.context.data()) {
        if (context.context.data()[key] === undefined) {
          return true;
        }
      }

      return false;
    }

    injectDropTargets(ast) {
      // deep copy
      const astCopy = JSON.parse(JSON.stringify(ast));
      astCopy.children = (astCopy.children || []).map((node) => {
        if (node.type !== 'component') {
          return node;
        }

        if (node.name === 'TextContainer') {
          if (node.children.length === 1 && node.children[0].type === 'meta') {
            return node;
          }
          node.children = node.children.reduce((memo, child, i, arr) => {
            if (i === 0) {
              return [
                {
                  id: -1,
                  type: 'component',
                  name: 'IdyllEditorDropTarget',
                  properties: {
                    insertBefore: {
                      type: 'value',
                      value: child.id,
                    },
                  },
                },
                child,
                {
                  id: -2,
                  type: 'component',
                  name: 'IdyllEditorDropTarget',
                  properties: {
                    insertAfter: {
                      type: 'value',
                      value: child.id,
                    },
                  },
                },
              ];
            }
            return [
              ...memo,
              child,
              {
                id: -(i + 2),
                type: 'component',
                name: 'IdyllEditorDropTarget',
                properties: {
                  insertAfter: {
                    type: 'value',
                    value: child.id,
                  },
                },
              },
            ];
          }, []);
        }
        return node;
      });
      // return ast;
      return astCopy;
    }

    render() {
      if (this.state.error) {
        return (
          <div>
            <pre>{this.state.error.toString()}</pre>
          </div>
        );
      }

      const {
        ast,
        components,
        showPreview,
        layout,
        theme,
        setContext,
        datasets,
      } = this.props.context;

      if (!this.loadedComponents) {
        this.loadedComponents = {};
      }
      components.forEach(({ name, path }) => {
        if (!this.loadedComponents[name]) {
          try {
            this.loadedComponents[name] = require(path);
          } catch (e) {
            console.log('Error loading component', name);
          }
        }
      });

      return (
        <div className='renderer'>
          <div className='renderer-container' contentEditable={false}>
            <IdyllDocument
              key={!showPreview}
              ast={this.injectDropTargets(ast)}
              components={{
                IdyllEditorDropTarget: DropTarget,
                ...this.loadedComponents,
              }}
              layout={layout}
              theme={theme}
              context={(context) => {
                setContext(context);
              }}
              datasets={datasets}
              injectThemeCSS={true}
              injectLayoutCSS={true}
              userViewComponent={AuthorToolButtons}
              userInlineViewComponent={InlineAuthorToolButtons}
              textEditComponent={showPreview ? null : TextEdit}
              authorView={!showPreview}
            />
          </div>
        </div>
      );
    }
  }
);

export default Renderer;
