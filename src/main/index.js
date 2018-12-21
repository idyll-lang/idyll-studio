const { dialog, ipcMain } = require("electron");
const Menu = require("./menu");
const fs = require("fs");

class Main {
  constructor(electronObjects) {
    this.mainWindow = electronObjects.win;
    const menu = new Menu(electronObjects);
    menu.on("file:open", this.handleFileOpen);
  }

  handleFileOpen() {
    // Returns absolute path of file
    const files = dialog.showOpenDialog(this.mainWindow, {
      properties: ["openFile"],
      filters: [
        {
          // Give a specific filter on what
          // type of files we are looking for
          name: "Idyll",
          extensions: ["idyll", "idl"]
        }
      ]
    });

    // If no files
    if (!files) {
      return;
    }

    // Gets full file path
    const file = files[0];

    // Accepts a file path
    const fileContent = fs.readFileSync(file).toString();
    console.log(fileContent);

    this.mainWindow.webContents.send("idyll:markup", fileContent);
  }
}

module.exports = Main;
