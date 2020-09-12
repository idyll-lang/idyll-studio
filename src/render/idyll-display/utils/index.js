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

const debounce = (func, waitTime) => {
  let timeout;

  console.log(waitTime);

  return function functionToExecute(...args) {
    const callbackFunc = () => {
      timeout = null;

      console.log(...args);
      func(...args);
    };

    clearTimeout(timeout); // everytime functionToExecute is invoked, clears timeout

    timeout = setTimeout(callbackFunc, waitTime);
  };
};

const debounceHandler = (...args) => {
  const debounced = debounce(...args);
  return function (e) {
    e.persist();

    console.log(e.target.value);
    return debounced(e);
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
  debounce,
  debounceHandler,
};
