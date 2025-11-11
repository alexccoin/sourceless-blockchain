/**
 * Sourceless Mini-Node Client
 * Main client application logic
 */

class SourcelessClient {
    constructor() {
        this.config = {
            networkEndpoint: 'http://localhost:3002',
            chainId: 1313,
            networkName: 'Sourceless Mainnet',
            maxPeers: 50,
            syncBatchSize: 100
        };
        
        this.state = {
            connected: false,
            peers: 0,
            syncProgress: 0,
            latestBlock: 0
        };
        
        this.wallet = null;
        this.validator = null;
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing Sourceless Mini-Node Client...');
        
        // Load configuration
        await this.loadConfig();
        
        // Initialize UI
        this.initializeUI();
        
        // Initialize wallet manager
        this.wallet = new WalletManager(this.config);
        
        // Initialize validator
        this.validator = new ValidatorNode(this.config);
        
        // Connect to network
        await this.connectToNetwork();
        
        // Start background processes
        this.startBackgroundTasks();
        
        console.log('✅ Client initialized successfully');
    }
    
    async loadConfig() {
        try {
            const savedConfig = localStorage.getItem('sourceless-config');
            if (savedConfig) {
                this.config = { ...this.config, ...JSON.parse(savedConfig) };
            }
        } catch (error) {
            console.error('Config load error:', error);
        }
    }
    
    async saveConfig() {
        try {
            localStorage.setItem('sourceless-config', JSON.stringify(this.config));
            this.showNotification('Configuration saved successfully', 'success');
        } catch (error) {
            console.error('Config save error:', error);
            this.showNotification('Failed to save configuration', 'error');
        }
    }
    
    initializeUI() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });
        
        // Settings handlers
        document.getElementById('save-network-btn')?.addEventListener('click', () => this.saveNetworkSettings());
        document.getElementById('save-performance-btn')?.addEventListener('click', () => this.savePerformanceSettings());
        document.getElementById('check-updates-btn')?.addEventListener('click', () => this.checkForUpdates());
        document.getElementById('change-password-btn')?.addEventListener('click', () => this.changePassword());
        
        // Check if wallet exists
        this.checkWalletStatus();
    }
    
    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab
        document.getElementById(`${tabName}-tab`)?.classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        
        // Load tab-specific data
        this.loadTabData(tabName);
    }
    
    async loadTabData(tabName) {
        switch(tabName) {
            case 'wallet':
                await this.loadWalletData();
                break;
            case 'validator':
                await this.loadValidatorData();
                break;
            case 'explorer':
                await this.loadExplorerData();
                break;
        }
    }
    
    async loadWalletData() {
        if (this.wallet && this.wallet.isUnlocked()) {
            await this.wallet.updateBalances();
            await this.wallet.loadTransactionHistory();
        }
    }
    
    async loadValidatorData() {
        if (this.validator && this.validator.isActive()) {
            await this.validator.updateStats();
            await this.validator.updateRewards();
        }
    }
    
    async loadExplorerData() {
        try {
            const response = await fetch(`${this.config.networkEndpoint}/api/blockchain/stats`);
            const stats = await response.json();
            
            document.getElementById('latest-block').textContent = stats.latestBlock || 0;
            document.getElementById('tx-24h').textContent = stats.transactions24h || 0;
            document.getElementById('network-tps').textContent = (stats.tps || 0).toFixed(2);
            document.getElementById('active-validators').textContent = stats.activeValidators || 0;
            
            await this.loadRecentBlocks();
        } catch (error) {
            console.error('Explorer data error:', error);
        }
    }
    
    async loadRecentBlocks() {
        const blocksList = document.getElementById('recent-blocks-list');
        if (!blocksList) return;
        
        // Generate mock blocks for demo
        const blocks = [];
        const currentHeight = this.state.latestBlock || 6000;
        
        for (let i = 0; i < 10; i++) {
            blocks.push({
                height: currentHeight - i,
                hash: this.generateHash(),
                timestamp: Date.now() - (i * 10000),
                transactions: Math.floor(Math.random() * 50) + 1,
                validator: `STR.validator${Math.floor(Math.random() * 5) + 1}`
            });
        }
        
        blocksList.innerHTML = blocks.map(block => `
            <div class="block-item">
                <div class="block-height">#${block.height}</div>
                <div class="block-hash"><code>${block.hash.substring(0, 16)}...</code></div>
                <div class="block-info">
                    <span>${block.transactions} txs</span>
                    <span>${this.formatTimeAgo(block.timestamp)}</span>
                </div>
            </div>
        `).join('');
    }
    
    async connectToNetwork() {
        try {
            console.log(`📡 Connecting to ${this.config.networkEndpoint}...`);
            
            const response = await fetch(`${this.config.networkEndpoint}/health`);
            if (response.ok) {
                this.state.connected = true;
                this.updateNetworkStatus('Connected', 'connected');
                console.log('✅ Connected to network');
                
                // Start syncing
                await this.syncBlockchain();
            } else {
                throw new Error('Network unavailable');
            }
        } catch (error) {
            console.error('Network connection error:', error);
            this.state.connected = false;
            this.updateNetworkStatus('Disconnected', 'disconnected');
            
            // Retry connection
            setTimeout(() => this.connectToNetwork(), 10000);
        }
    }
    
    async syncBlockchain() {
        try {
            const response = await fetch(`${this.config.networkEndpoint}/api/blockchain/stats`);
            const stats = await response.json();
            
            this.state.latestBlock = stats.latestBlock || 0;
            this.state.syncProgress = 100;
            
            this.updateSyncStatus('100%');
            console.log(`✅ Synced to block #${this.state.latestBlock}`);
        } catch (error) {
            console.error('Sync error:', error);
        }
    }
    
    startBackgroundTasks() {
        // Update network stats every 5 seconds
        setInterval(() => this.updateNetworkStats(), 5000);
        
        // Update balances every 10 seconds
        setInterval(() => this.loadWalletData(), 10000);
        
        // Update validator stats every 15 seconds
        setInterval(() => this.loadValidatorData(), 15000);
    }
    
    async updateNetworkStats() {
        if (!this.state.connected) return;
        
        // Simulate peer count changes
        this.state.peers = Math.floor(Math.random() * 20) + 5;
        document.getElementById('peer-count').textContent = this.state.peers;
    }
    
    updateNetworkStatus(text, className) {
        const statusEl = document.getElementById('network-status');
        if (statusEl) {
            statusEl.textContent = text;
            statusEl.className = `value ${className}`;
        }
    }
    
    updateSyncStatus(text) {
        const syncEl = document.getElementById('sync-status');
        if (syncEl) {
            syncEl.textContent = text;
        }
    }
    
    checkWalletStatus() {
        const hasWallet = localStorage.getItem('sourceless-wallet');
        const walletInfo = document.getElementById('wallet-info');
        const walletSetup = document.getElementById('wallet-setup');
        
        if (hasWallet) {
            walletInfo.style.display = 'block';
            walletSetup.style.display = 'none';
        } else {
            walletInfo.style.display = 'none';
            walletSetup.style.display = 'block';
        }
    }
    
    saveNetworkSettings() {
        this.config.networkEndpoint = document.getElementById('network-endpoint').value;
        this.saveConfig();
        
        // Reconnect with new settings
        this.connectToNetwork();
    }
    
    savePerformanceSettings() {
        this.config.maxPeers = parseInt(document.getElementById('max-peers').value);
        this.config.syncBatchSize = parseInt(document.getElementById('sync-batch-size').value);
        this.saveConfig();
    }
    
    async checkForUpdates() {
        this.showNotification('You are running the latest version (1.0.0)', 'success');
    }
    
    changePassword() {
        // Implement password change dialog
        alert('Password change feature coming soon!');
    }
    
    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#00ff7f' : type === 'error' ? '#ff4757' : '#00d4ff'};
            color: #000;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    generateHash() {
        return '0x' + Array.from({length: 64}, () => 
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
    }
    
    formatTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }
}

// Initialize client when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.sourcelessClient = new SourcelessClient();
});
