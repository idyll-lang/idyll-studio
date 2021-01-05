const { InvalidParameterError } = require('../../../error');

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
function getUpdatedPropList(node, propertyName, propertyValue) {
  if (node && propertyName) {
    console.log(node);
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

module.exports = {
  getNodeById,
  deleteNodeById,
  updateNodeById,
  getRandomId,
  isChildOf,
  isDifferentActiveNode,
  formatString,
  getUpdatedPropList,
  debounce
};
