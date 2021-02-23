const { InvalidParameterError } = require('../../../error');
import throttle from 'lodash.throttle';
import fs from 'fs';
import path from 'path';
import parse from 'csv-parse/lib/sync';
import copy from 'fast-copy';

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

const getParentNodeById = (node, id) => {
  if (!node.children || !node.children.length) {
    return false;
  }
  for (var i = 0; i < node.children.length; i++) {
    if (node.children[i].id === id) {
      return node;
    }
  }
  for (var i = 0; i < node.children.length; i++) {
    const _parent = getParentNodeById(node.children[i], id);
    if (_parent) {
      return _parent;
    }
  }
  return false;
};

const updateNodeById = (ast, id, newProps) => {
  const targetNode = getNodeById(ast, id);

  Object.keys(newProps).forEach((key) => {
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

const getTextContainerIndex = (node) => {
  let currentNodeIndex = 0;
  while (
    node.children[currentNodeIndex].type === 'data' ||
    node.children[currentNodeIndex].type === 'var'
  ) {
    currentNodeIndex++;
  }

  return currentNodeIndex;
};

const reassignNodeIds = (node) => {
  const copyNode = copy(node);
  reassignNodeIdsHelper(copyNode);

  return copyNode;
};

const reassignNodeIdsHelper = (node) => {
  if (node) {
    node.id = getRandomId();

    (node.children || []).forEach((child) => {
      reassignNodeIdsHelper(child);
    });
  }
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
const formatString = (value) => {
  if (!value || typeof value !== 'string') {
    return '';
  }

  return value
    .split(/[\s-]+/g)
    .map(
      (word) =>
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
function getUpdatedPropertyList(
  node,
  propertyName,
  propertyValue,
  propertyType
) {
  if (node && propertyName) {
    const propertiesCopy = {};
    let _hasUpdated = false;
    Object.keys(node.properties).forEach((property) => {
      const propertyObject = node.properties[property];

      if (property === propertyName) {
        _hasUpdated = true;
        propertiesCopy[propertyName] = {
          ...propertyObject,
          value: propertyValue,
        };
      } else {
        propertiesCopy[property] = { ...propertyObject };
      }
    });
    if (!_hasUpdated) {
      propertiesCopy[propertyName] = {
        type: propertyType || 'value',
        value: propertyValue,
      };
    }

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
 * version of it. Returns "null" if object is null and
 * undefined if object is undefined
 * @param {any} object the object to turn into a string
 */
const stringify = (object) => {
  return typeof object === 'string' ? object : JSON.stringify(object);
};

/**
 * Takes in a value and returns it as a number
 * if the value is a valid number. If not,
 * returns the original value as is
 * @param {any} originalValue the value to turn into a number
 */
const numberfy = (originalValue) => {
  if (originalValue === undefined || originalValue === null) {
    return originalValue;
  }

  let value = stringify(originalValue);
  if (
    value.trim() !== '' &&
    typeof originalValue !== 'object' &&
    typeof originalValue !== 'boolean'
  ) {
    value = Number(originalValue);
  }

  if (isNaN(value)) {
    value = originalValue;
  }

  return value;
};

/**
 * If the value passed in is "true" or "false" returns
 * true or false booleans. Otherwise, returns the original value
 * @param {any} originalValue the value passed in
 */
const boolify = (originalValue) => {
  if (originalValue === 'true' || originalValue === 'false') {
    return originalValue === 'true' ? true : false;
  } else {
    return originalValue;
  }
};

/**
 * Given a value, parses the value into JSON and returns.
 * If the value cannot be parsed, returns the value as is
 * @param {any} value the value to parse
 */
const jsonParser = (value) => {
  try {
    return JSON.parse(value);
  } catch (err) {
    return value;
  }
};

/**
 * Given a path source, tries to synchronously read
 * the file and return an object with its contents as a string.
 * If the file is a csv, returns its contents in JSON format
 * If an error occurs, returns an object with null content
 * and its error.
 * @param {string} source the path to the file
 */
const readFile = (source) => {
  if (!source || typeof source !== 'string') {
    return { content: null, error: 'Source file is invalid. Cannot read file' };
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
        cast: true,
        ltrim:true,
        rtrim:true
      })
    );
  }
  return { content: data, error: null };
};

module.exports = {
  getNodeById,
  getParentNodeById,
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
  readFile,
  jsonParser,
  boolify,
  reassignNodeIds,
};
