/**
 * SOURCELESS BLOCKCHAIN - UI COMPONENTS LIBRARY
 * Complete component system for all navigation pages
 * Version: 0.21.0 - Superadmin Full Implementation
 */

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const Utils = {
    // Format numbers with commas
    formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    },

    // Format STR amounts
    formatSTR(amount) {
        return `${this.formatNumber(parseFloat(amount).toFixed(2))} STR`;
    },

    // Format timestamps
    formatTime(timestamp) {
        return new Date(timestamp).toLocaleString();
    },

    // Shorten addresses
    shortenAddress(address, start = 10, end = 6) {
        if (!address) return 'N/A';
        return `${address.substring(0, start)}...${address.substring(address.length - end)}`;
    },

    // Copy to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('✅ Copied to clipboard!', 'success');
        } catch (err) {
            console.error('Copy failed:', err);
            this.showNotification('❌ Copy failed', 'error');
        }
    },

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? 'rgba(0, 255, 136, 0.2)' : type === 'error' ? 'rgba(255, 68, 68, 0.2)' : 'rgba(0, 212, 255, 0.2)'};
            border: 1px solid ${type === 'success' ? '#00ff88' : type === 'error' ? '#ff4444' : '#00d4ff'};
            border-radius: 8px;
            color: #fff;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    // Validate ZK13STR address
    validateAddress(address) {
        return /^zk13str_[a-zA-Z0-9]+_[a-zA-Z0-9]+$/.test(address);
    },

    // Validate STR.domain
    validateDomain(domain) {
        return /^STR\.[a-z0-9]{3,32}$/.test(domain);
    },

    // Format time ago (e.g., "2 minutes ago")
    formatTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return `${seconds}s ago`;
        
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days}d ago`;
        
        const months = Math.floor(days / 30);
        if (months < 12) return `${months}mo ago`;
        
        const years = Math.floor(months / 12);
        return `${years}y ago`;
    }
};

// ============================================================================
// WALLET COMPONENTS
// ============================================================================

const WalletComponents = {
    // Create send form
    createSendForm() {
        return `
            <div class="card">
                <h3>💸 Send Transaction</h3>
                <form id="sendForm" class="transaction-form">
                    <div class="form-group">
                        <label>Recipient Address or Domain</label>
                        <input type="text" id="send-recipient" placeholder="zk13str_... or STR.domain" required />
                        <small>Supports ZK13STR addresses and STR.domains</small>
                    </div>
                    
                    <div class="form-group">
                        <label>Amount (STR)</label>
                        <input type="number" id="send-amount" step="0.01" min="0" placeholder="0.00" required />
                        <small>Available: <span id="available-balance">0</span> STR</small>
                    </div>

                    <div class="form-group">
                        <label>Ledger</label>
                        <select id="send-ledger">
                            <option value="main">Main Ledger (STR Transfers)</option>
                            <option value="asset">Asset Ledger (Domains & NFTs)</option>
                            <option value="ccoin">CCOIN Ledger (Financial)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Message (Optional)</label>
                        <textarea id="send-memo" placeholder="Add a note to this transaction" rows="2"></textarea>
                    </div>

                    <div class="fee-estimate">
                        <span>Network Fee:</span>
                        <strong id="tx-fee">0.001 STR</strong>
                    </div>

                    <button type="submit" class="btn-primary btn-full">
                        🚀 Send Transaction
                    </button>
                </form>
            </div>
        `;
    },

    // Create transaction history
    createTransactionHistory(transactions = []) {
        if (transactions.length === 0) {
            return `
                <div class="empty-state">
                    <p>No transactions yet</p>
                    <small>Your transaction history will appear here</small>
                </div>
            `;
        }

        return `
            <div class="transaction-list">
                ${transactions.map(tx => `
                    <div class="transaction-item ${tx.type}">
                        <div class="tx-icon">
                            ${tx.type === 'send' ? '📤' : '📥'}
                        </div>
                        <div class="tx-details">
                            <strong>${tx.type === 'send' ? 'Sent to' : 'Received from'} ${Utils.shortenAddress(tx.address)}</strong>
                            <small>${Utils.formatTime(tx.timestamp)}</small>
                        </div>
                        <div class="tx-amount ${tx.type}">
                            ${tx.type === 'send' ? '-' : '+'}${Utils.formatSTR(tx.amount)}
                        </div>
                        <div class="tx-status ${tx.status}">
                            ${tx.status === 'confirmed' ? '✅' : '⏳'}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Create QR code generator
    createQRGenerator(address) {
        return `
            <div class="card qr-card">
                <h3>📱 Receive Payments</h3>
                <div class="qr-container">
                    <div id="qr-code"></div>
                    <p class="qr-address">${address}</p>
                    <button class="btn-secondary" onclick="Utils.copyToClipboard('${address}')">
                        📋 Copy Address
                    </button>
                </div>
            </div>
        `;
    },

    // Multi-token balances
    createTokenBalances(balances) {
        return `
            <div class="token-balances">
                <h3>💰 Token Balances</h3>
                <div class="balance-list">
                    ${Object.entries(balances).map(([token, amount]) => `
                        <div class="balance-item">
                            <span class="token-icon">${this.getTokenIcon(token)}</span>
                            <div class="token-info">
                                <strong>${token}</strong>
                                <small>${this.getTokenName(token)}</small>
                            </div>
                            <div class="token-amount">
                                ${Utils.formatNumber(amount)}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    getTokenIcon(token) {
        const icons = {
            'STR': '⭐',
            'CCOS': '🔥',
            'CCOIN': '💵',
            'ARSS': '💎',
            'wSTR': '🔄',
            'eSTR': '⚡',
            '$TR': '💲'
        };
        return icons[token] || '🪙';
    },

    getTokenName(token) {
        const names = {
            'STR': 'Sourceless',
            'CCOS': 'CCOIN Network',
            'CCOIN': 'Cross-Chain',
            'ARSS': 'VM Hosting Credits',
            'wSTR': 'Wrapped STR',
            'eSTR': 'Energy Sourceless',
            '$TR': 'Dollar Sourceless'
        };
        return names[token] || 'Token';
    }
};

// ============================================================================
// EXPLORER COMPONENTS
// ============================================================================

const ExplorerComponents = {
    // Create block viewer
    createBlockViewer(block) {
        if (!block) {
            return '<div class="empty-state">Block not found</div>';
        }

        return `
            <div class="block-details card">
                <h3>📦 Block #${block.index || 0}</h3>
                <div class="detail-grid">
                    <div class="detail-row">
                        <span>Hash:</span>
                        <code>${block.hash || 'N/A'}</code>
                        <button onclick="Utils.copyToClipboard('${block.hash}')">📋</button>
                    </div>
                    <div class="detail-row">
                        <span>Previous Hash:</span>
                        <code>${Utils.shortenAddress(block.previousHash || 'Genesis', 16, 16)}</code>
                    </div>
                    <div class="detail-row">
                        <span>Timestamp:</span>
                        <strong>${Utils.formatTime(block.timestamp)}</strong>
                    </div>
                    <div class="detail-row">
                        <span>Miner:</span>
                        <code>${Utils.shortenAddress(block.miner || 'N/A')}</code>
                    </div>
                    <div class="detail-row">
                        <span>Transactions:</span>
                        <strong>${block.transactions?.length || 0}</strong>
                    </div>
                    <div class="detail-row">
                        <span>Ledger:</span>
                        <span class="ledger-badge">${block.ledger || 'main'}</span>
                    </div>
                </div>
                ${this.createTransactionList(block.transactions)}
            </div>
        `;
    },

    // Create transaction list
    createTransactionList(transactions = []) {
        if (transactions.length === 0) {
            return '<div class="empty-state"><small>No transactions in this block</small></div>';
        }

        return `
            <div class="tx-list">
                <h4>📝 Transactions (${transactions.length})</h4>
                ${transactions.map((tx, i) => `
                    <div class="tx-item">
                        <span class="tx-index">#${i + 1}</span>
                        <span class="tx-from">${Utils.shortenAddress(tx.from)}</span>
                        <span class="tx-arrow">→</span>
                        <span class="tx-to">${Utils.shortenAddress(tx.to)}</span>
                        <span class="tx-amount">${Utils.formatSTR(tx.amount)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Create search bar
    createSearchBar() {
        return `
            <div class="explorer-search card">
                <h3>🔍 Blockchain Search</h3>
                <div class="search-container">
                    <input type="text" id="explorer-search" placeholder="Search by block number, hash, address, or domain..." />
                    <button class="btn-primary" onclick="ExplorerAPI.search()">Search</button>
                </div>
                <div id="search-results"></div>
            </div>
        `;
    },

    // Create recent blocks list
    createRecentBlocks(blocks = []) {
        return `
            <div class="recent-blocks card">
                <h3>📦 Recent Blocks</h3>
                <div class="blocks-list">
                    ${blocks.slice(0, 10).map(block => `
                        <div class="block-item" onclick="ExplorerAPI.viewBlock(${block.index})">
                            <div class="block-number">#${block.index}</div>
                            <div class="block-info">
                                <div class="block-hash">${Utils.shortenAddress(block.hash, 12, 12)}</div>
                                <div class="block-time">${Utils.formatTime(block.timestamp)}</div>
                            </div>
                            <div class="block-txs">${block.transactions?.length || 0} txs</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
};

// ============================================================================
// SMART CONTRACT COMPONENTS
// ============================================================================

const ContractComponents = {
    // Create contract IDE
    createContractIDE() {
        return `
            <div class="contract-ide card">
                <h3>💻 Smart Contract IDE</h3>
                <div class="ide-tabs">
                    <button class="ide-tab active" data-tab="editor">Editor</button>
                    <button class="ide-tab" data-tab="deploy">Deploy</button>
                    <button class="ide-tab" data-tab="templates">Templates</button>
                </div>

                <div class="ide-content">
                    <div class="ide-panel active" id="ide-editor">
                        <div class="editor-toolbar">
                            <select id="contract-language">
                                <option value="areslang">AresLang</option>
                                <option value="solidity">Solidity (via transpiler)</option>
                            </select>
                            <button class="btn-secondary" onclick="ContractAPI.compile()">🔨 Compile</button>
                            <button class="btn-primary" onclick="ContractAPI.deployFromEditor()">🚀 Deploy</button>
                        </div>
                        <textarea id="contract-code" class="code-editor" placeholder="// Write your smart contract here..."></textarea>
                        <div id="compile-output" class="output-panel"></div>
                    </div>

                    <div class="ide-panel" id="ide-deploy">
                        <form id="deploy-form">
                            <div class="form-group">
                                <label>Contract Name</label>
                                <input type="text" id="contract-name" required />
                            </div>
                            <div class="form-group">
                                <label>Deployment Fee</label>
                                <input type="number" id="deploy-fee" value="100" readonly />
                                <small>100 CCOS required for deployment</small>
                            </div>
                            <button type="submit" class="btn-primary btn-full">Deploy Contract</button>
                        </form>
                    </div>

                    <div class="ide-panel" id="ide-templates">
                        ${this.createTemplateGallery()}
                    </div>
                </div>
            </div>
        `;
    },

    // Create template gallery
    createTemplateGallery() {
        const templates = [
            { name: 'Token Contract', icon: '🪙', description: 'ERC20-like token' },
            { name: 'NFT Collection', icon: '🖼️', description: 'NFT minting contract' },
            { name: 'DAO Governance', icon: '🗳️', description: 'Voting and proposals' },
            { name: 'Multi-Sig Wallet', icon: '🔐', description: 'Secure multi-signature' },
            { name: 'Staking Pool', icon: '💎', description: 'Stake and earn rewards' },
            { name: 'Marketplace', icon: '🛒', description: 'Buy/sell assets' }
        ];

        return `
            <div class="template-gallery">
                ${templates.map(t => `
                    <div class="template-card" onclick="ContractAPI.loadTemplate('${t.name}')">
                        <div class="template-icon">${t.icon}</div>
                        <h4>${t.name}</h4>
                        <p>${t.description}</p>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // Create deployed contracts list
    createDeployedContracts(contracts = []) {
        if (contracts.length === 0) {
            return '<div class="empty-state">No contracts deployed yet</div>';
        }

        return `
            <div class="contracts-list card">
                <h3>📝 Your Contracts</h3>
                ${contracts.map(c => `
                    <div class="contract-item">
                        <div class="contract-icon">📜</div>
                        <div class="contract-info">
                            <strong>${c.name}</strong>
                            <small>${Utils.shortenAddress(c.address)}</small>
                        </div>
                        <div class="contract-status ${c.status}">${c.status}</div>
                        <button class="btn-secondary" onclick="ContractAPI.interact('${c.address}')">Interact</button>
                    </div>
                `).join('')}
            </div>
        `;
    }
};

// ============================================================================
// DOMAIN COMPONENTS
// ============================================================================

const DomainComponents = {
    // Create domain registration form
    createRegistrationForm() {
        return `
            <div class="domain-register card">
                <h3>🌐 Register STR.Domain</h3>
                <form id="domain-register-form">
                    <div class="form-group">
                        <label>Domain Name</label>
                        <div class="domain-input">
                            <span class="domain-prefix">STR.</span>
                            <input type="text" id="domain-name" pattern="[a-z0-9]{3,32}" placeholder="yourdomain" required />
                        </div>
                        <small>3-32 characters, lowercase letters and numbers only</small>
                    </div>

                    <div class="form-group">
                        <label>Wallet Address</label>
                        <input type="text" id="domain-wallet" placeholder="zk13str_..." required />
                    </div>

                    <div class="form-group">
                        <label>Registration Period</label>
                        <select id="domain-period">
                            <option value="1">1 Year - 10 STR</option>
                            <option value="3">3 Years - 25 STR (Save 17%)</option>
                            <option value="5">5 Years - 40 STR (Save 20%)</option>
                        </select>
                    </div>

                    <div class="domain-check" id="domain-availability"></div>

                    <button type="submit" class="btn-primary btn-full">Register Domain</button>
                </form>
            </div>
        `;
    },

    // Create domain list
    createDomainList(domains = []) {
        if (domains.length === 0) {
            return '<div class="empty-state">No domains registered</div>';
        }

        return `
            <div class="domains-list card">
                <h3>Your STR.Domains</h3>
                ${domains.map(d => `
                    <div class="domain-item">
                        <div class="domain-icon">🌐</div>
                        <div class="domain-info">
                            <strong>${d.name}</strong>
                            <small>Expires: ${Utils.formatTime(d.expiry)}</small>
                        </div>
                        <div class="domain-actions">
                            <button class="btn-secondary" onclick="DomainAPI.manage('${d.name}')">Manage</button>
                            <button class="btn-secondary" onclick="DomainAPI.renew('${d.name}')">Renew</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
};

// ============================================================================
// ARES AI COMPONENTS
// ============================================================================

const AresComponents = {
    // Create AI chat interface
    createChatInterface() {
        return `
            <div class="ares-chat card">
                <h3>⚡ ARES Assistant</h3>
                <div class="chat-messages" id="ares-messages">
                    <div class="message assistant">
                        <strong>ARES:</strong>
                        <p>Hello! I'm ARES, your intelligent assistant for Sourceless Blockchain. I can help you:</p>
                        <ul>
                            <li>Generate smart contracts</li>
                            <li>Explain blockchain concepts</li>
                            <li>Debug transactions</li>
                            <li>Optimize gas fees</li>
                        </ul>
                        <p>What would you like to know?</p>
                    </div>
                </div>
                <div class="chat-input">
                    <textarea id="ares-input" placeholder="Ask ARES anything..." rows="3"></textarea>
                    <button class="btn-primary" onclick="AresAPI.sendMessage()">Send</button>
                </div>
            </div>
        `;
    },

    // Create code generation panel
    createCodeGenerator() {
        return `
            <div class="code-generator card">
                <h3>✨ Smart Contract Generator</h3>
                <form id="contract-generator-form">
                    <div class="form-group">
                        <label>What would you like to create?</label>
                        <textarea id="contract-description" placeholder="Describe your smart contract in plain English..." rows="4"></textarea>
                    </div>
                    <button type="submit" class="btn-primary btn-full">🤖 Generate Contract</button>
                </form>
                <div id="generated-code" class="code-output"></div>
            </div>
        `;
    }
};

// Export all components
window.Components = {
    Utils,
    WalletComponents,
    ExplorerComponents,
    ContractComponents,
    DomainComponents,
    AresComponents
};

console.log('✅ Components library loaded');
