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
    
    // ==================== STARW HOSTING ENGINE ====================
    
    // Create storage commitment
    ipcMain.handle('hosting:createCommitment', async (event, data) => {
        const { storageGB, durationDays } = data;
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) {
            return { success: false, error: 'No wallet available' };
        }
        
        try {
            const commitment = await systems.hostingEngine.createCommitment(
                defaultWallet.address,
                storageGB,
                durationDays || 30
            );
            return { success: true, commitment };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });
    
    // Get storage stats
    ipcMain.handle('hosting:getStats', async () => {
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) {
            return null;
        }
        
        return systems.hostingEngine.getStorageStats(defaultWallet.address);
    });
    
    // Get network stats
    ipcMain.handle('hosting:getNetworkStats', async () => {
        return systems.hostingEngine.getNetworkStats();
    });
    
    // Cancel commitment
    ipcMain.handle('hosting:cancelCommitment', async (event, { commitmentId }) => {
        try {
            await systems.hostingEngine.cancelCommitment(commitmentId);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });
    
    // ==================== SPACELESS WEB2 MIRROR ====================
    
    // Get Spaceless health status
    ipcMain.handle('spaceless:health', async () => {
        return await systems.spacelessBridge.getHealthStatus();
    });
    
    // Get sync stats
    ipcMain.handle('spaceless:getSyncStats', async () => {
        return systems.spacelessBridge.getStats();
    });
    
    // Create cold wallet transaction
    ipcMain.handle('spaceless:createColdTx', async (event, data) => {
        const { to, amount, memo } = data;
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) {
            return { success: false, error: 'No wallet available' };
        }
        
        try {
            const operationId = await systems.spacelessBridge.createColdWalletTransaction(
                'user_' + defaultWallet.address,
                to,
                amount,
                memo
            );
            return { success: true, operationId };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });
    
    // Broadcast cold wallet transaction
    ipcMain.handle('spaceless:broadcastColdTx', async (event, { operationId }) => {
        try {
            const txId = await systems.spacelessBridge.broadcastColdWalletTransaction(operationId);
            return { success: true, txId };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });
    
    // Import domain from blockchain
    ipcMain.handle('spaceless:importDomain', async (event, { domainName }) => {
        try {
            await systems.spacelessBridge.importDomainFromBlockchain(domainName);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });
    
    // Link email to wallet
    ipcMain.handle('spaceless:linkEmail', async (event, { email }) => {
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) {
            return { success: false, error: 'No wallet available' };
        }
        
        try {
            await systems.spacelessBridge.linkEmailToWallet(email, defaultWallet.address);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });
}

// Listen for hosting rewards and update renderer
function setupRealtimeUpdates(systems: Systems, window: BrowserWindow) {
    // STARW Hosting rewards
    systems.hostingEngine.on('reward:distributed', (data) => {
        window.webContents.send('hosting:rewardDistributed', data);
    });
    
    systems.hostingEngine.on('commitment:created', (data) => {
        window.webContents.send('hosting:commitmentCreated', data);
    });
    
    // Spaceless Bridge sync events
    systems.spacelessBridge.on('sync:complete', (stats) => {
        window.webContents.send('spaceless:syncComplete', stats);
    });
    
    systems.spacelessBridge.on('domain:synced', (data) => {
        window.webContents.send('spaceless:domainSynced', data);
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
        setupRealtimeUpdates(systems, mainWindow);
    }
    
    // Send initial data to renderer after window loads
    mainWindow?.webContents.on('did-finish-load', () => {
        if (systems) {
            const status = systems.getStatus();
            mainWindow?.webContents.send('wallet:update', status.wallet);
            mainWindow?.webContents.send('ledger:update', status.ledgers);
            mainWindow?.webContents.send('hosting:stats', status.hosting);
            mainWindow?.webContents.send('spaceless:status', status.spaceless);
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