'use strict'
import { app, protocol, BrowserWindow, dialog, globalShortcut, Menu } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
// import installExtension from 'electron-devtools-installer'
import path from 'path'
const isDevelopment = process.env.NODE_ENV === 'development'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let splash
let close = false
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true }}
])
function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    minHeight: 700,
    minWidth: 1000,
    show: false,
    // eslint-disable-next-line no-undef
    icon: path.join(__static, 'icon.png'),
    webPreferences: {
      webSecurity: false,
      contextIsolation: true,
      removeElectronJunk: false,
      enableRemoteModule: false,
      nodeIntegration: false,
      titleBarStyle: 'hidden',
      // eslint-disable-next-line no-undef
      preload: `${__static}/preload.js`
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      // nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION
    }
  })
  splash = new BrowserWindow({
    width: 900,
    height: 600,
    frame: false,
    fullscreenable: false, // 是否允许全屏
    center: true, // 是否出现在屏幕居中的位置
    alwaysOnTop: true
  })
  if (process.env.IS_TEST) win.webContents.openDevTools()
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    splash.loadURL('app://./splash.html')
    win.loadURL('app://./index.html')
  }
  win.on('focus', () => {
    globalShortcut.register('CommandOrControl+F', function() {
      if (win && win.webContents) {
        win.webContents.send('on-find', '')
      }
    })
  })
  win.on('blur', () => {
    globalShortcut.unregister('CommandOrControl+F')
  })
  win.on('close', (ev) => {
    if (close === false) {
      ev.preventDefault()
      dialog.showMessageBox({
        type: 'warning',
        message: '是否确定退出？',
        buttons: ['否', '是'],
        title: '是否确定退出？',
        cancelId: 0,
        defaultId: 1,
        noLink: true
      }).then((val) => {
        if (val.response === 0) {
          // Cancel the close process
        } else if (win) {
          close = true
          app.quit()
        }
      })
    }
  })
  win.on('closed', (ev) => {
    win = null
  })
  win.once('ready-to-show', () => {
    setTimeout(() => {
      splash.destroy()
      win.show()
    }, 1500)
  })
  // win.webContents.openDevTools()
  createMenu()
}
// 设置菜单栏
function createMenu() {
  // darwin表示macOS，针对macOS的设置
  const template = [
    {
      label: '菜单',
      submenu: [
        { label: '关于',
          role: 'about',
          click() {
            dialog.showMessageBox({
              title: 'MetasploitCoop',
              message: 'MetasploitCoop',
              detail: `MetasploitCoop`
            })
          }
        },
        {
          label: '退出',
          role: 'quit' }]
    }, {
      label: '操作',
      submenu: [
        {
          label: '强制刷新',
          role: 'forcereload'
        },
        {
          label: '开发者工具',
          role: 'toggledevtools'
        }, {
          type: 'separator'
        }, {
          label: '撤销',
          role: 'undo'
        }, {
          label: '重做',
          role: 'redo'
        }, {
          type: 'separator'
        }, {
          label: '剪切',
          role: 'cut'
        }, {
          label: '复制',
          role: 'copy'
        }, {
          label: '粘贴',
          role: 'paste'
        }, {
          type: 'separator'
        }, {
          label: '全选',
          role: 'selectall'
        }
      ]
    }]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
function registerLocalResourceProtocol() {
  protocol.registerFileProtocol('local-resource', (request, callback) => {
    const url = request.url.replace(/^local-resource:\/\//, '')
    // Decode URL to prevent errors when loading filenames with UTF-8 chars or chars like "#"
    const decodedUrl = decodeURI(url) // Needed in case URL contains spaces
    try {
      return callback(decodedUrl)
    } catch (error) {
      console.error('ERROR: registerLocalResourceProtocol: Could not get file path:', error)
    }
  })
}
// Quit when all windows are closed.
app.commandLine.appendSwitch('ignore-certificate-errors')
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  event.preventDefault()
  callback(true)
})
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  globalShortcut.unregister('CommandOrControl+F')
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async() => {
  if (isDevelopment && process.env.IS_TEST) {
    // Install Vue Devtools
    // try {
    //   await session.defaultSession.loadExtension(`${path.resolve(`${app.getPath('userData')}/extensions/dhdgffkkebhmkfjojejmpbldmpobfkfo`)}`).then(({ id }) => {
    //     // ...
    //   })
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }
    globalShortcut.register('CommandOrControl+Shift+i', function() {
      win.webContents.openDevTools()
    })
  }
  registerLocalResourceProtocol()
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
