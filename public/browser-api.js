// Browser API Wrapper - Mimics Electron IPC for browser use
(function() {
    'use strict';
    
    const API_BASE = 'http://localhost:3000/api/';
    
    // Check if we're in Electron or browser
    const isElectron = typeof window !== 'undefined' && window.process && window.process.type;
    
    // Create sourcelessAPI object
    window.sourcelessAPI = {
        // API calls using fetch
        getWalletData: async () => {
            if (isElectron && window.sourcelessAPI?.getWalletData) {
                return window.sourcelessAPI.getWalletData();
            }
            const res = await fetch(API_BASE + 'wallet:get');
            return res.json();
        },
        
        getLedgerStats: async () => {
            if (isElectron && window.sourcelessAPI?.getLedgerStats) {
                return window.sourcelessAPI.getLedgerStats();
            }
            const res = await fetch(API_BASE + 'ledger:stats');
            return res.json();
        },
        
        getNetworkStats: async () => {
            if (isElectron && window.sourcelessAPI?.getNetworkStats) {
                return window.sourcelessAPI.getNetworkStats();
            }
            const res = await fetch(API_BASE + 'network:stats');
            return res.json();
        },
        
        getNetworkMetrics: async () => {
            if (isElectron && window.sourcelessAPI?.getNetworkMetrics) {
                return window.sourcelessAPI.getNetworkMetrics();
            }
            const res = await fetch(API_BASE + 'network:metrics');
            return res.json();
        },
        
        getBlockchainHistory: async () => {
            if (isElectron && window.sourcelessAPI?.getBlockchainHistory) {
                return window.sourcelessAPI.getBlockchainHistory();
            }
            const res = await fetch(API_BASE + 'blockchain:history');
            return res.json();
        },
        
        // Explorer APIs
        getExplorerTransactions: async (ledger, limit = 50) => {
            const url = API_BASE + `explorer:transactions?limit=${limit}${ledger ? `&ledger=${ledger}` : ''}`;
            const res = await fetch(url);
            return res.json();
        },
        
        getExplorerBlocks: async (ledger = 'main', limit = 20) => {
            const res = await fetch(API_BASE + `explorer:blocks?ledger=${ledger}&limit=${limit}`);
            return res.json();
        },
        
        getAddressTransactions: async (address, limit = 50) => {
            const res = await fetch(API_BASE + `explorer:address?address=${encodeURIComponent(address)}&limit=${limit}`);
            return res.json();
        },
        
        getNodeTelemetry: async (nodeId) => {
            const url = API_BASE + `nodes:telemetry${nodeId ? `?nodeId=${nodeId}` : ''}`;
            const res = await fetch(url);
            return res.json();
        },
        
        getPoEStats: async () => {
            return { isLive: true, zk13Score: 95 };
        },
        
        getStarwStats: async () => {
            return { vm: { cpuPercent: 15, memoryMB: 256, tasks: 3 } };
        },
        
        getARSSMetering: async () => {
            return { total: 1000, used: 250, available: 750, contracts: 5, monthlyRate: 250 };
        },
        
        getCCOINBalance: async () => {
            return { balance: 50.5, pending: 0, networks: 5 };
        },
        
        // wSTR (Wrapped STR) operations
        invoke: async (channel, data) => {
            if (isElectron && window.sourcelessAPI?.invoke) {
                return window.sourcelessAPI.invoke(channel, data);
            }
            
            // Browser fallback - mock responses
            const mocks = {
                'wstr:balance': { balance: 0, value: 0, domainCount: 0 },
                'wstr:wrap': { success: true, wstrAmount: data?.strAmount || 0, wstrValue: 0, domainCount: 0, message: 'Wrapped (demo)' },
                'wstr:unwrap': { success: true, strAmount: data?.wstrAmount || 0, domainIds: [], message: 'Unwrapped (demo)' },
                'estr:balance': { balance: 0, energyUnits: 0, computeCredits: 0 },
                'estr:mint': { success: true, amount: data?.amount || 0, energyType: data?.energyType || 'standard', bonus: 0, message: 'Minted (demo)' },
                'estr:spend': { success: true, spent: data?.amount || 0, operation: data?.operation || 'compute', remainingBalance: 0, message: 'Spent (demo)' },
                'tr:balance': { balance: 0, usdValue: 0, collateralizationRatio: 0 },
                'tr:mint': { success: true, minted: data?.trAmount || 0, collateralType: data?.collateralType || 'STR', collateralAmount: data?.collateralAmount || 0, collateralizationRatio: 150, message: 'Minted (demo)' },
                'tr:redeem': { success: true, redeemed: data?.trAmount || 0, collateralReturned: (data?.trAmount || 0) * 1.5, message: 'Redeemed (demo)' },
                'tr:transfer': { success: true, txId: 'tr_demo_' + Date.now(), from: 'demo_addr', to: data?.to || 'unknown', amount: data?.amount || 0, message: 'Transferred (demo)' },
                'genesis:info': { 
                    networkName: 'Sourceless Mainnet', 
                    chainId: 1, 
                    timestamp: Date.now(), 
                    initialSupply: { STR: 63000000000, CCOS: 63000000, ARSS: 0, wSTR: 0, eSTR: 0, $TR: 0 },
                    distribution: { market: 33, treasury: 67 },
                    ccosRewardMechanics: { enabled: true, minRewardPercent: 2.5, maxRewardPercent: 10, triggerEvent: 'financial-public-transaction' }
                }
            };
            
            return mocks[channel] || { success: false, error: 'Not implemented in browser mode' };
        },
        
        // Real-time updates using polling (in browser mode)
        onWalletUpdate: (callback) => {
            if (isElectron && window.sourcelessAPI?.onWalletUpdate) {
                return window.sourcelessAPI.onWalletUpdate(callback);
            }
            // Poll every 2 seconds in browser mode
            setInterval(async () => {
                const data = await window.sourcelessAPI.getWalletData();
                callback(data);
            }, 2000);
        },
        
        onLedgerUpdate: (callback) => {
            if (isElectron && window.sourcelessAPI?.onLedgerUpdate) {
                return window.sourcelessAPI.onLedgerUpdate(callback);
            }
            setInterval(async () => {
                const data = await window.sourcelessAPI.getLedgerStats();
                callback(data);
            }, 2000);
        },
        
        onNetworkDynamicUpdate: (callback) => {
            if (isElectron && window.sourcelessAPI?.onNetworkDynamicUpdate) {
                return window.sourcelessAPI.onNetworkDynamicUpdate(callback);
            }
            // Poll every 100ms for real-time updates
            setInterval(async () => {
                const data = await window.sourcelessAPI.getNetworkMetrics();
                callback(data);
            }, 100);
        },
        
        onNetworkStatsUpdate: (callback) => {
            if (isElectron && window.sourcelessAPI?.onNetworkStatsUpdate) {
                return window.sourcelessAPI.onNetworkStatsUpdate(callback);
            }
            setInterval(async () => {
                const data = await window.sourcelessAPI.getNetworkStats();
                callback(data);
            }, 500);
        },
        
        onNetworkInitial: (callback) => {
            if (isElectron && window.sourcelessAPI?.onNetworkInitial) {
                return window.sourcelessAPI.onNetworkInitial(callback);
            }
            window.sourcelessAPI.getNetworkStats().then(callback);
        },
        
        onBlockchainHistoryInitial: (callback) => {
            if (isElectron && window.sourcelessAPI?.onBlockchainHistoryInitial) {
                return window.sourcelessAPI.onBlockchainHistoryInitial(callback);
            }
            window.sourcelessAPI.getBlockchainHistory().then(callback);
        },
        
        onARSSUpdate: (callback) => {
            if (isElectron && window.sourcelessAPI?.onARSSUpdate) {
                return window.sourcelessAPI.onARSSUpdate(callback);
            }
            // No-op in browser mode
        },
        
        onCCOINUpdate: (callback) => {
            if (isElectron && window.sourcelessAPI?.onCCOINUpdate) {
                return window.sourcelessAPI.onCCOINUpdate(callback);
            }
            // No-op in browser mode
        }
    };
    
    console.log('🌐 Browser API loaded');
})();

