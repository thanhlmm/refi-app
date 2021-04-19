const { Menu, MenuItem } = require('electron');

const menu = new Menu()
menu.append(new MenuItem({
  label: 'File',
  submenu: [{
    label: "New Tab",
    accelerator: process.platform === 'darwin' ? 'Cmd+T' : 'Ctrl+T',
    click: () => { console.log('Electron rocks!') }
  }]
}))

Menu.setApplicationMenu(menu)