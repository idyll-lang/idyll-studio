const electron = require('electron');
const fs = require('fs');
const path = require('path');
// Reference: https://github.com/ccnokes/electron-tutorials/blob/master/storing-data/store.js

class DataStore {
  constructor(defaultData) {
    const userDataPath = (electron.app || electron.remote.app).getPath(
      'userData'
    );

    this.path = path.join(userDataPath, 'project-data.json');

    try {
      this.data = JSON.parse(fs.readFileSync(this.path));
    } catch (error) {
      console.log('Creating a new store...');
      this.data = defaultData;
      updateFile(this.path, this.data);
    }
  }

  // get url by token
  getTokenUrlByToken(inputToken) {
    const tokenUrl = this.data['tokenUrls'].filter(
      tokenUrlMap => tokenUrlMap.token === inputToken
    )[0];

    return tokenUrl;
  }

  // get last session
  getLastSessionProjectPath() {
    const lastProject = this.data.lastOpenedProject['filePath'];
    return lastProject ? lastProject : null;
  }

  // add url and token
  addTokenUrlPair(url, token) {
    const existingToken = this.getTokenUrlByToken(token);
    console.log('Checking for token pair...', existingToken);

    if (!existingToken) {
      console.log('Adding new token pair...');
      let dataClone = { ...this.data };

      dataClone['tokenUrls'].push({ token: token, url: url });

      this.data = dataClone;

      // serialize data back to file
      updateFile(this.path, JSON.stringify(this.data));
    }
  }

  // update / put session
  updateLastOpenedProject(projectPath) {
    let dataClone = { ...this.data };
    dataClone.lastOpenedProject['filePath'] = projectPath;
    dataClone.lastOpenedProject['lastOpened'] = Date.now();

    this.data = dataClone;

    updateFile(this.path, JSON.stringify(this.data));
  }
}

// Given a file path and the contents to write, updates the file
function updateFile(path, contents) {
  try {
    console.log('Updating file...', contents);
    fs.writeFileSync(path, contents);
  } catch (error) {
    console.log('Error: ', error);
  }
}

module.exports = DataStore;
