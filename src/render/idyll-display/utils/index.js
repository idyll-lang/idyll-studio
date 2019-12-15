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

module.exports = {
  getNodeById,
  deleteNodeById,
  updateNodeById,
  getRandomId
};
