import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
    // Example function to send a message to the main process
    sendMessage: (channel: string, data: any) => {
        ipcRenderer.send(channel, data);
    },
    // Example function to receive a message from the main process
    onMessage: (channel: string, func: (data: any) => void) => {
        ipcRenderer.on(channel, (event, data) => func(data));
    }
});

// Sourceless API for real-time blockchain data
contextBridge.exposeInMainWorld('sourcelessAPI', {
  // Send messages to main process
  getWalletData: () => ipcRenderer.invoke('wallet:get'),
  getLedgerStats: () => ipcRenderer.invoke('ledger:stats'),
  getARSSMetering: () => ipcRenderer.invoke('arss:metering'),
  getCCOINBalance: () => ipcRenderer.invoke('ccoin:balance'),
  
  // Transaction operations
  sendTransaction: (data: any) => ipcRenderer.invoke('tx:send', data),
  deployContract: (data: any) => ipcRenderer.invoke('contract:deploy', data),
  executeContract: (data: any) => ipcRenderer.invoke('contract:execute', data),
  
  // Domain operations
  registerDomain: (data: any) => ipcRenderer.invoke('domain:register', data),
  transferDomain: (data: any) => ipcRenderer.invoke('domain:transfer', data),
  
  // Bridge operations
  bridgeAssets: (data: any) => ipcRenderer.invoke('bridge:transfer', data),
  
  // Real-time updates
  onWalletUpdate: (callback: Function) => {
    ipcRenderer.on('wallet:update', (_, data) => callback(data));
  },
  onLedgerUpdate: (callback: Function) => {
    ipcRenderer.on('ledger:update', (_, data) => callback(data));
  },
  onARSSUpdate: (callback: Function) => {
    ipcRenderer.on('arss:update', (_, data) => callback(data));
  },
  onCCOINUpdate: (callback: Function) => {
    ipcRenderer.on('ccoin:update', (_, data) => callback(data));
  }
});