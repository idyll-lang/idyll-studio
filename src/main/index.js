const { dialog, ipcMain, app } = require("electron");
const Menu = require("./menu");
const fs = require("fs");

class Main {
  constructor(electronObjects) {
    this.mainWindow = electronObjects.win;
    const menu = new Menu(electronObjects);

    this.filePath = "";

    // Menu commands
    menu.on("file:open", this.handleFileOpen);
    menu.on("file:save", this.handleFileSave);
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

    this.filePath = file;

    // Accepts a file path
    const fileContent = fs.readFileSync(file).toString();
    this.mainWindow.webContents.send("idyll:markup", fileContent);
  }

  handleFileSave() {
    if (this.filePath === undefined) {
      const options = {
        defaultPath: app.getPath("documents") + "/my-idyll-post.idyll"
      };

      dialog.showSaveDialog(null, options, path => {
        this.filePath = path;
      });
    }

    // Writes to file given path
    console.log(this.filePath);
    ipcMain.on("save", (event, content) => {
      fs.writeFile(this.filePath, content, err => {
        if (err) throw err;
      });
    });
  }
}

module.exports = Main;
