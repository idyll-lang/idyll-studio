import React from 'react';
import Select from 'react-select';
const compile = require('idyll-compiler');
const idyllAST = require('idyll-ast');

// {extension: ".json", name: "example-data.json", path: "/Users/meganvo/projects/deploy-test/data/example-data.json"}

class DatasetView extends React.PureComponent {
  constructor(props) {
    super(props);

    this.insertData = this.insertData.bind(this);
  }

  // Generates the tag associated with the given dataset
  // [data name:'myData' source:'myData.csv' /]
  insertData(dataset) {
    var tag =
      "[data name:'" + dataset.name + "' source:'" + dataset.path + "' /]";

    // Handle the ast change
    compile(tag).then(dataAST => {
      // Grab textcontainer id -> assign one before to data node
      var ast = this.props.ast;
      var textContainerNode = ast.children[ast.children.length - 1];
      var dataNode = dataAST.children[0];
      dataNode.id = ast.children[ast.children.length - 2].id + 1;

      // increment all ids one forward in textcontainer
      idyllAST.walkNodes(textContainerNode, node => {
        node.id = node.id + 1;
      });

      // Insert into ast's root children
      ast.children.splice(ast.children.length - 1, 0, dataNode);

      const { handleASTChange } = this.props;
      handleASTChange(ast); // must pass info up level
    });
  }

  render() {
    const { datasets } = this.props;
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
