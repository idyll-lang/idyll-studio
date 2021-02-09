import React from 'react';
import Select from 'react-select';
import Context from '../../context/context';
import {
  getRandomId,
  getTextContainerIndex,
  readFile,
  convertInputToIdyllValue
} from '../utils';
import copy from 'fast-copy';

const compile = require('idyll-compiler');

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
      const ast = copy(this.context.ast);
      const datasetNode = datasetAST.children[0];
      datasetNode.id = getRandomId();

      // Insert into ast's root children before the first text container
      // or non-variable/dataset child
      const currentNodeIndex = getTextContainerIndex(ast);
      ast.children.splice(currentNodeIndex, 0, datasetNode);

      const { setAst, context } = this.context;
      const { content } = readFile(dataset.path);

      context.update({
        [dataset.name]: convertInputToIdyllValue(content).value
      });
      setAst(ast); // must pass info up level
    });
  }

  handleDrop(e) {
    const { importDataset } = this.context;
    if (e.dataTransfer.files.length) {
      const f = e.dataTransfer.files[0]
      importDataset(f.path, () => {
        this.insertData({
          name: f.name.replace('.csv', '').replace('.json', ''),
          path: f.path
        })
      });
    }
  }

  render() {
    const { datasets } = this.context;

    return (
      <div className='dataset-view'>
        <h2 style={{marginBottom: 0}}>Datasets</h2>
        <div style={{fontSize: 12, color: '#333'}}>Loaded data will appear in panel above.</div>
        <div  onDrop={this.handleDrop.bind(this)} style={{width: '100%', border: 'solid 2px #999', borderRadius: 5, color: '#999', fontSize: 12, margin: '1em auto', display: 'flex', flexDirection: 'row', justifyContent: 'center', fontWeight: 'bold',  textAlign: 'center', padding: '2em 1em' }}>
            Drag+and+drop to add a dataset <br/>(.csv or .json)
        </div>
        <div className='dataset-container'>
          {datasets && datasets.length ? (
            <Select
              placeholder='Select an existing dataset'
              ref='select'
              // on change callback
              options={datasets.map(dataset => {
                return { value: dataset, label: dataset.name };
              })}
              onChange={({ value }) => {
                const dataset = value;
                dataset.name = dataset.name
                  .replace('.csv', '')
                  .replace('.json', '');
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
