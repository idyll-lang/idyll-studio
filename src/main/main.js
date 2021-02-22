const { dialog, ipcMain, shell, Notification } = require('electron');
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
const open = require('open');
const chokidar = require('chokidar');
const spawn = require('cross-spawn');

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

    this.componentWatchMap = {};

    ipcMain.on('client:openProject', this.handleFileOpen.bind(this));
    ipcMain.on('client:createProject', this.handleCreateProject.bind(this));
    ipcMain.on('client:editComponent', this.handleEditComponent.bind(this));
    ipcMain.on('client:duplicateComponent', this.handleDuplicateComponent.bind(this));



    // Menu commands
    menu.on('file:open', this.handleFileOpen.bind(this));
    menu.on('file:save', this.handleFileSave.bind(this));
    menu.on('working-dir:open', this.handleOpenProject.bind(this));
    menu.on('working-dir:install', this.handleInstallProject.bind(this));
    menu.on('toggle:sidebar', this.handleToggleSidebar.bind(this));
    menu.on('toggle:devtools', this.handleToggleDevtools.bind(this));
    menu.on('file:new', () => {
      this.mainWindow.webContents.send('idyll:compile', {
        ast: null
      });
    });

    this.mainWindow.webContents.on('new-window', function(e, url) {
      e.preventDefault();
      shell.openExternal(url);
    });

    // Deploy methods
    this.publish = this.publish.bind(this);
    this.getProjectToken = this.getProjectToken.bind(this);

    // Set up deploy connection
    // Deploying command
    ipcMain.on('deploy', (event, content) => {
      if (this.idyll) {
        // Send to render process the url
        this.mainWindow.webContents.send('publishing');

        fs.writeFile(this.filePath, content, () => {
          this.idyll
            .build(this.workingDir)
            .on('update', () => {
              this.publish();
            })
            .on('error', err => {
              console.log(err);
              this.mainWindow.webContents.send('pub-error', err.message);
            });
        });
      }
    });
    // import dataset
    ipcMain.on('importDataset', (event, message) => {
      const filePath = `${this.workingDir}/data/${p.basename(message)}`;

      if (filePath !== message) {
        fs.copyFileSync(message, filePath);
      }
      this.mainWindow.webContents.send('data:import');
    });
  }

  handleEditComponent(event, component) {
    open(component.path);
    if (!this.componentWatchMap[component.path]) {
      chokidar.watch(component.path).on('all', (event, path) => {
        this.mainWindow.webContents.send('components:update', component);
      });
      this.componentWatchMap[component.path] = true;
    }
  }

  handleDuplicateComponent(event, component) {
    let copyIncrementer = 0;
    let copyPath;

    const componentPath = component.path.includes('node_modules/idyll-components/dist/') ? component.path.replace(/node_modules\/idyll\-components\/dist\/(es|cjs)\//g, 'node_modules/idyll-components/src/') : component.path;

    do {
      copyIncrementer += 1;
      copyPath = `${this.workingDir}/components/${p.basename(componentPath).replace(/(\-\d+)?\.jsx?/g, '')}-${copyIncrementer}.js`;
    } while (fs.existsSync(copyPath))

    fs.copyFileSync(componentPath, copyPath);
    const infile = fs.readFileSync(componentPath, 'utf-8').toString();
    const outfile = infile.replace(/from '\.\//g, "from 'idyll-components/dist/cjs/").replace(/from "\.\//g, "from \"idyll-components/dist/cjs/").replace(/require\('\.\//g, "require('idyll-components/dist/cjs/").replace(/require\("\.\//g, "require(\"idyll-components/dist/cjs/");
    fs.writeFileSync(copyPath, outfile);
    const newComponent = { path: copyPath, name: `${p.basename(copyPath).replace(/\.jsx?/g, '')}` };

    this.mainWindow.webContents.send('components:add', newComponent);
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

      this.mainWindow.webContents.send('project-create-folder-selected');

      // Gets full file path
      const projectDir = dir.filePaths[0];
      const slugName = slugify(projectName);
      await createProject({
        'package-name': `${slugName}`,
        template: p.resolve(`${__dirname}/../../project-template/`),
        customTemplate: true,
        'post-dir': `${projectDir}/${slugName}`,
        installDependencies: true
      });

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

  // Opens current project folder in system viewer
  handleOpenProject() {
    if (!this.workingDir) {
      return;
    }

    open(this.workingDir);
  }


  // Run npm install in the current project
  handleInstallProject() {
    if (!this.workingDir) {
      return;
    }

    console.log('Running npm install in directory', this.workingDir);
    let installer = spawn('npm', ['install'], {
      cwd: this.workingDir,
      stdio: 'ignore'
    });
    installer.on('close', code => {
      if (code !== 0) {
        const notification = {
          title: 'Installation failed',
          body: 'Could not install project dependencies.'
        }
        new Notification(notification).show()
        console.log('Could not install Idyll dependencies.');
        return;
      }
      const notification = {
        title: 'Installation finished',
        body: 'Project dependencies installed successfully.'
      }
      new Notification(notification).show()
      console.log('Project dependencies installed successfully.');
    });
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
  handleToggleDevtools() {
    this.mainWindow.webContents.toggleDevTools();
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
        acc[p.relative(buildDir, f).replace(/\\/g, '/')] = fs.createReadStream(f);
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
        let { url } = details;
        url = decodeURI(url);
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
    console.log('Publish token does not exist yet.');
  }
  return url;
};

module.exports = Main;
