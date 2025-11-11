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
  getNetworkStats: () => ipcRenderer.invoke('network:stats'),
  getNetworkMetrics: () => ipcRenderer.invoke('network:metrics'),
  getBlockchainHistory: () => ipcRenderer.invoke('blockchain:history'),
  getPoEStats: () => ipcRenderer.invoke('poe:stats'),
  getStarwStats: () => ipcRenderer.invoke('starw:stats'),
  runStarwMicrobench: (iterations?: number) => ipcRenderer.invoke('starw:microbench', { iterations }),
  getARSSMetering: () => ipcRenderer.invoke('arss:metering'),
  getCCOINBalance: () => ipcRenderer.invoke('ccoin:balance'),
  
  // Transaction operations
  sendTransaction: (data: any) => ipcRenderer.invoke('tx:send', data),
  deployContract: (data: any) => ipcRenderer.invoke('contract:deploy', data),
  executeContract: (data: any) => ipcRenderer.invoke('contract:execute', data),

  // IDE Dev Mode
  getExamples: () => ipcRenderer.invoke('ide:listExamples'),
  compileExample: (id: string) => ipcRenderer.invoke('ide:compileExample', { id }),
  deployExample: (id: string, initialBalance?: number) => ipcRenderer.invoke('ide:deployExample', { id, initialBalance }),

  // CCOS operations
  mintCCOS: (amount: number) => ipcRenderer.invoke('ccos:mint', { amount }),
  transferCCOS: (to: string, amount: number) => ipcRenderer.invoke('ccos:transfer', { to, amount }),

  // CCOIN cross-chain
  initiateCrossChain: (data: { sourceChain: string; destChain: string; destAddr: string; amount: number; token: string }) =>
    ipcRenderer.invoke('ccoin:crossChain', data),
  
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
  
  // ==================== TOKEN DEPLOYMENT ====================
  
  // Deploy personal token
  deployPersonalToken: (config: { 
    tokenName: string; 
    ticker: string; 
    totalSupply: number; 
    decimals: number; 
    website?: string; 
    description?: string 
  }) => ipcRenderer.invoke('token:deployPersonal', config),
  
  // Deploy business token
  deployBusinessToken: (config: { 
    tokenName: string; 
    ticker: string; 
    totalSupply: number; 
    decimals: number; 
    website?: string; 
    description?: string;
    companyName: string;
    personInCharge: string;
  }) => ipcRenderer.invoke('token:deployBusiness', config),
  
  // Get deployment history
  getDeploymentHistory: () => ipcRenderer.invoke('deployment:getHistory'),
  
  // Get deployment stats
  getDeploymentStats: () => ipcRenderer.invoke('deployment:getStats'),
  
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
  onDeploymentUpdate: (callback: Function) => {
    ipcRenderer.on('deployment:update', (_, data) => callback(data));
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
  },
  // Dynamic Network Updates
  onNetworkDynamicUpdate: (callback: Function) => {
    ipcRenderer.on('network:dynamicUpdate', (_, data) => callback(data));
  },
  onNetworkStatsUpdate: (callback: Function) => {
    ipcRenderer.on('network:statsUpdate', (_, data) => callback(data));
  },
  onNetworkInitial: (callback: Function) => {
    ipcRenderer.on('network:initial', (_, data) => callback(data));
  },
  onBlockchainHistoryInitial: (callback: Function) => {
    ipcRenderer.on('blockchain:historyInitial', (_, data) => callback(data));
  },
    // AresLang API
    ares: {
      generateKeyPair: () => ipcRenderer.invoke('areslang:generateKeyPair'),
      encrypt: (data: string, publicKey: string) => ipcRenderer.invoke('areslang:encrypt', { data, publicKey }),
      decrypt: (payload: string, privateKey: string) => ipcRenderer.invoke('areslang:decrypt', { payload, privateKey }),
      entropyBytes: (length: number) => ipcRenderer.invoke('areslang:entropyBytes', { length }),
      entropyQuality: () => ipcRenderer.invoke('areslang:entropyQuality'),
      chains: () => ipcRenderer.invoke('areslang:chains'),
      sign: (message: string, privateKey: string) => ipcRenderer.invoke('areslang:sign', { message, privateKey }),
      verify: (message: string, signature: string, publicKey: string) => ipcRenderer.invoke('areslang:verify', { message, signature, publicKey }),
      cleanup: () => ipcRenderer.invoke('areslang:cleanup')
    }
});