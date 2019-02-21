import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

function createWindow() {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;
  const sqlite3 = require('sqlite3');

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height
  });

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  win.webContents.openDevTools();

  // Database creation
  // or /path/to/database/file.db
  const Sequelize = require('sequelize');

  const sequelize = new Sequelize('test', 'testuser', 'testpwd', {
    host: 'localhost',
    dialect: 'sqlite',
    operatorsAliases: false,

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },

    // SQLite only
    storage: 'database.sqlite'
  });

  // Database events catcher (if growing, put it in external file)
  ipcMain.on('databaseSelectQuery', function () {

    sequelize
      .authenticate()
      .then(() => {
        console.log('Connection has been established successfully.');

        const User = sequelize.define('user', {
          firstName: {
            type: Sequelize.STRING
          },
          lastName: {
            type: Sequelize.STRING
          }
        });

        // force: true will drop the table if it already exists
        User.sync({force: true}).then(() => {
          // Table created
          return User.create({
            firstName: 'John',
            lastName: 'Hancock'
          });
        }).then(() => {

          User.findAll().then(users => {
            console.log(users)
            win.webContents.send('databaseSelectQueryResults', users);
          })
        });
      })
      .catch(err => {
        console.error('Unable to connect to the database:', err);
      });
  });

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

}

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
