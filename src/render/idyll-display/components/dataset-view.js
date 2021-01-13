import React from 'react';
import Select from 'react-select';
import Context from '../../context/context';
import { getRandomId } from '../utils'

const compile = require('idyll-compiler');
const idyllAST = require('idyll-ast');

// {extension: ".json", name: "example-data.json", path: "/Users/meganvo/projects/deploy-test/data/example-data.json"}

class DatasetView extends React.PureComponent {
  static contextType = Context;
  constructor(props) {
    super(props);

    this.insertData = this.insertData.bind(this);
  }

  // Generates the tag associated with the given dataset
  // [data name:'myData' source:'myData.csv' /]
  insertData(dataset) {
    var tag = `[data name:'${dataset.name}' source:'${dataset.path}' /]`;

    // Handle the ast change
    compile(tag).then(datasetAST => {
      const ast = this.context.ast;
      const datasetNode = datasetAST.children[0];
      datasetNode.id = getRandomId();

      // Insert into ast's root children before the first text container
      // or non-variable/dataset child
      var currNodeIndex = 0;
      while (
        ast.children[currNodeIndex].type === 'data' ||
        ast.children[currNodeIndex].type === 'var'
      ) {
        currNodeIndex++;
      }
      ast.children.splice(currNodeIndex, 0, datasetNode);

      const { setAst } = this.context;
      setAst(ast); // must pass info up level
    });
  }

  render() {
    const { datasets } = this.context;

    console.log(this.context.ast);
    return (
      <div className='dataset-view'>
        <div className='label'>Datasets</div>
        <div className='dataset-container'>
          {datasets && datasets.length ? (
            <Select
              placeholder='Select a dataset'
              ref='select'
              // on change callback
              options={datasets.map(dataset => {
                return { value: dataset, label: dataset.name };
              })}
              onChange={({ value }) => {
                const dataset = value;
                this.insertData(dataset);
              }}
            />
          ) : null}
        </div>
      </div>
    );
  }
}

export default DatasetView;
