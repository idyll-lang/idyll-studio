const { dialog, ipcMain, app } = require('electron');
const Menu = require('./menu');
const fs = require('fs');
const Idyll = require('idyll');
const p = require('path');
const readdir = require('recursive-readdir');
const request = require('request-promise-native');
const urljoin = require('url-join');
const IDYLL_PUB_API = 'https://api.idyll.pub';
const compile = require('idyll-compiler');

class Main {
  constructor(electronObjects) {
    this.mainWindow = electronObjects.win;
    const menu = new Menu(electronObjects);

    this.store = electronObjects.store;

    this.electronWorkingDir = require('path').dirname(require.main.filename);

    ipcMain.on('client:openProject', this.handleFileOpen.bind(this));

    // Menu commands
    menu.on('file:open', this.handleFileOpen.bind(this));
    menu.on('file:save', this.handleFileSave.bind(this));
    menu.on('toggle:sidebar', this.handleToggleSidebar.bind(this));

    // Deploy methods
    this.publish = this.publish.bind(this);
    this.getProjectToken = this.getProjectToken.bind(this);

    // Set up deploy connection
    // Deploying command
    ipcMain.on('deploy', (event, message) => {
      if (this.idyll) {
        // Send to render process the url
        this.mainWindow.webContents.send('publishing', `Publishing...`);
        this.idyll.build(this.workingDir).on('update', () => {
          this.publish();
        });
      }
    });
  }

  handleFileOpen() {
    // Returns absolute path of file
    const files = dialog.showOpenDialog(this.mainWindow, {
      properties: ['openFile'],
      filters: [
        {
          // Give a specific filter on what
          // type of files we are looking for
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
    const file = files[0];
    this.executeOnProjectOpen(file);
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
    const tokenPath = p.join(projectDir, '.idyll', 'token');
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

      console.log(alias);
      console.log(`Project deployed at https://idyll.pub/post/${alias}/`);

      // Send to render process the url
      this.mainWindow.webContents.send(
        'url',
        `https://idyll.pub/post/${alias}/`
      );
    } catch (err) {
      this.mainWindow.webContents.send('pub-error', 'error');
      console.log(err);
    }
  }

  /**
   * Try to read the project token from the .idyll directory.
   * If it does not exist, create/save one into .idyll/token.
   */
  async getProjectToken(tokenPath, config) {
    var token;
    try {
      console.log('Deploying');
      token = fs.readFileSync(tokenPath, { encoding: 'utf-8' });
      console.log('Using existing token...');
    } catch (err) {
      let deployment = await request.post({
        url: urljoin(IDYLL_PUB_API, 'create'),
        body: {
          name: config.name
        },
        json: true
      });
      token = deployment.token;
      console.log('Using new token...');
      await fs.writeFile(tokenPath, token, { encoding: 'utf-8' }, function(
        err,
        data
      ) {
        if (err) {
          console.log(err);
        }
      });
    }
    console.log('token: ' + token);
    return token;
  }

  executeOnProjectOpen(file) {
    this.filePath = file;

    this.workingDir = getWorkingDirectory(this.filePath);

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
    const staticContentFilter = { urls: ['static/*'] };
    this.mainWindow.webContents.session.webRequest.onBeforeRequest(
      staticContentFilter,
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

    // Accepts a file path
    const fileContent = fs.readFileSync(file).toString();

    // Compile contents
    compile(fileContent, {})
      .then(ast => {
        this.mainWindow.webContents.send('idyll:compile', {
          ast: ast,
          path: this.filePath,
          components: this.idyll.getComponents(),
          datasets: this.idyll.getDatasets()
        });
      })
      .catch(error => {
        console.log(error);
      });

    this.store.updateLastOpenedProject(this.filePath);
  }
}

function getWorkingDirectory(filePath) {
  const slash = p.sep;
  return filePath.substring(0, filePath.lastIndexOf(slash));
}

module.exports = Main;
