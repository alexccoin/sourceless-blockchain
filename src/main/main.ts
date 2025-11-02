/// <reference types="node" />
import { app, BrowserWindow, ipcMain } from 'electron';
// Node.js globals are available in Electron main process
import * as path from 'path';
import createMenu from './menu';
import { autoRunAll, Systems } from './blockchain/AutoRunAll';

declare const __dirname: string;
// process and __dirname are available in Electron main process

let mainWindow: BrowserWindow | null = null;
let systems: Systems | null = null;

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

// Setup IPC handlers for Sourceless API
function setupIPCHandlers(systems: Systems, window: BrowserWindow) {
    // Wallet data
    ipcMain.handle('wallet:get', async () => {
        const status = systems.getStatus();
        return status.wallet;
    });
    
    // Ledger stats
    ipcMain.handle('ledger:stats', async () => {
        return systems.ledgerManager.getAllLedgerStats();
    });
    
    // ARSS metering
    ipcMain.handle('arss:metering', async () => {
        return {
            total: 1000,
            used: 250,
            available: 750,
            contracts: 5,
            monthlyRate: 250
        };
    });
    
    // CCOIN balance
    ipcMain.handle('ccoin:balance', async () => {
        return {
            balance: 50.5,
            pending: 0,
            networks: 5
        };
    });
    
    // Send transaction
    ipcMain.handle('tx:send', async (event, data) => {
        const { from, to, amount, fee, memo } = data;
        // Wire to ledgerManager
        return { success: true, txId: 'tx_' + Date.now() };
    });
    
    // Deploy contract
    ipcMain.handle('contract:deploy', async (event, data) => {
        const { name, code, balance } = data;
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) {
            return { success: false, error: 'No wallet available' };
        }
        const address = systems.ledgerManager.contractLedger.deployContract(
            data.creator || defaultWallet.address,
            code,
            {},
            balance || 0
        );
        return { success: !!address, address };
    });
    
    // Execute contract
    ipcMain.handle('contract:execute', async (event, data) => {
        const { address, method, params, value } = data;
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) {
            return { success: false, error: 'No wallet available' };
        }
        const result = systems.ledgerManager.contractLedger.executeContract(
            address,
            defaultWallet.address,
            method,
            params || [],
            value || 0
        );
        return { success: result };
    });
    
    // Register domain
    ipcMain.handle('domain:register', async (event, data) => {
        const { name, title, description } = data;
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) {
            return { success: false, error: 'No wallet available' };
        }
        const result = systems.ledgerManager.assetLedger.mintDomain(
            defaultWallet.address,
            name,
            { title, description }
        );
        return { success: result };
    });
    
    // Transfer domain
    ipcMain.handle('domain:transfer', async (event, data) => {
        const { domainId, to } = data;
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) {
            return { success: false, error: 'No wallet available' };
        }
        const result = systems.ledgerManager.assetLedger.transferDomain(
            domainId,
            defaultWallet.address,
            to
        );
        return { success: result };
    });
    
    // Bridge assets
    ipcMain.handle('bridge:transfer', async (event, data) => {
        const { fromChain, toChain, fromAddr, toAddr, asset, amount, useStrFuel } = data;
        const txId = systems.bridge.createBridgeTx(
            fromChain,
            toChain,
            fromAddr,
            toAddr,
            asset,
            amount,
            useStrFuel
        );
        return { success: !!txId, txId };
    });
}

app.whenReady().then(() => {
    createMainWindow();
    createMenu();
    
    // Auto-run all Sourceless systems
    console.log('Starting Sourceless blockchain systems...');
    systems = autoRunAll();
    
    // Setup IPC handlers with systems reference
    if (systems && mainWindow) {
        setupIPCHandlers(systems, mainWindow);
    }
    
    // Send initial data to renderer after window loads
    mainWindow?.webContents.on('did-finish-load', () => {
        if (systems) {
            const status = systems.getStatus();
            mainWindow?.webContents.send('wallet:update', status.wallet);
            mainWindow?.webContents.send('ledger:update', status.ledgers);
        }
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
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