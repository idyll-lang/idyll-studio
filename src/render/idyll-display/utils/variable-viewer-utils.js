import path from 'path';
import { numberfy, stringify, boolify, readFile, jsonParser } from '.';

/**
 * Given an idyll ast node, formats and returns the node's
 * value to its corresponding variable-view display
 * value. If the value is an expression, it will wrap it
 * in backticks (`). If the value is a string, it will
 * wrap it in double quotes ("). Otherwise, will treat the
 * value as a number. If the node type is 'data', it will try
 * to parse the data into a JSON object. Otherwise, it will
 * encase in double quotes. If the node is undefined or null,
 * returns null
 * @param {IdyllAstNode} node the var/data/derived node
 * @param {Object} rowData the metadata associated with a dataset's table row;
 *                         if not null or undefined, returns the rowData's existing value;
 *                         otherwise, reads the dataset from the file system
 * @param {string} projectPath the directory of the project
 */
const formatInitialVariableValue = (node, rowData, projectPath) => {
  if (!node || Object.keys(node).length === 0) {
    return null;
  }

  let value;
  if (node.type === 'data') {
    if (!rowData) {
      const { source } = node.properties;
      const filePath = path.isAbsolute(source.value)
        ? source.value
        : path.join(projectPath, 'data', source.value);
      const fileContent = readFile(filePath).content;
      value = jsonParser(fileContent);
    } else {
      value = rowData.initialValue;
    }
  } else {
    value = numberfy(node.properties.value.value);
    value = boolify(value);
    if (typeof value !== 'number' && typeof value !== 'boolean') {
      let wrapper = '"';

      if (node.properties.value.type === 'expression') {
        wrapper = '`';
      }

      value = wrapValue(value, wrapper);
    }
  }

  return value;
};

/**
 * Given the current value of a variable,
 * returns its corresponding variable-view display
 * value. If the value is a string, it will wrap it
 * in double quotes ("). Otherwise, the value will be
 * displayed as is
 * @param {any} value the current value of a variable
 */
const formatCurrentVariableValue = (value) => {
  if (typeof value === 'string') {
    return wrapValue(value, '"');
  } else {
    return value;
  }
};

/**
 * Given a value, wraps the value with the given
 * character wrapper and returns it. If no wrapper is
 * given, returns the value
 * @param {any} value the value to wrap
 * @param {string} wrapper a quote wrapper (`, "", '')
 */
const wrapValue = (value, wrapper) => {
  if (!wrapper) {
    return value;
  } else {
    return `${wrapper}${stringify(value)}${wrapper}`;
  }
};

/**
 * Trims the wrapper character off the start and end
 * of the given value and returns it
 * @param {string} value the string value to trim
 * @param {string} wrapper a quote wrapper to exclude
 *                         from start and end (', ", `)
 */
const trimVariableValue = (value, wrapper) => {
  if (value && value.startsWith(wrapper) && value.endsWith(wrapper)) {
    return value.substring(1, value.length - 1);
  } else {
    return value;
  }
};

/**
 * Given a user input value for a variable,
 * returns an object with keys [type, value] where
 * type is the type of user input (value, expression),
 * and value is the converted user input into the correct type.
 * Essentially, VariableView display value -> Idyll node value
 * @param {any} value the user input
 */
const convertInputToIdyllValue = (value) => {
  if (value === undefined || value === null) {
    return { type: 'expression', value: value };
  }

  const quotes = ["'", '"'];

  value = numberfy(value);
  value = boolify(value);
  if (typeof value === 'number' || typeof value === 'boolean') {
    return { type: 'value', value: value };
  } else if (
    quotes.includes(value.charAt(0)) &&
    quotes.includes(value.charAt(value.length - 1)) &&
    value.charAt(0) === value.charAt(value.length - 1)
  ) {
    let trimmed = trimVariableValue(value, '"');
    if (trimmed !== value) {
      value = trimmed;
    } else {
      value = trimVariableValue(value, "'");
    }

    return { type: 'value', value: value };
  }

  // an expression
  return { type: 'expression', value: trimVariableValue(value, '`') };
};

module.exports = {
  formatInitialVariableValue,
  formatCurrentVariableValue,
  trimVariableValue,
  wrapValue,
  convertInputToIdyllValue,
};
