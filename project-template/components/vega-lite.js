const React = require('react');
import { VegaLite as _VL } from 'react-vega';

class VegaLite extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      handler: null
    }
  }

  componentDidMount() {
    const { Handler } = require('vega-tooltip')
    this.setState({
      handler: new Handler().call
    })
  }
  render() {
    const { spec, data, ...props } = this.props;
    const { handler } = this.state;
    const adjustedSpec = { ...this.props.spec, data: { values: data } };
    return (
      <div>
        <_VL
          {...props}
          spec={adjustedSpec}
          tooltip={handler} />
      </div>
    );
  }
}

VegaLite._idyll = {
  name: 'VegaLite',
  tagType: 'closed',
  props: [
    {
      name: 'data',
      type: 'expression',
      example: `\`[{x: 0, y: 0}, {x: 1, y: 1}]\``
    },
    {
      name: 'spec',
      type: 'expression',
      example: `\`{
  mark: "line",
  encoding: {
    x: {
      field: "x",
      type: "quantitative"
    },
    y: {
      field: "y",
      type: "quantitative"
    }
  }
}\``
    },
    {
      name: 'width',
      type: 'value',
      example: `"container"`
    },
    {
      name: 'height',
      type: 'number',
      example: `300`
    }
  ]
};


module.exports = VegaLite;