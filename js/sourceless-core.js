/**
 * SourceLess Blockchain - Shared JavaScript Library
 * Comprehensive functionality for all dashboard components
 */

class SourceLessCore {
    constructor() {
        this.apiBase = 'http://localhost:8080/api';
        this.wsUrl = 'ws://localhost:8080/ws';
        this.storage = new StorageManager();
        this.auth = new AuthManager();
        this.blockchain = new BlockchainManager();
        this.wallet = new WalletManager();
        this.network = new NetworkManager();
        this.init();
    }

    init() {
        this.loadTheme();
        this.setupGlobalEventListeners();
        this.startRealTimeUpdates();
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('sourceless-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    setupGlobalEventListeners() {
        // Global search handler
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openGlobalSearch();
            }
        });

        // Handle navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-navigate]')) {
                e.preventDefault();
                this.navigate(e.target.getAttribute('data-navigate'));
            }
        });
    }

    startRealTimeUpdates() {
        // Real-time data updates every 5 seconds
        setInterval(() => {
            this.updateGlobalStats();
            this.updateNetworkStatus();
        }, 5000);
    }

    navigate(path) {
        if (path.startsWith('http')) {
            window.open(path, '_blank');
        } else {
            window.location.href = path;
        }
    }

    openGlobalSearch() {
        const searchModal = document.getElementById('globalSearchModal');
        if (searchModal) {
            searchModal.style.display = 'flex';
            searchModal.querySelector('input').focus();
        }
    }

    async updateGlobalStats() {
        try {
            const stats = await this.blockchain.getNetworkStats();
            this.updateStatsDisplay(stats);
        } catch (error) {
            console.error('Failed to update stats:', error);
        }
    }

    updateStatsDisplay(stats) {
        const elements = {
            'latest-block': stats.latestBlock,
            'network-tps': stats.tps,
            'active-validators': stats.validators,
            'str-domains': stats.domains,
            'total-supply': stats.totalSupply,
            'market-cap': stats.marketCap
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = this.formatValue(value, id);
            }
        });
    }

    formatValue(value, type) {
        if (typeof value === 'number') {
            if (type.includes('cap') || type.includes('supply')) {
                return this.formatCurrency(value);
            }
            return value.toLocaleString();
        }
        return value;
    }

    formatCurrency(value) {
        if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
        if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
        if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
        if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
        return `$${value.toFixed(2)}`;
    }

    async updateNetworkStatus() {
        const status = await this.network.getStatus();
        const indicator = document.querySelector('.network-status-indicator');
        if (indicator) {
            indicator.className = `network-status-indicator ${status.health}`;
            indicator.title = `Network ${status.health}: ${status.message}`;
        }
    }
}

class StorageManager {
    constructor() {
        this.prefix = 'sourceless-';
    }

    set(key, value) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage error:', error);
            return defaultValue;
        }
    }

    remove(key) {
        localStorage.removeItem(this.prefix + key);
    }

    clear() {
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.prefix))
            .forEach(key => localStorage.removeItem(key));
    }
}

class AuthManager {
    constructor() {
        this.currentUser = this.loadUser();
        this.sessions = new Map();
    }

    loadUser() {
        return JSON.parse(localStorage.getItem('sourceless-user') || 'null');
    }

    async login(credentials) {
        try {
            // Simulate API call
            const response = await this.mockApiCall('/auth/login', credentials);
            if (response.success) {
                this.currentUser = response.user;
                localStorage.setItem('sourceless-user', JSON.stringify(response.user));
                this.updateAuthUI();
                return { success: true, user: response.user };
            }
            return { success: false, error: response.error };
        } catch (error) {
            return { success: false, error: 'Login failed' };
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('sourceless-user');
        localStorage.removeItem('sourceless-auth-token');
        this.updateAuthUI();
        window.location.reload();
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    updateAuthUI() {
        const authElements = document.querySelectorAll('[data-auth]');
        authElements.forEach(element => {
            const authType = element.getAttribute('data-auth');
            if (authType === 'required' && !this.isAuthenticated()) {
                element.style.display = 'none';
            } else if (authType === 'guest' && this.isAuthenticated()) {
                element.style.display = 'none';
            } else {
                element.style.display = '';
            }
        });
    }

    async mockApiCall(endpoint, data) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (endpoint === '/auth/login') {
            if (data.username === 'admin' && data.password === 'admin') {
                return {
                    success: true,
                    user: {
                        id: 1,
                        username: 'admin',
                        role: 'superadmin',
                        email: 'admin@sourceless.io',
                        permissions: ['all']
                    },
                    token: 'mock-jwt-token'
                };
            }
            return { success: false, error: 'Invalid credentials' };
        }
        
        return { success: true, data: {} };
    }
}

class BlockchainManager {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 30000; // 30 seconds
    }

    async getNetworkStats() {
        const cached = this.getFromCache('network-stats');
        if (cached) return cached;

        // Simulate real blockchain data
        const stats = {
            latestBlock: 6006000 + Math.floor(Math.random() * 1000),
            tps: 3000 + Math.floor(Math.random() * 2000),
            validators: 156,
            domains: 45000 + Math.floor(Math.random() * 500),
            totalSupply: 63200000000,
            marketCap: 1100000000000 + Math.random() * 100000000000,
            blockTime: 2.1,
            gasPrice: 0.000001,
            difficulty: '45.2T'
        };

        this.setCache('network-stats', stats);
        return stats;
    }

    async getBlocks(limit = 10, offset = 0) {
        const blocks = [];
        const latestBlock = await this.getLatestBlockNumber();

        for (let i = 0; i < limit; i++) {
            const blockNumber = latestBlock - offset - i;
            blocks.push({
                number: blockNumber,
                hash: this.generateHash(),
                timestamp: Date.now() - (i * 2100), // 2.1s block time
                transactions: Math.floor(Math.random() * 100) + 10,
                validator: this.generateAddress(),
                gasUsed: Math.floor(Math.random() * 8000000) + 2000000,
                gasLimit: 10000000,
                reward: (Math.random() * 5 + 2).toFixed(2) + ' STR',
                size: Math.floor(Math.random() * 500) + 100 + ' KB'
            });
        }

        return blocks;
    }

    async getTransactions(limit = 10, offset = 0) {
        const transactions = [];
        const methods = ['Transfer', 'Swap', 'Stake', 'Deploy', 'Approve', 'Mint', 'Burn'];

        for (let i = 0; i < limit; i++) {
            transactions.push({
                hash: this.generateHash(),
                method: methods[Math.floor(Math.random() * methods.length)],
                block: Math.floor(Math.random() * 100) + 6006000,
                timestamp: Date.now() - (Math.random() * 3600000), // Random within last hour
                from: this.generateAddress(),
                to: this.generateAddress(),
                value: (Math.random() * 10000).toFixed(2) + ' STR',
                fee: (Math.random() * 0.1).toFixed(4) + ' STR',
                status: Math.random() > 0.1 ? 'success' : 'pending',
                gasUsed: Math.floor(Math.random() * 100000) + 21000
            });
        }

        return transactions;
    }

    async getLatestBlockNumber() {
        const stats = await this.getNetworkStats();
        return stats.latestBlock;
    }

    generateHash() {
        return '0x' + Array(8).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('') + 
               '...' + Array(4).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    }

    generateAddress() {
        return 'zk13str_' + Array(8).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    async searchBlockchain(query) {
        // Simulate search across blocks, transactions, addresses, domains
        const results = {
            blocks: [],
            transactions: [],
            addresses: [],
            domains: []
        };

        if (query.match(/^\d+$/)) {
            // Block number search
            results.blocks = [await this.getBlockByNumber(parseInt(query))];
        } else if (query.match(/^0x[0-9a-fA-F]+/)) {
            // Hash search
            results.transactions = [await this.getTransactionByHash(query)];
        } else if (query.match(/^zk13str_/)) {
            // Address search
            results.addresses = [await this.getAddressInfo(query)];
        } else if (query.match(/\.STR$/i)) {
            // Domain search
            results.domains = [await this.getDomainInfo(query)];
        }

        return results;
    }

    async getBlockByNumber(number) {
        return {
            number,
            hash: this.generateHash(),
            timestamp: Date.now() - (Math.random() * 86400000),
            transactions: Math.floor(Math.random() * 100) + 10,
            validator: this.generateAddress(),
            gasUsed: Math.floor(Math.random() * 8000000) + 2000000,
            gasLimit: 10000000
        };
    }

    async getTransactionByHash(hash) {
        return {
            hash,
            method: 'Transfer',
            block: Math.floor(Math.random() * 100) + 6006000,
            timestamp: Date.now() - (Math.random() * 3600000),
            from: this.generateAddress(),
            to: this.generateAddress(),
            value: (Math.random() * 10000).toFixed(2) + ' STR',
            fee: (Math.random() * 0.1).toFixed(4) + ' STR',
            status: 'success'
        };
    }

    async getAddressInfo(address) {
        return {
            address,
            balance: (Math.random() * 100000).toFixed(2) + ' STR',
            transactions: Math.floor(Math.random() * 1000) + 10,
            created: Date.now() - (Math.random() * 31536000000) // Random within last year
        };
    }

    async getDomainInfo(domain) {
        return {
            domain,
            owner: this.generateAddress(),
            registered: Date.now() - (Math.random() * 31536000000),
            expires: Date.now() + 31536000000, // 1 year from now
            value: (Math.random() * 10000).toFixed(0) + ' STR'
        };
    }
}

class WalletManager {
    constructor() {
        this.wallets = this.loadWallets();
        this.activeWallet = this.loadActiveWallet();
    }

    loadWallets() {
        return JSON.parse(localStorage.getItem('sourceless-wallets') || '[]');
    }

    loadActiveWallet() {
        const activeId = localStorage.getItem('sourceless-active-wallet');
        return this.wallets.find(w => w.id === activeId) || null;
    }

    async createWallet(name, password) {
        const wallet = {
            id: this.generateId(),
            name,
            address: this.generateWalletAddress(),
            balance: '0.00',
            created: Date.now(),
            encrypted: true
        };

        this.wallets.push(wallet);
        this.saveWallets();
        
        return { success: true, wallet };
    }

    async importWallet(privateKey, name) {
        // Validate private key format
        if (!privateKey.match(/^[0-9a-fA-F]{64}$/)) {
            return { success: false, error: 'Invalid private key format' };
        }

        const wallet = {
            id: this.generateId(),
            name,
            address: this.generateWalletAddress(),
            balance: '0.00',
            imported: true,
            created: Date.now()
        };

        this.wallets.push(wallet);
        this.saveWallets();
        
        return { success: true, wallet };
    }

    async sendTransaction(to, amount, memo = '') {
        if (!this.activeWallet) {
            return { success: false, error: 'No active wallet' };
        }

        const balance = parseFloat(this.activeWallet.balance);
        if (balance < parseFloat(amount)) {
            return { success: false, error: 'Insufficient balance' };
        }

        // Simulate transaction
        const transaction = {
            id: this.generateId(),
            hash: this.generateTxHash(),
            from: this.activeWallet.address,
            to,
            amount,
            memo,
            timestamp: Date.now(),
            status: 'pending'
        };

        // Update balance
        this.activeWallet.balance = (balance - parseFloat(amount) - 0.001).toFixed(2);
        this.saveWallets();

        // Simulate confirmation after 3 seconds
        setTimeout(() => {
            transaction.status = 'confirmed';
            this.notifyTransactionConfirmed(transaction);
        }, 3000);

        return { success: true, transaction };
    }

    async getTransactionHistory(walletId = null) {
        const wallet = walletId ? this.wallets.find(w => w.id === walletId) : this.activeWallet;
        if (!wallet) return [];

        // Generate mock transaction history
        const history = [];
        for (let i = 0; i < 20; i++) {
            history.push({
                id: this.generateId(),
                hash: this.generateTxHash(),
                type: Math.random() > 0.5 ? 'received' : 'sent',
                amount: (Math.random() * 1000).toFixed(2),
                from: this.generateWalletAddress(),
                to: this.generateWalletAddress(),
                timestamp: Date.now() - (Math.random() * 2592000000), // Random within last month
                status: 'confirmed'
            });
        }

        return history.sort((a, b) => b.timestamp - a.timestamp);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generateWalletAddress() {
        return 'zk13str_' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    }

    generateTxHash() {
        return '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    }

    saveWallets() {
        localStorage.setItem('sourceless-wallets', JSON.stringify(this.wallets));
    }

    notifyTransactionConfirmed(transaction) {
        if (Notification.permission === 'granted') {
            new Notification('Transaction Confirmed', {
                body: `Transaction ${transaction.hash.substr(0, 10)}... has been confirmed`,
                icon: '/favicon.ico'
            });
        }
    }
}

class NetworkManager {
    constructor() {
        this.nodes = [];
        this.validators = [];
        this.connections = new Map();
    }

    async getStatus() {
        // Simulate network health check
        const health = Math.random() > 0.1 ? 'healthy' : 'warning';
        const messages = {
            healthy: 'All systems operational',
            warning: 'Minor network congestion detected',
            critical: 'Network issues detected'
        };

        return {
            health,
            message: messages[health],
            uptime: '99.97%',
            latency: Math.floor(Math.random() * 50) + 20 + 'ms'
        };
    }

    async getNodes() {
        if (this.nodes.length === 0) {
            this.generateNodes();
        }
        return this.nodes;
    }

    async getValidators() {
        if (this.validators.length === 0) {
            this.generateValidators();
        }
        return this.validators;
    }

    generateNodes() {
        const nodeTypes = ['validator', 'relay', 'archive', 'rpc', 'bootstrap'];
        const regions = ['US-East', 'US-West', 'EU-West', 'EU-Central', 'Asia-Pacific', 'South America'];
        
        for (let i = 0; i < 100; i++) {
            this.nodes.push({
                id: `node-${i.toString().padStart(3, '0')}`,
                type: nodeTypes[Math.floor(Math.random() * nodeTypes.length)],
                region: regions[Math.floor(Math.random() * regions.length)],
                status: Math.random() > 0.05 ? 'online' : 'offline',
                uptime: (Math.random() * 5 + 95).toFixed(2) + '%',
                version: '1.0.' + Math.floor(Math.random() * 10),
                connections: Math.floor(Math.random() * 50) + 10,
                latency: Math.floor(Math.random() * 100) + 10 + 'ms'
            });
        }
    }

    generateValidators() {
        for (let i = 0; i < 156; i++) {
            this.validators.push({
                id: i + 1,
                address: `zk13str_val${i.toString().padStart(3, '0')}`,
                stake: (Math.random() * 1000000 + 100000).toFixed(0) + ' STR',
                commission: (Math.random() * 10).toFixed(1) + '%',
                status: Math.random() > 0.02 ? 'active' : 'inactive',
                blocks: Math.floor(Math.random() * 10000) + 100,
                uptime: (Math.random() * 5 + 95).toFixed(2) + '%',
                apy: (Math.random() * 10 + 5).toFixed(1) + '%'
            });
        }
    }

    async getNetworkMetrics() {
        return {
            tps: Math.floor(Math.random() * 2000) + 3000,
            blockTime: (Math.random() * 1 + 1.5).toFixed(1) + 's',
            finalityTime: 'Instant',
            hashRate: (Math.random() * 0.5 + 1).toFixed(1) + ' EH/s',
            difficulty: '45.2T',
            mempool: Math.floor(Math.random() * 1000) + 500,
            networkFee: (Math.random() * 0.001).toFixed(6) + ' STR'
        };
    }
}

// Utility Functions
class Utils {
    static formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        if (diff < 60000) return Math.floor(diff / 1000) + 's ago';
        if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
        if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
        return Math.floor(diff / 86400000) + 'd ago';
    }

    static formatNumber(num) {
        if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return num.toLocaleString();
    }

    static formatAddress(address, length = 8) {
        if (!address || address.length <= length * 2) return address;
        return address.slice(0, length) + '...' + address.slice(-length);
    }

    static copyToClipboard(text) {
        return navigator.clipboard.writeText(text).then(() => {
            this.showToast('Copied to clipboard', 'success');
            return true;
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
                this.showToast('Copied to clipboard', 'success');
                return true;
            }
            this.showToast('Failed to copy', 'error');
            return false;
        });
    }

    static showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Add toast styles if not already present
        if (!document.getElementById('toast-styles')) {
            const styles = document.createElement('style');
            styles.id = 'toast-styles';
            styles.textContent = `
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 12px 24px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                }
                .toast-success { background: #10b981; }
                .toast-error { background: #ef4444; }
                .toast-warning { background: #f59e0b; }
                .toast-info { background: #0066ff; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static generateQRCode(text, size = 200) {
        // Simple QR code placeholder - in production, use a proper QR library
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Create a simple pattern
        ctx.fillStyle = '#000';
        for (let i = 0; i < size; i += 10) {
            for (let j = 0; j < size; j += 10) {
                if ((i + j) % 20 === 0) {
                    ctx.fillRect(i, j, 10, 10);
                }
            }
        }
        
        return canvas.toDataURL();
    }
}

// Initialize the core system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.SourceLess = new SourceLessCore();
    window.Utils = Utils;
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SourceLessCore, Utils };
}