import * as React from 'react';
import { registerEditor } from '../author-view';
import { getNodeById } from '../../utils/';
import { withContext } from '../../../context/with-context';
import CanvasDraw from "react-canvas-draw";

 const WrappedBitmap = withContext(
  class Bitmap extends React.PureComponent {
    constructor(props) {
      super(props);

      this.state = {
        brushColor: '#333'
      }
    }

    onExecute(cssString) {
      // todo  - update the styles
      const targetNode = getNodeById(
        this.props.context.ast,
        this.props.context.activeComponent.id
      );

      const root = postcss.parse(cssString);
      if (!targetNode.properties)  {
        targetNode.properties = {};
      }
      if (targetNode.properties.style)  {
        targetNode.properties.style.value = JSON.stringify(postcssJs.objectify(root));
      } else {
        targetNode.properties.style =  {
          type: 'expression',
          value: JSON.stringify(postcssJs.objectify(root))
        }
      }
      this.props.context.setAst(this.props.context.ast);
    }

    handleChange(val) {
      console.log('on change', val);
      console.log(val.getSaveData());
    }

    handleColorChange(e) {
      this.setState({
        brushColor: e.target.value
      });
    }

    render() {
      return  (
        <div className={'idyll-code-editor'}>
          <div>Brush color <input style={{margin: 0}} value={this.state.brushColor} onChange={this.handleColorChange.bind(this)} /></div>
          <CanvasDraw brushColor={this.state.brushColor} onChange={this.handleChange.bind(this)} lazyRadius={0} canvasHeight={250} canvasWidth={300} />
          <div className={'code-instructions'} style={{color: '#ccc',  fontSize: 10, fontStyle: 'italic', margin: '5px 16px', display: 'flex', justifyContent: 'space-between'}}>
            <div>instructions...</div>
          </div>
        </div>
      )
    }
  }
);

registerEditor('header', { editorTitle: 'bitmap', editorComponent: WrappedBitmap })
export default WrappedBitmap;