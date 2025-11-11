/**
 * Wallet Manager for Sourceless Mini-Node Client
 * Handles wallet creation, import, export, and transactions
 */

class WalletManager {
    constructor(config) {
        this.config = config;
        this.wallet = null;
        this.locked = true;
        this.balances = {
            STR: 0,
            CCOS: 0,
            ARSS: 0,
            wSTR: 0,
            eSTR: 0,
            STR$: 0
        };
        
        this.initializeWalletUI();
    }
    
    initializeWalletUI() {
        // Create wallet button
        document.getElementById('create-wallet-btn')?.addEventListener('click', () => this.showCreateWalletModal());
        document.getElementById('setup-create-btn')?.addEventListener('click', () => this.showCreateWalletModal());
        
        // Import wallet button
        document.getElementById('import-wallet-btn')?.addEventListener('click', () => this.importWallet());
        document.getElementById('setup-import-btn')?.addEventListener('click', () => this.importWallet());
        
        // Export wallet button
        document.getElementById('export-wallet-btn')?.addEventListener('click', () => this.exportWallet());
        
        // Copy address button
        document.getElementById('copy-address-btn')?.addEventListener('click', () => this.copyAddress());
        
        // Send transaction form
        document.getElementById('send-tx-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendTransaction();
        });
        
        // Refresh transactions button
        document.getElementById('refresh-tx-btn')?.addEventListener('click', () => this.loadTransactionHistory());
        
        // Wallet creation modal
        document.getElementById('generate-wallet-btn')?.addEventListener('click', () => this.generateWallet());
        
        // Modal close
        document.querySelector('.modal .close')?.addEventListener('click', () => this.closeModals());
        
        // Load existing wallet
        this.loadWallet();
    }
    
    showCreateWalletModal() {
        document.getElementById('create-wallet-modal').style.display = 'block';
    }
    
    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
    
    async generateWallet() {
        const password = document.getElementById('new-wallet-password').value;
        const confirmPassword = document.getElementById('confirm-wallet-password').value;
        
        if (!password || password.length < 8) {
            alert('Password must be at least 8 characters long');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        try {
            // Generate seed phrase (12 words)
            const seedPhrase = this.generateSeedPhrase();
            
            // Display seed phrase
            const seedPhraseDisplay = document.getElementById('seed-phrase-display');
            const seedPhraseEl = document.getElementById('seed-phrase');
            
            seedPhraseEl.textContent = seedPhrase;
            seedPhraseDisplay.style.display = 'block';
            
            // Generate wallet from seed
            const wallet = await this.createWalletFromSeed(seedPhrase, password);
            
            // Wait for user to confirm seed phrase
            const confirmCheckbox = document.getElementById('seed-confirmed');
            confirmCheckbox.addEventListener('change', () => {
                if (confirmCheckbox.checked) {
                    this.saveWallet(wallet, password);
                    this.loadWallet();
                    this.closeModals();
                    window.sourcelessClient?.showNotification('Wallet created successfully!', 'success');
                }
            });
            
        } catch (error) {
            console.error('Wallet generation error:', error);
            alert('Failed to generate wallet: ' + error.message);
        }
    }
    
    generateSeedPhrase() {
        // Simple word list for demo (in production, use BIP39 wordlist)
        const words = [
            'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
            'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
            'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
            'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
            'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
            'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album'
        ];
        
        const phrase = [];
        for (let i = 0; i < 12; i++) {
            phrase.push(words[Math.floor(Math.random() * words.length)]);
        }
        
        return phrase.join(' ');
    }
    
    async createWalletFromSeed(seedPhrase, password) {
        // Generate private key from seed
        const privateKey = await this.derivePrivateKey(seedPhrase);
        
        // Generate public address
        const address = this.generateAddress(privateKey);
        
        // Encrypt private key with password
        const encryptedKey = await this.encryptPrivateKey(privateKey, password);
        
        return {
            address,
            encryptedKey,
            seedPhrase: await this.encryptPrivateKey(seedPhrase, password)
        };
    }
    
    async derivePrivateKey(seedPhrase) {
        // Simple hash for demo (in production, use proper key derivation)
        const encoder = new TextEncoder();
        const data = encoder.encode(seedPhrase);
        const hash = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hash));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    generateAddress(privateKey) {
        // Generate ZK13STR format address
        const addressPart = privateKey.substring(0, 40);
        const checksum = privateKey.substring(40, 44);
        return `zk13str_${addressPart}_${checksum}`;
    }
    
    async encryptPrivateKey(data, password) {
        // Simple encryption for demo (in production, use proper encryption)
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );
        
        const key = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: encoder.encode('sourceless-salt'),
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
        
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encoder.encode(data)
        );
        
        return {
            encrypted: Array.from(new Uint8Array(encrypted)),
            iv: Array.from(iv)
        };
    }
    
    saveWallet(wallet, password) {
        try {
            localStorage.setItem('sourceless-wallet', JSON.stringify(wallet));
            localStorage.setItem('sourceless-wallet-address', wallet.address);
            this.wallet = wallet;
            this.locked = false;
        } catch (error) {
            console.error('Wallet save error:', error);
            throw error;
        }
    }
    
    loadWallet() {
        try {
            const walletData = localStorage.getItem('sourceless-wallet');
            if (walletData) {
                this.wallet = JSON.parse(walletData);
                this.displayWallet();
                this.updateBalances();
            }
        } catch (error) {
            console.error('Wallet load error:', error);
        }
    }
    
    displayWallet() {
        if (!this.wallet) return;
        
        document.getElementById('wallet-address').textContent = this.wallet.address;
        document.getElementById('wallet-info').style.display = 'block';
        document.getElementById('wallet-setup').style.display = 'none';
    }
    
    async updateBalances() {
        if (!this.wallet) return;
        
        try {
            // Fetch balances from network
            const response = await fetch(`${this.config.networkEndpoint}/api/wallet:get`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: this.wallet.address })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.balances = data.balances || this.balances;
            } else {
                // Use mock balances
                this.balances = {
                    STR: Math.random() * 10000,
                    CCOS: Math.random() * 1000,
                    ARSS: Math.random() * 500
                };
            }
            
            // Update UI
            document.getElementById('str-balance').textContent = this.formatNumber(this.balances.STR);
            document.getElementById('ccos-balance').textContent = this.formatNumber(this.balances.CCOS);
            document.getElementById('arss-balance').textContent = this.formatNumber(this.balances.ARSS);
            
        } catch (error) {
            console.error('Balance update error:', error);
        }
    }
    
    async sendTransaction() {
        if (!this.wallet) {
            alert('No wallet loaded');
            return;
        }
        
        const recipient = document.getElementById('recipient-address').value;
        const amount = parseFloat(document.getElementById('send-amount').value);
        const token = document.getElementById('send-token').value;
        
        if (!recipient.startsWith('zk13str_')) {
            alert('Invalid recipient address');
            return;
        }
        
        if (amount <= 0 || amount > this.balances[token]) {
            alert('Invalid amount or insufficient balance');
            return;
        }
        
        try {
            // Create transaction
            const tx = {
                from: this.wallet.address,
                to: recipient,
                amount,
                token,
                timestamp: Date.now(),
                hash: this.generateTxHash()
            };
            
            // Send to network
            const response = await fetch(`${this.config.networkEndpoint}/api/transaction:submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tx)
            });
            
            if (response.ok) {
                window.sourcelessClient?.showNotification('Transaction sent successfully!', 'success');
                document.getElementById('send-tx-form').reset();
                await this.updateBalances();
                await this.loadTransactionHistory();
            } else {
                throw new Error('Transaction failed');
            }
            
        } catch (error) {
            console.error('Transaction error:', error);
            window.sourcelessClient?.showNotification('Transaction failed: ' + error.message, 'error');
        }
    }
    
    async loadTransactionHistory() {
        if (!this.wallet) return;
        
        const txList = document.getElementById('tx-list');
        if (!txList) return;
        
        // Generate mock transactions
        const transactions = [];
        for (let i = 0; i < 10; i++) {
            transactions.push({
                hash: this.generateTxHash().substring(0, 16) + '...',
                from: i % 2 === 0 ? this.wallet.address.substring(0, 20) + '...' : 'zk13str_other...',
                to: i % 2 === 0 ? 'zk13str_other...' : this.wallet.address.substring(0, 20) + '...',
                amount: (Math.random() * 100).toFixed(2),
                token: ['STR', 'CCOS', 'ARSS'][Math.floor(Math.random() * 3)],
                timestamp: Date.now() - (i * 3600000),
                status: Math.random() > 0.1 ? 'confirmed' : 'pending'
            });
        }
        
        txList.innerHTML = transactions.map(tx => `
            <div class="tx-item ${tx.status}">
                <div class="tx-hash"><code>${tx.hash}</code></div>
                <div class="tx-details">
                    <span class="${tx.from.includes('other') ? 'tx-in' : 'tx-out'}">
                        ${tx.from.includes('other') ? '📥 Received' : '📤 Sent'}
                    </span>
                    <span class="tx-amount">${tx.amount} ${tx.token}</span>
                    <span class="tx-time">${this.formatTimeAgo(tx.timestamp)}</span>
                    <span class="tx-status-badge ${tx.status}">${tx.status}</span>
                </div>
            </div>
        `).join('');
    }
    
    copyAddress() {
        if (!this.wallet) return;
        
        navigator.clipboard.writeText(this.wallet.address).then(() => {
            window.sourcelessClient?.showNotification('Address copied to clipboard!', 'success');
        });
    }
    
    importWallet() {
        const seedPhrase = prompt('Enter your 12-word seed phrase:');
        if (!seedPhrase) return;
        
        const password = prompt('Set a password for this wallet:');
        if (!password || password.length < 8) {
            alert('Password must be at least 8 characters long');
            return;
        }
        
        this.createWalletFromSeed(seedPhrase, password).then(wallet => {
            this.saveWallet(wallet, password);
            this.loadWallet();
            window.sourcelessClient?.showNotification('Wallet imported successfully!', 'success');
        }).catch(error => {
            console.error('Import error:', error);
            alert('Failed to import wallet: ' + error.message);
        });
    }
    
    exportWallet() {
        if (!this.wallet) {
            alert('No wallet to export');
            return;
        }
        
        const walletData = JSON.stringify(this.wallet, null, 2);
        const blob = new Blob([walletData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sourceless-wallet-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        window.sourcelessClient?.showNotification('Wallet exported successfully!', 'success');
    }
    
    isUnlocked() {
        return this.wallet && !this.locked;
    }
    
    generateTxHash() {
        return '0x' + Array.from({length: 64}, () => 
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
    }
    
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        }
        return num.toFixed(2);
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
