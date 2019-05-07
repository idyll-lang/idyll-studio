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

    this.filePath = '';
    this.idyll;
    this.workingDir = '';

    this.electronWorkingDir = require('path').dirname(require.main.filename);
    // Menu commands
    menu.on('file:open', this.handleFileOpen.bind(this));
    menu.on('file:save', this.handleFileSave.bind(this));

    // Deploying command
    this.publish = this.publish.bind(this);
    this.getProjectToken = this.getProjectToken.bind(this);
    ipcMain.on('deploy', (event, message) => {
      if (this.idyll) {
        this.idyll.build();
        this.publish();
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

    this.filePath = file;

    var slash = '\\';
    if (process.platform === 'darwin') {
      slash = '/';
    }
    this.workingDir = this.filePath.substring(
      0,
      this.filePath.lastIndexOf(slash)
    );

    // Instantiate an Idyll instance
    this.idyll = Idyll({
      inputFile: this.filePath,
      output: this.workingDir + '/build/',
      componentFolder: this.workingDir + '/components/',
      dataFolder: this.workingDir + '/data',
      layout: 'centered',
      theme: 'github'
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
    compile(fileContent, undefined)
      .then(ast => {
        this.mainWindow.webContents.send('idyll:ast', ast);
        this.mainWindow.webContents.send('idyll:path', this.filePath);
        this.mainWindow.webContents.send(
          'idyll:components',
          idyll.getComponents()
        );
        this.mainWindow.webContents.send('idyll:datasets', idyll.getDatasets());
        this.mainWindow.webContents.send();
      })
      .catch(error => {
        console.log(error);
      });
  }

  // Saves current markup to open idyll project
  handleFileSave() {
    // // Let's render process know ready to receive markup to save
    // this.mainWindow.webContents.send('idyll:save', 'Saved!');
    // // Saves markup to file
    // if (this.filePath !== undefined) {
    //   ipcMain.on('save', (event, content) => {
    //     fs.writeFile(this.filePath, content, err => {
    //       if (err) throw err;
    //     });
    //   });
    // }
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
      formData.token = token;

      let { alias } = await request.post({
        url: urljoin(IDYLL_PUB_API, 'deploy'),
        formData: formData,
        json: true
      });
      console.log(`Project deployed at https://idyll.pub/post/${alias}/`);
    } catch (err) {
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
      console.log('Deploying...');
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
      console.log('Getting new url...');
      fs.writeFileSync(tokenPath, token, { encoding: 'utf-8' });
    }
    return token;
  }
}

module.exports = Main;
