const { dialog, ipcMain, shell } = require('electron');
const Menu = require('./menu');
const fs = require('fs');
const Idyll = require('idyll');
const { createProject } = require('idyll/bin/cmds/create-project');
const p = require('path');
const readdir = require('recursive-readdir');
const request = require('request-promise-native');
const urljoin = require('url-join');
const IDYLL_PUB_API = 'https://api.idyll.pub';
const IDYLL_PUB_URL = 'https://idyll.pub/post';
const compile = require('idyll-compiler');
const { getWorkingDirectory, getTokenPath } = require('./utils');

function slugify(text) {
  return text
    .toString()
    .split(/([A-Z][a-z]+)/)
    .join('-')
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

class Main {
  constructor(electronObjects) {
    this.mainWindow = electronObjects.win;
    const menu = new Menu(electronObjects);

    this.store = electronObjects.store;

    this.electronWorkingDir = require('path').dirname(require.main.filename);

    ipcMain.on('client:openProject', this.handleFileOpen.bind(this));
    ipcMain.on('client:createProject', this.handleCreateProject.bind(this));

    // Menu commands
    menu.on('file:open', this.handleFileOpen.bind(this));
    menu.on('file:save', this.handleFileSave.bind(this));
    menu.on('toggle:sidebar', this.handleToggleSidebar.bind(this));
    menu.on('file:new', () => {
      this.mainWindow.webContents.send('idyll:compile', {
        ast: null
      });
    })

    // Deploy methods
    this.publish = this.publish.bind(this);
    this.getProjectToken = this.getProjectToken.bind(this);

    // Set up deploy connection
    // Deploying command
    ipcMain.on('deploy', (event, message) => {
      if (this.idyll) {
        // Send to render process the url
        this.mainWindow.webContents.send('publishing');
        this.idyll
          .build(this.workingDir)
          .on('update', () => {
            this.publish();
          })
          .on('error', err => {
            console.log(err);
            this.mainWindow.webContents.send('pub-error', err.message);
          });
      }
    });
  }

  async handleCreateProject(event, projectName) {
    // Returns absolute path of file
    try {
      const dir = await dialog.showOpenDialog(this.mainWindow, {
        properties: ['openDirectory']
      });

      // If no files, don't open
      if (!dir || dir.canceled || !dir.filePaths.length) {
        return;
      }

      // Gets full file path
      const projectDir = dir.filePaths[0];
      const slugName = slugify(projectName);
      await createProject({
        'package-name': `${slugName}`,
        'template': 'article',
        'post-dir': `${projectDir}/${slugName}`,
        'installDependencies': true
      })

      this.executeOnProjectOpen(`${projectDir}/${slugName}/index.idyll`);
    } catch (err) {
      console.log(err);
    }
  }
  async handleFileOpen() {
    // Returns absolute path of file
    try {
      const files = await dialog.showOpenDialog(this.mainWindow, {
        properties: ['openFile'],
        filters: [
          {
            // Give a specific filter on acceptable file types
            name: 'Idyll',
            extensions: ['idyll', 'idl']
          }
        ]
      });

      // If no files, don't open
      if (!files) {
        return;
      }

      // Gets full file path
      const file = files.filePaths[0];
      this.executeOnProjectOpen(file);
    } catch (err) {
      console.log(err);
    }
  }

  // Saves current markup to open idyll project
  handleFileSave() {
    // Let's render process know ready to receive markup to save
    this.mainWindow.webContents.send('idyll:save', 'Saved!');
    // Saves markup to file
    if (this.filePath !== undefined) {
      ipcMain.on('save', (event, content) => {
        fs.writeFile(this.filePath, content, err => {
          if (err) throw err;
        });
      });
    }
  }

  handleToggleSidebar() {
    this.mainWindow.webContents.send('toggleSidebar');
  }

  async publish() {
    const projectDir = this.workingDir;
    const tokenPath = getTokenPath(p, projectDir);
    const config = require(p.join(projectDir, 'package.json'));
    try {
      let buildDir = p.join(projectDir, 'build');
      let token = await this.getProjectToken(tokenPath, config);
      let files = await readdir(buildDir);

      let formData = files.reduce((acc, f) => {
        acc[p.relative(buildDir, f)] = fs.createReadStream(f);
        return acc;
      }, {});
      formData['token'] = token;

      let { alias } = await request.post({
        url: urljoin(IDYLL_PUB_API, 'deploy'),
        formData: formData,
        json: true,
        headers: { 'Content-Type': 'application/json' }
      });

      const url = IDYLL_PUB_URL + `/${alias}/`;

      // Send to render process the url
      this.mainWindow.webContents.send('published-url', url);

      this.store.addTokenUrlPair(url, token);
    } catch (err) {
      console.log(err);
      this.mainWindow.webContents.send('pub-error', err.message);
    }
  }

  /**
   * Try to read the project token from the .idyll directory.
   * If it does not exist, create/save one into .idyll/token.
   */
  async getProjectToken(tokenPath, config) {
    var token;
    try {
      token = fs.readFileSync(tokenPath, { encoding: 'utf-8' });
    } catch (err) {
      let deployment = await request.post({
        url: urljoin(IDYLL_PUB_API, 'create'),
        body: {
          name: config.name
        },
        json: true
      });
      token = deployment.token;
      await fs.writeFile(tokenPath, token, { encoding: 'utf-8' }, function(
        err,
        data
      ) {
        if (err) {
          console.log(err);
          this.mainWindow.webContents.send('pub-error', err.message);
        }
      });
    }
    return token;
  }

  executeOnProjectOpen(file) {
    this.filePath = file;

    this.workingDir = getWorkingDirectory(p, this.filePath);

    // Instantiate an Idyll instance
    this.idyll = Idyll({
      inputFile: this.filePath,
      output: this.workingDir + '/build/',
      componentFolder: this.workingDir + '/components/',
      dataFolder: this.workingDir + '/data',
      layout: 'centered',
      theme: 'default'
    });

    // filter to catch all requests to static folder
    this.mainWindow.webContents.session.webRequest.onBeforeRequest(
      (details, callback) => {
        const { url } = details;
        if (url.indexOf(`${this.electronWorkingDir}/static/`) > -1) {
          const localURL = url.replace(
            this.electronWorkingDir,
            this.workingDir
          );
          callback({
            cancel: false,
            redirectURL: encodeURI(localURL)
          });
        } else {
          callback({
            cancel: false
          });
        }
      }
    );

    // Serialize file contents
    let fileContent = '';
    try {
      fileContent = fs.readFileSync(file).toString();
    } catch (err) {
      console.log(err);
    }

    // Compile contents
    compile(fileContent, {})
      .then(async ast => {
        // Get project URL if it exists
        const tokenPath = getTokenPath(p, this.workingDir);

        const url = await requestUrl(tokenPath, this.store);

        // send ast and contents over to renderer
        this.mainWindow.webContents.send('idyll:compile', {
          ast: ast,
          path: this.filePath,
          components: this.idyll.getComponents(),
          datasets: this.idyll.getDatasets(),
          url: url
        });

        this.store.updateLastOpenedProject(this.filePath);
      })
      .catch(error => {
        console.log(error, 'Could not open file: ' + this.filePath);
      });
  }
}

const requestUrl = async (tokenPath, store) => {
  let url = '';
  try {
    const token = fs.readFileSync(tokenPath, { encoding: 'utf-8' });
    const tokenUrl = store.getTokenUrlByToken(token);
    if (tokenUrl) {
      url = tokenUrl.url;
    } else {
      const res = await request.get({
        url: `https://api.idyll.pub/lookup/${token}`
      });

      const alias = JSON.parse(res).alias;

      url = IDYLL_PUB_URL + `/${alias}/`;
      store.addTokenUrlPair(url, token);
    }
  } catch (error) {
    console.log(error, 'Token does not exist yet.');
  }
  return url;
};

module.exports = Main;
