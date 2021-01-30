const { InvalidParameterError } = require('../../../error');
import throttle from 'lodash.throttle';
import fs from 'fs';
import path from 'path';
import parse from 'csv-parse/lib/sync';

const getRandomId = () => {
  return Math.floor(Math.random() * 10000000000) + 100000000;
};

const getNodeById = (node, id) => {
  if (node.id === id) {
    return node;
  }
  if (!node.children || !node.children.length) {
    return false;
  }
  for (var i = 0; i < node.children.length; i++) {
    const ret = getNodeById(node.children[i], id);
    if (ret) {
      return ret;
    }
  }
  return false;
};

const updateNodeById = (ast, id, newProps) => {
  const targetNode = getNodeById(ast, id);

  Object.keys(newProps).forEach(key => {
    if (key === 'id') {
      return;
    }
    if (
      typeof newProps[key] === 'object' &&
      typeof targetNode[key] === 'object'
    ) {
      targetNode[key] = Object.assign({}, targetNode[key], newProps[key]);
    } else {
      targetNode[key] = newProps[key];
    }
  });
};

const deleteNodeById = (node, id) => {
  if (!node.children || !node.children.length) {
    return false;
  }
  for (var i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (child.id && child.id === id) {
      node.children.splice(i, 1);
      return true;
    } else {
      const ret = deleteNodeById(child, id);
      if (ret) {
        return true;
      }
    }
  }
  return false;
};

const isChildOf = (node, parent) => {
  while (node !== null) {
    if (node === parent) {
      return true;
    }
    node = node.parentNode;
  }

  return false;
};

const getTextContainerIndex = node => {
  let currentNodeIndex = 0;
  while (
    node.children[currentNodeIndex].type === 'data' ||
    node.children[currentNodeIndex].type === 'var'
  ) {
    currentNodeIndex++;
  }

  return currentNodeIndex;
};

/**
 * Returns true if one node is null / undefined and the other
 * is not.
 * @param {IdyllAstNode} node1 an idyll node
 * @param {IdyllAstNode} node2 an idyll node
 */
const isDifferentActiveNode = (node1, node2) =>
  (node1 && !node2) || (node2 && !node1);

/**
 * Takes in a string and returns back a formatted version of it
 * that replaces '-' with spaces and capitalizes every word
 * @param {string} value the string to format
 */
const formatString = value => {
  if (!value || typeof value !== 'string') {
    return '';
  }

  return value
    .split(/[\s-]+/g)
    .map(
      word =>
        word.substring(0, 1).toUpperCase() + word.substring(1).toLowerCase()
    )
    .join(' ');
};

/**
 * Given an idyll AST node, one of its property names,
 * and the corresponding property value, returns an
 * updated copy of its properties object with the new
 * property value. Returns null if any of the parameters
 * are null or empty
 * @param {IdyllAstNode} node the idyll AST node
 * @param {string} propertyName the property name to update
 * @param {string} propertyValue the property value
 */
function getUpdatedPropertyList(node, propertyName, propertyValue) {
  if (node && propertyName) {
    const propertiesCopy = {};
    Object.keys(node.properties).forEach(property => {
      const propertyObject = node.properties[property];

      if (property === propertyName) {
        propertiesCopy[propertyName] = {
          ...propertyObject,
          value: propertyValue
        };
      } else {
        propertiesCopy[property] = { ...propertyObject };
      }
    });

    return propertiesCopy;
  }
  return null;
}

/**
 * Returns a function that will execute
 * the given function after waitTime number
 * of milliseconds passes after the last invoke
 * @param {function} func the function to execute
 * @param {number} waitTime the wait time in ms before executing the func
 */
const debounce = (func, waitTime) => {
  if (!func || !waitTime || waitTime < 0) {
    throw new InvalidParameterError(
      'Debounce function and waitTime passed in must not be null'
    );
  }

  let timeout;

  return function functionToExecute(...args) {
    const callbackFunc = () => {
      timeout = null;

      func(...args);
    };

    clearTimeout(timeout); // everytime functionToExecute is invoked, clears timeout

    timeout = setTimeout(callbackFunc, waitTime);
  };
};

/**
 * Takes in an object and returns the string
 * version of it.
 * @param {any} object the object to turn into a string
 */
const stringify = object =>
  typeof object === 'string' ? object : JSON.stringify(object);

/**
 * Takes in a value and returns it as a number
 * if the value is a valid number. If not,
 * returns the original value as is
 * @param {any} originalValue the value to turn into a number
 */
const numberfy = originalValue => {
  if (originalValue === undefined || originalValue === null) {
    return originalValue;
  }

  let value = stringify(originalValue);
  if (value.trim() !== '') {
    value = Number(originalValue);
  }

  if (isNaN(value)) {
    value = originalValue;
  }

  return value;
};

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
 */
const formatInitialVariableValue = (node, rowData) => {
  if (!node) {
    return null;
  }

  let value;
  if (node.type === 'data') {
    if (!rowData) {
      const fileContent = readFile(node.properties.source.value).content;
      value = jsonParser(fileContent);
    } else {
      value = rowData.initialValue;
    }
  } else {
    value = numberfy(node.properties.value.value);
    if (typeof value !== 'number') {
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
const formatCurrentVariableValue = value => {
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
  } else if (wrapper && value) {
    return wrapper + value + wrapper;
  } else {
    return '';
  }
};

/**
 * Given a value, parses the value into JSON and returns.
 * If the value cannot be parsed, returns the value as is
 * @param {any} value the value to parse
 */
const jsonParser = value => {
  try {
    return JSON.parse(value);
  } catch (err) {
    return value;
  }
};

/**
 * Given a user input value for a variable,
 * returns an object with keys [type, value] where
 * type is the type of user input (number, string, expression),
 * and value is the converted user input into the correct type.
 * Essentially, VariableView display -> Idyll value
 * @param {any} value the user input
 */
const convertInputToIdyllValue = value => {
  if (!value) {
    return { type: 'string', value: '' };
  }

  const quotes = ["'", '"'];

  value = numberfy(value);
  if (typeof value === 'number') {
    return { type: 'number', value: value };
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

    return { type: 'string', value: value };
  }

  try {
    return { type: 'expression', value: JSON.parse(value) };
  } catch (e) {
    // an expression
    return { type: 'expression', value: trimVariableValue(value, '`') };
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
 * Given a path source, tries to synchronously read
 * the file and return an object with its contents.
 * If an error occurs, returns an object with null content
 * and its error.
 * @param {string} source the path to the file
 */
const readFile = source => {
  if (!source) {
    return null;
  }

  const fileType = path.extname(source);

  let data = '';

  try {
    data = fs.readFileSync(source, 'utf8');
  } catch (err) {
    return { content: null, error: err };
  }

  if (fileType === '.csv') {
    data = stringify(
      parse(data, {
        columns: true,
        skip_empty_lines: true,
        cast: true
      })
    );
  }
  return { content: data, error: null };
};

module.exports = {
  getNodeById,
  deleteNodeById,
  updateNodeById,
  getRandomId,
  isChildOf,
  getTextContainerIndex,
  isDifferentActiveNode,
  formatString,
  getUpdatedPropertyList,
  debounce,
  throttle,
  stringify,
  numberfy,
  formatInitialVariableValue,
  formatCurrentVariableValue,
  convertInputToIdyllValue,
  readFile,
  jsonParser
};
