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
    }
  }

  // get url by token
  getUrlByToken(inputToken) {
    return this.data.tokenUrls.filter(
      tokenUrlMap => tokenUrlMap.token === inputToken
    );
  }

  // get last session
  getLastSessionProjectPath() {
    return this.data.lastOpenedProject.filePath;
  }

  // add url and token
  addNewUrlTokenPair(url, token) {
    let dataClone = { ...this.data };
    dataClone.tokenUrls.push({ token: token, url: url });

    this.data = dataClone;

    // serialize data back to file
    updateFile(this.path, JSON.stringify(this.data));
  }

  // update / put session
  updateLastOpenedProject(projectPath) {
    this.data = {
      ...this.data,
      lastOpenedProject: { filePath: projectPath, lastOpened: Date.now() }
    };

    updateFile(this.path, JSON.stringify(this.data));
  }
}

function updateFile(path, contents) {
  try {
    fs.writeFileSync(path, contents);
  } catch (error) {
    console.log('Error saving url and publishing token: ', error);
  }
}

module.exports = DataStore;
