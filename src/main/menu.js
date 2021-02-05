const { app, Menu, ipcMain } = require('electron');
const EventEmitter = require('events');

class IdyllDesktopMenu extends EventEmitter {
  constructor(electronObjects) {
    super();
    const template = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New...',
            accelerator: 'CmdOrCtrl+N',
            click: () => {
              this.emit('file:new'); // tells index.js what to listen for
            }
          },
          {
            label: 'Open File',
            accelerator: 'CmdOrCtrl+O',
            click: () => {
              this.emit('file:open'); // tells index.js what to listen for
            }
          },
          {
            label: 'Save',
            accelerator: 'CmdOrCtrl+S',
            click: () => {
              this.emit('file:save');
            }
          }
        ]
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Toggle Sidebar',
            accelerator: 'CmdOrCtrl+B',
            click: () => {
              this.emit('toggle:sidebar');
            }
          }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'delete' },
          { role: 'selectall' }
        ]
      }
    ];

    // For macs make the first label the app name
    if (process.platform === 'darwin') {
      template.unshift({
        label: app.name
      });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu); // use menu we just created
    this.mainWindow = electronObjects.win;
  }
}

module.exports = IdyllDesktopMenu;
