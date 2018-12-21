const { app, Menu } = require("electron");
const EventEmitter = require("events");

class IdyllDesktopMenu extends EventEmitter {
  constructor(electronObjects) {
    super();
    const template = [
      {
        label: "File",
        submenu: [
          {
            label: "Open File",
            accelerator: "CmdOrCtrl+O",
            click: () => {
              this.emit("file:open");
            }
          }
        ]
      }
    ];

    // For macs make the first label the app name
    if (process.platform === "darwin") {
      template.unshift({
        label: app.getName()
      });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu); // use menu we just created
    this.mainWindow = electronObjects.win;
  }
}

module.exports = IdyllDesktopMenu;
