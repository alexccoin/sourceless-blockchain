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
  
  // ==================== STARW HOSTING ====================
  
  // Create storage commitment (earn ARSS tokens)
  createHostingCommitment: (data: { storageGB: number; durationDays?: number }) => 
    ipcRenderer.invoke('hosting:createCommitment', data),
  
  // Get user's storage stats
  getHostingStats: () => ipcRenderer.invoke('hosting:getStats'),
  
  // Get network-wide hosting stats
  getHostingNetworkStats: () => ipcRenderer.invoke('hosting:getNetworkStats'),
  
  // Cancel hosting commitment
  cancelHostingCommitment: (commitmentId: string) => 
    ipcRenderer.invoke('hosting:cancelCommitment', { commitmentId }),
  
  // ==================== SPACELESS WEB2 MIRROR ====================
  
  // Get Spaceless health status
  getSpacelessHealth: () => ipcRenderer.invoke('spaceless:health'),
  
  // Get sync statistics
  getSpacelessSyncStats: () => ipcRenderer.invoke('spaceless:getSyncStats'),
  
  // Create cold wallet transaction (offline signing)
  createColdWalletTx: (data: { to: string; amount: number; memo?: string }) => 
    ipcRenderer.invoke('spaceless:createColdTx', data),
  
  // Broadcast pre-signed cold wallet transaction
  broadcastColdWalletTx: (operationId: string) => 
    ipcRenderer.invoke('spaceless:broadcastColdTx', { operationId }),
  
  // Import blockchain domain to Spaceless
  importDomain: (domainName: string) => 
    ipcRenderer.invoke('spaceless:importDomain', { domainName }),
  
  // Link email to Web3 wallet
  linkEmail: (email: string) => 
    ipcRenderer.invoke('spaceless:linkEmail', { email }),
  
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
  },
  onHostingReward: (callback: Function) => {
    ipcRenderer.on('hosting:rewardDistributed', (_, data) => callback(data));
  },
  onHostingCommitment: (callback: Function) => {
    ipcRenderer.on('hosting:commitmentCreated', (_, data) => callback(data));
  },
  onSpacelessSync: (callback: Function) => {
    ipcRenderer.on('spaceless:syncComplete', (_, data) => callback(data));
  },
  onDomainSynced: (callback: Function) => {
    ipcRenderer.on('spaceless:domainSynced', (_, data) => callback(data));
  }
});