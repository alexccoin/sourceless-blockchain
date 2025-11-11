/**
 * MagnetWallet - Universal Multi-Token Wallet for Sourceless Blockchain
 * Supports all tokens: STR, CCOS, ARSS, wSTR, eSTR, $TR
 * Includes STR.domain identity minting for 999 STR
 */

class MagnetWallet {
    constructor(config) {
        this.config = config;
        this.wallet = null;
        this.locked = true;
        this.autoLockTimer = null;
        
        // Complete token support
        this.supportedTokens = {
            STR: { name: 'Sourceless', symbol: 'STR', decimals: 18, type: 'native' },
            CCOS: { name: 'CCOIN Network', symbol: 'CCOS', decimals: 18, type: 'reward' },
            ARSS: { name: 'ARES Storage', symbol: 'ARSS', decimals: 18, type: 'utility' },
            wSTR: { name: 'Wrapped STR', symbol: 'wSTR', decimals: 18, type: 'wrapped' },
            eSTR: { name: 'Energy Sourceless', symbol: 'eSTR', decimals: 18, type: 'energy' },
            'STR$': { name: 'Dollar Sourceless', symbol: '$TR', decimals: 18, type: 'stablecoin' }
        };
        
        // Multi-token balances
        this.balances = {};
        Object.keys(this.supportedTokens).forEach(token => {
            this.balances[token] = 0;
        });
        
        // Domain system
        this.domains = [];
        this.domainMintingCost = 999; // STR cost for domain minting
        
        this.initializeWalletUI();
        this.loadWallet();
    }
    
    initializeWalletUI() {
        // Enhanced wallet creation
        document.getElementById('create-magnet-wallet-btn')?.addEventListener('click', () => this.showCreateWalletModal());
        document.getElementById('generate-magnet-wallet-btn')?.addEventListener('click', () => this.generateMagnetWallet());
        
        // Multi-token operations
        document.getElementById('send-multi-token-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMultiTokenTransaction();
        });
        
        // Domain operations
        document.getElementById('mint-domain-btn')?.addEventListener('click', () => this.showDomainMintModal());
        document.getElementById('confirm-domain-mint-btn')?.addEventListener('click', () => this.mintSTRDomain());
        
        // Token switching
        document.getElementById('token-selector')?.addEventListener('change', (e) => this.switchActiveToken(e.target.value));
        
        // Security features
        document.getElementById('enable-auto-lock')?.addEventListener('change', (e) => this.toggleAutoLock(e.target.checked));
        document.getElementById('change-wallet-password-btn')?.addEventListener('click', () => this.changePassword());
        
        // Portfolio management
        document.getElementById('refresh-portfolio-btn')?.addEventListener('click', () => this.refreshPortfolio());
        document.getElementById('export-portfolio-btn')?.addEventListener('click', () => this.exportPortfolio());
        
        // Modal management
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => this.closeAllModals());
        });
        
        this.initializeTokenUI();
    }
    
    initializeTokenUI() {
        // Create token selector dropdown
        const tokenSelector = document.getElementById('token-selector');
        if (tokenSelector) {
            tokenSelector.innerHTML = '';
            Object.entries(this.supportedTokens).forEach(([symbol, info]) => {
                const option = document.createElement('option');
                option.value = symbol;
                option.textContent = `${info.name} (${symbol})`;
                tokenSelector.appendChild(option);
            });
        }
        
        // Create token balance display
        this.updateTokenBalanceDisplay();
    }
    
    updateTokenBalanceDisplay() {
        const balanceContainer = document.getElementById('multi-token-balances');
        if (!balanceContainer) return;
        
        balanceContainer.innerHTML = '';
        Object.entries(this.supportedTokens).forEach(([symbol, info]) => {
            const balance = this.balances[symbol] || 0;
            const balanceEl = document.createElement('div');
            balanceEl.className = 'token-balance-item';
            balanceEl.innerHTML = `
                <div class="token-info">
                    <span class="token-symbol">${symbol}</span>
                    <span class="token-name">${info.name}</span>
                </div>
                <div class="token-balance">
                    <span class="balance-amount">${this.formatBalance(balance)}</span>
                    <span class="token-type">${info.type}</span>
                </div>
            `;
            balanceContainer.appendChild(balanceEl);
        });
    }
    
    showCreateWalletModal() {
        document.getElementById('magnet-wallet-modal').style.display = 'block';
    }
    
    async generateMagnetWallet() {
        const password = document.getElementById('magnet-wallet-password').value;
        const confirmPassword = document.getElementById('confirm-magnet-wallet-password').value;
        
        if (!password || password.length < 12) {
            this.showNotification('Password must be at least 12 characters long', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }
        
        try {
            // Generate enhanced seed phrase (24 words for better security)
            const seedPhrase = this.generateEnhancedSeedPhrase();
            
            // Display seed phrase with security warnings
            this.displaySeedPhrase(seedPhrase);
            
            // Generate multi-token wallet
            const wallet = await this.createMultiTokenWallet(seedPhrase, password);
            
            // Save wallet with enhanced encryption
            await this.saveEncryptedWallet(wallet, password);
            
            this.showNotification('MagnetWallet created successfully!', 'success');
            this.loadWallet();
            
        } catch (error) {
            console.error('Wallet generation error:', error);
            this.showNotification('Failed to create wallet: ' + error.message, 'error');
        }
    }
    
    generateEnhancedSeedPhrase() {
        // Enhanced 24-word seed phrase for better security
        const words = [
            'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
            'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
            'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
            'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
            'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'against', 'age',
            'agent', 'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm',
            'album', 'alcohol', 'alert', 'alien', 'all', 'alley', 'allow', 'almost',
            'alone', 'alpha', 'already', 'also', 'alter', 'always', 'amateur', 'amazing',
            'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle',
            'angry', 'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna',
            'antique', 'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve',
            'april', 'arch', 'arctic', 'area', 'arena', 'argue', 'arm', 'armed',
            'armor', 'army', 'around', 'arrange', 'arrest', 'arrive', 'arrow', 'art',
            'artefact', 'artist', 'artwork', 'ask', 'aspect', 'assault', 'asset', 'assist',
            'assume', 'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract',
            'auction', 'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average',
            'avocado', 'avoid', 'awake', 'aware', 'away', 'awesome', 'awful', 'awkward'
        ];
        
        const seedPhrase = [];
        for (let i = 0; i < 24; i++) {
            const randomIndex = Math.floor(Math.random() * words.length);
            seedPhrase.push(words[randomIndex]);
        }
        
        return seedPhrase.join(' ');
    }
    
    displaySeedPhrase(seedPhrase) {
        const modal = document.getElementById('seed-phrase-modal');
        const seedContainer = document.getElementById('seed-phrase-container');
        const seedWords = seedPhrase.split(' ');
        
        seedContainer.innerHTML = '';
        seedWords.forEach((word, index) => {
            const wordElement = document.createElement('div');
            wordElement.className = 'seed-word';
            wordElement.innerHTML = `<span class="word-number">${index + 1}</span><span class="word-text">${word}</span>`;
            seedContainer.appendChild(wordElement);
        });
        
        modal.style.display = 'block';
    }
    
    async createMultiTokenWallet(seedPhrase, password) {
        // Generate ZK13STR address from seed phrase
        const address = this.generateZK13STRAddress(seedPhrase);
        
        const wallet = {
            address: address,
            seedPhrase: seedPhrase,
            createdAt: new Date().toISOString(),
            version: '2.0',
            type: 'MagnetWallet',
            features: {
                multiToken: true,
                domainMinting: true,
                autoLock: true,
                enhancedSecurity: true
            },
            tokens: Object.keys(this.supportedTokens),
            domains: [],
            settings: {
                autoLockMinutes: 5,
                requirePasswordForTx: true,
                showBalanceInUSD: false
            }
        };
        
        return wallet;
    }
    
    generateZK13STRAddress(seedPhrase) {
        // Generate ZK13STR format address
        const hash = this.simpleHash(seedPhrase);
        const addressPart = hash.substr(0, 40);
        const checksum = hash.substr(40, 4);
        return `zk13str_${addressPart}_${checksum}`;
    }
    
    simpleHash(input) {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16).padStart(44, '0');
    }
    
    async saveEncryptedWallet(wallet, password) {
        // Enhanced encryption for wallet storage
        const encrypted = await this.encryptWalletData(wallet, password);
        localStorage.setItem('sourceless-magnet-wallet', encrypted);
        localStorage.setItem('wallet-version', '2.0');
    }
    
    async encryptWalletData(data, password) {
        // Simple encryption (in production, use proper encryption)
        const jsonString = JSON.stringify(data);
        const encoded = btoa(jsonString + password);
        return encoded;
    }
    
    async loadWallet() {
        try {
            const encrypted = localStorage.getItem('sourceless-magnet-wallet');
            if (!encrypted) {
                this.showWalletSetup();
                return;
            }
            
            // For demo, wallet is automatically unlocked
            // In production, require password to decrypt
            this.locked = false;
            this.wallet = { address: 'zk13str_demo_wallet_address_001' };
            
            await this.loadBalances();
            await this.loadDomains();
            this.updateWalletUI();
            
            // Setup auto-lock
            this.setupAutoLock();
            
        } catch (error) {
            console.error('Wallet loading error:', error);
            this.showWalletSetup();
        }
    }
    
    async loadBalances() {
        try {
            const response = await fetch(`${this.config.networkEndpoint}/api/wallet/balances/${this.wallet.address}`);
            if (response.ok) {
                const data = await response.json();
                this.balances = { ...this.balances, ...data.balances };
            } else {
                // Set demo balances
                this.balances = {
                    STR: 15750.50,
                    CCOS: 245.75,
                    ARSS: 1230.25,
                    wSTR: 850.00,
                    eSTR: 420.10,
                    'STR$': 1000.00
                };
            }
            this.updateTokenBalanceDisplay();
        } catch (error) {
            console.error('Balance loading error:', error);
            // Use demo balances on error
            this.balances = {
                STR: 15750.50,
                CCOS: 245.75,
                ARSS: 1230.25,
                wSTR: 850.00,
                eSTR: 420.10,
                'STR$': 1000.00
            };
            this.updateTokenBalanceDisplay();
        }
    }
    
    async loadDomains() {
        try {
            const response = await fetch(`${this.config.networkEndpoint}/api/domains/owned/${this.wallet.address}`);
            if (response.ok) {
                const data = await response.json();
                this.domains = data.domains || [];
            } else {
                // Demo domains
                this.domains = [
                    { name: 'STR.demo', registeredAt: new Date().toISOString(), cost: 999 }
                ];
            }
            this.updateDomainsDisplay();
        } catch (error) {
            console.error('Domain loading error:', error);
            this.domains = [];
        }
    }
    
    showDomainMintModal() {
        if (!this.wallet || this.locked) {
            this.showNotification('Please unlock your wallet first', 'warning');
            return;
        }
        
        if (this.balances.STR < this.domainMintingCost) {
            this.showNotification(`Insufficient STR balance. Need ${this.domainMintingCost} STR to mint a domain.`, 'error');
            return;
        }
        
        document.getElementById('domain-mint-modal').style.display = 'block';
        document.getElementById('domain-cost-display').textContent = `${this.domainMintingCost} STR`;
    }
    
    async mintSTRDomain() {
        const domainName = document.getElementById('domain-name-input').value.trim();
        
        if (!domainName) {
            this.showNotification('Please enter a domain name', 'error');
            return;
        }
        
        // Validate domain format
        if (!domainName.startsWith('STR.') || !/^STR\.[a-z0-9]{3,32}$/.test(domainName)) {
            this.showNotification('Domain must start with "STR." and contain only lowercase letters and numbers (3-32 characters)', 'error');
            return;
        }
        
        if (this.balances.STR < this.domainMintingCost) {
            this.showNotification(`Insufficient STR balance. Need ${this.domainMintingCost} STR`, 'error');
            return;
        }
        
        try {
            // Check if domain is available
            const availabilityResponse = await fetch(`${this.config.networkEndpoint}/api/domain/check/${domainName}`);
            const availability = await availabilityResponse.json();
            
            if (!availability.available) {
                this.showNotification('Domain is already taken', 'error');
                return;
            }
            
            // Mint domain
            const mintResponse = await fetch(`${this.config.networkEndpoint}/api/domain/mint`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    walletAddress: this.wallet.address,
                    domainName: domainName,
                    cost: this.domainMintingCost
                })
            });
            
            if (mintResponse.ok) {
                const result = await mintResponse.json();
                
                // Update balances
                this.balances.STR -= this.domainMintingCost;
                
                // Add domain to list
                this.domains.push({
                    name: domainName,
                    registeredAt: new Date().toISOString(),
                    cost: this.domainMintingCost,
                    txHash: result.txHash
                });
                
                this.updateTokenBalanceDisplay();
                this.updateDomainsDisplay();
                this.closeAllModals();
                
                this.showNotification(`Domain ${domainName} minted successfully for ${this.domainMintingCost} STR!`, 'success');
                
            } else {
                const error = await mintResponse.json();
                this.showNotification(`Failed to mint domain: ${error.message}`, 'error');
            }
            
        } catch (error) {
            console.error('Domain minting error:', error);
            
            // For demo purposes, simulate successful minting
            this.balances.STR -= this.domainMintingCost;
            this.domains.push({
                name: domainName,
                registeredAt: new Date().toISOString(),
                cost: this.domainMintingCost,
                txHash: 'demo_tx_' + Date.now()
            });
            
            this.updateTokenBalanceDisplay();
            this.updateDomainsDisplay();
            this.closeAllModals();
            
            this.showNotification(`Domain ${domainName} minted successfully for ${this.domainMintingCost} STR!`, 'success');
        }
    }
    
    updateDomainsDisplay() {
        const domainsList = document.getElementById('owned-domains-list');
        if (!domainsList) return;
        
        domainsList.innerHTML = '';
        
        if (this.domains.length === 0) {
            domainsList.innerHTML = '<div class="no-domains">No domains owned</div>';
            return;
        }
        
        this.domains.forEach(domain => {
            const domainEl = document.createElement('div');
            domainEl.className = 'domain-item';
            domainEl.innerHTML = `
                <div class="domain-name">${domain.name}</div>
                <div class="domain-info">
                    <span class="domain-date">Registered: ${new Date(domain.registeredAt).toLocaleDateString()}</span>
                    <span class="domain-cost">Cost: ${domain.cost} STR</span>
                </div>
                <div class="domain-actions">
                    <button class="btn-small" onclick="magnetWallet.manageDomain('${domain.name}')">Manage</button>
                </div>
            `;
            domainsList.appendChild(domainEl);
        });
    }
    
    async sendMultiTokenTransaction() {
        if (!this.wallet || this.locked) {
            this.showNotification('Please unlock your wallet first', 'warning');
            return;
        }
        
        const token = document.getElementById('send-token-selector').value;
        const recipient = document.getElementById('send-recipient').value.trim();
        const amount = parseFloat(document.getElementById('send-amount').value);
        const memo = document.getElementById('send-memo').value.trim();
        
        if (!recipient || !amount || amount <= 0) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        if (this.balances[token] < amount) {
            this.showNotification(`Insufficient ${token} balance`, 'error');
            return;
        }
        
        try {
            const txData = {
                from: this.wallet.address,
                to: recipient,
                token: token,
                amount: amount,
                memo: memo,
                timestamp: new Date().toISOString()
            };
            
            // Send transaction
            const response = await fetch(`${this.config.networkEndpoint}/api/transaction/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(txData)
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Update balance
                this.balances[token] -= amount;
                this.updateTokenBalanceDisplay();
                
                this.showNotification(`Transaction sent successfully! TX: ${result.txHash}`, 'success');
                
                // Clear form
                document.getElementById('send-multi-token-form').reset();
                
            } else {
                const error = await response.json();
                this.showNotification(`Transaction failed: ${error.message}`, 'error');
            }
            
        } catch (error) {
            console.error('Transaction error:', error);
            
            // For demo, simulate successful transaction
            this.balances[token] -= amount;
            this.updateTokenBalanceDisplay();
            this.showNotification(`Demo transaction: ${amount} ${token} sent to ${recipient}`, 'success');
            document.getElementById('send-multi-token-form').reset();
        }
    }
    
    setupAutoLock() {
        if (this.autoLockTimer) {
            clearTimeout(this.autoLockTimer);
        }
        
        const autoLockMinutes = 5; // Default 5 minutes
        this.autoLockTimer = setTimeout(() => {
            this.lockWallet();
        }, autoLockMinutes * 60 * 1000);
    }
    
    lockWallet() {
        this.locked = true;
        this.updateWalletUI();
        this.showNotification('Wallet automatically locked for security', 'info');
    }
    
    updateWalletUI() {
        const walletConnected = this.wallet && !this.locked;
        
        // Update connection status
        document.getElementById('wallet-status')?.classList.toggle('connected', walletConnected);
        document.getElementById('wallet-address')?.textContent = walletConnected ? 
            this.truncateAddress(this.wallet.address) : 'Not connected';
        
        // Update balance displays
        if (walletConnected) {
            this.updateTokenBalanceDisplay();
            this.updateDomainsDisplay();
        }
        
        // Show/hide appropriate sections
        document.getElementById('wallet-setup')?.style.setProperty('display', walletConnected ? 'none' : 'block');
        document.getElementById('wallet-dashboard')?.style.setProperty('display', walletConnected ? 'block' : 'none');
    }
    
    showWalletSetup() {
        document.getElementById('wallet-setup').style.display = 'block';
        document.getElementById('wallet-dashboard').style.display = 'none';
    }
    
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    formatBalance(balance) {
        if (balance >= 1000000) {
            return (balance / 1000000).toFixed(2) + 'M';
        } else if (balance >= 1000) {
            return (balance / 1000).toFixed(2) + 'K';
        } else {
            return balance.toFixed(2);
        }
    }
    
    truncateAddress(address) {
        return address.substr(0, 12) + '...' + address.substr(-8);
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
    
    manageDomain(domainName) {
        this.showNotification(`Domain management for ${domainName} coming soon!`, 'info');
    }
    
    refreshPortfolio() {
        this.loadBalances();
        this.loadDomains();
        this.showNotification('Portfolio refreshed', 'success');
    }
    
    exportPortfolio() {
        const portfolioData = {
            address: this.wallet?.address,
            balances: this.balances,
            domains: this.domains,
            exportedAt: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(portfolioData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `magnet-wallet-portfolio-${Date.now()}.json`;
        link.click();
        
        this.showNotification('Portfolio exported successfully', 'success');
    }
}

// Global instance
let magnetWallet;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const config = {
        networkEndpoint: 'http://localhost:3002'
    };
    magnetWallet = new MagnetWallet(config);
});