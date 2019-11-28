/**
 * Gets the working directory of a file
 * @param {*} p a path module
 * @param {string} filePath the string filePath
 */
const getWorkingDirectory = (p, filePath) => {
  const slash = p.sep;
  return filePath.substring(0, filePath.lastIndexOf(slash));
};

/**
 * Gets the .idyll token of the project
 * @param {*} p a path module
 * @param {string} workingDir the working directory of the file
 */
const getTokenPath = (p, workingDir) => {
  const tokenPath = p.join(workingDir, '.idyll', 'token');
  return tokenPath;
};

module.exports = { getWorkingDirectory, getTokenPath };
