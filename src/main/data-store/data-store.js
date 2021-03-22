const electron = require('electron');
const fs = require('fs');
const path = require('path');
const error = require('../../error');

// Reference: https://github.com/ccnokes/electron-tutorials/blob/master/storing-data/store.js

// { files: [{filePath: ..., dateLastOpened: ..., token: ..., }]}
class DataStore {
  constructor(
    defaultData = {
      files: [],
    }
  ) {
    const userDataPath = (electron.app || electron.remote.app).getPath(
      'userData'
    );

    this.path = path.join(userDataPath, 'project-data.json');
    try {
      this.data = JSON.parse(fs.readFileSync(this.path));
    } catch (error) {
      console.log(error, 'Creating a new store...');
      this.data = defaultData;
      updateFile(this.path, JSON.stringify(this.data));
    }
  }

  getAllFiles() {
    return getDeepCopyOfFiles(this.data.files);
  }

  /**
   * Returns a file json with its metadata
   * { filePath: ..., dateLastOpened: ..., token: ..., url: ...}
   * @param {string} inputToken the .idyll token contents
   * @returns
   */
  getFileByToken(inputToken) {
    checkParams(inputToken, 'inputToken');

    const file = this.data.files.filter((file) => file.token === inputToken)[0];

    return { ...file };
  }

  /**
   * Returns a {token: url} pair from the project.
   * If the token/url pair does not exist in the file,
   * returns null
   * @param {string} inputToken the .idyll token contents
   */
  getTokenUrlByToken(inputToken) {
    checkParams(inputToken, 'inputToken');

    const file = this.getFileByToken(inputToken);

    return file ? { token: file.token, url: file.url } : null;
  }

  getFileIndexByFilePath(filePath) {
    checkParams(filePath, 'filePath');

    const index = this.data.files.findIndex(
      (file) => file.filePath === filePath
    );

    return index;
  }

  /**
   * Given a number n, returns the top n most recently opened
   * files in the data store
   * @param {integer} n the number of files to return
   * @returns an array of files containing metadata for each file
   *          object
   */
  getTopNRecentFiles(n) {
    checkParams(n, 'n');

    const files = getDeepCopyOfFiles(this.data.files);
    sortByMostRecent(files);
    if (n < files.length) {
      return files.slice(0, n);
    } else {
      return files;
    }
  }

  /**
   * Given a file, updates the store and adds file to
   * local store
   * @param {Object} file the file request with metadata
   *                      { filePath, token, url }
   */
  addFile(newFile) {
    checkParams(newFile, 'projectPath');

    if (!this.data.files.some((file) => file.filePath === newFile.filePath)) {
      const files = getDeepCopyOfFiles(this.data.files);
      files.push({
        filePath: newFile.filePath,
        dateLastOpened: Date.now(),
        token: newFile.token,
        url: newFile.url,
      });

      this.data = { files: files };

      writeToStore(this.path, JSON.stringify(this.data));
    }
  }

  updateFile(newFile) {
    checkParams(newFile, 'file');

    const index = this.getFileIndexByFilePath(newFile.filePath);
    if (index < 0) {
      this.addFile(newFile);
    } else {
      const file = createNewFile(newFile, this.data.files[index]);

      const files = getDeepCopyOfFiles(this.data.files);
      files.splice(index, 1, file);

      this.data = { files: files };

      writeToStore(this.path, JSON.stringify(this.data));
    }
  }

  // /**
  //  * Gets the last opened session's project file path.
  //  * Returns null if no project has been opened before.
  //  * Otherwise returns a string path
  //  */
  // getLastSessionProjectPath() {
  //   const lastProject = this.data.lastOpenedProject['filePath'];
  //   return lastProject ? lastProject : null;
  // }

  // /**
  //  * Updates the file with the {token: url}
  //  * @param {string} url the publishing url
  //  * @param {string} token the corresponding token string
  //  */
  // addTokenUrlPair(url, token) {
  //   checkParams(url, 'url');
  //   checkParams(token, 'token');

  //   const existingToken = this.getTokenUrlByToken(token);

  //   if (!existingToken) {
  //     // get deep copy of tokenUrl array
  //     const tokenUrls = getDeepCopyOfTokenUrls(this.data.tokenUrls);
  //     tokenUrls.push({ token: token, url: url });

  //     // get copy of last session info
  //     const lastOpened = { ...this.data.lastOpenedProject };

  //     const dataClone = { tokenUrls: tokenUrls, lastOpenedProject: lastOpened };
  //     this.data = dataClone;

  //     // serialize data back to file
  //     updateFile(this.path, JSON.stringify(this.data));
  //   }
  // }

  // /**
  //  * Updates the file and stores the last session's
  //  * project path with the date / time it was opened
  //  * @param {string} projectPath
  //  */
  // updateLastOpenedProject(projectPath) {
  //   checkParams(projectPath, 'projectPath');

  //   const tokenUrls = getDeepCopyOfTokenUrls(this.data.tokenUrls);
  //   const lastOpenedProject = { filePath: projectPath, lastOpened: Date.now() };

  //   const dataClone = {
  //     tokenUrls: tokenUrls,
  //     lastOpenedProject: lastOpenedProject,
  //   };

  //   this.data = dataClone;

  //   updateFile(this.path, JSON.stringify(this.data));
  // }
}

function createNewFile(newFile, oldFile) {
  return {
    filePath: newFile.filePath ? newFile.filePath : oldFile.filePath,
    dateLastOpened: Date.now(),
    token: newFile.token ? newFile.token : oldFile.token,
    url: newFile.url ? newFile.url : oldFile.url,
  };
}

/**
 * Updates the data store file with the current data
 * @param {string} path the file path for the project
 * @param {string} contents the data contents
 */
function writeToStore(path, contents) {
  try {
    // console.log('Updating file...', contents);
    fs.writeFileSync(path, contents);
  } catch (error) {
    console.log(error);
  }
}

function sortByMostRecent(files) {
  files.sort((a, b) => {
    return new Date(b.dateLastOpened) - new Date(a.dateLastOpened);
  });
}

/**
 * Returns a deep copy of the file list
 * @param {string} files the list of files
 */
function getDeepCopyOfFiles(files) {
  return files.map((file) => ({
    ...file,
  }));
}

function checkParams(input, inputName) {
  if (!input) {
    throw new error.InvalidParameterError(
      inputName + ' must not be null or undefined'
    );
  }
}

module.exports = DataStore;
