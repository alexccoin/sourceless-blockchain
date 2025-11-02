/// <reference types="node" />
import { app, BrowserWindow } from 'electron';
import { ipcMain } from 'electron';
// Node.js globals are available in Electron main process
import * as path from 'path';
import createMenu from './menu';
import { autoRunAll } from './blockchain/AutoRunAll';

declare const __dirname: string;
// process and __dirname are available in Electron main process

let mainWindow: BrowserWindow | null = null;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, '../preload/preload.js'),
            contextIsolation: true,
        },
    });

    mainWindow.loadFile(path.join(__dirname, '../../public/index.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    return mainWindow;
}

app.on('ready', () => {
    createMenu();
    const win = createMainWindow();
    const systems = autoRunAll();

    // Respond to status requests from renderer
    ipcMain.on('status:request', (evt) => {
        evt.sender.send('status:update', systems.getStatus());
    });

    // Send initial status when ready
    setTimeout(() => {
        const all = BrowserWindow.getAllWindows();
        if (all.length) {
            all[0].webContents.send('status:update', systems.getStatus());
        }
    }, 500);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});