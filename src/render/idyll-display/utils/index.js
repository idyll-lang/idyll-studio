const { InvalidParameterError } = require('../../../error');
import throttle from 'lodash.throttle';
import fs from 'fs';

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

  let value = originalValue;
  if (value.trim() !== '') {
    value = Number(originalValue);
  }

  if (isNaN(value)) {
    value = originalValue;
  }

  return value;
};

const formatVariable = value => {
  if (!value || typeof value === 'number') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (e) {
    // a string
    return value;
  }
};

const readFile = source => {
  try {
    const data = fs.readFileSync(source, 'utf8');
    return { content: data, error: null };
  } catch (err) {
    return { content: null, error: err };
  }
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
  formatVariable,
  readFile
};
