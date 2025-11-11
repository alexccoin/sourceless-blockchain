/**
 * SOURCELESS BLOCKCHAIN - API CONNECTION LAYER
 * Complete API integration for all components
 * Version: 0.21.0 - Superadmin Full Implementation
 */

// ============================================================================
// API BASE CONFIGURATION
// ============================================================================

const API_CONFIG = {
    baseURL: 'http://localhost:3002',
    timeout: 10000,
    retries: 3
};

// Enhanced API caller with retry logic
async function apiRequest(endpoint, options = {}) {
    const url = `${API_CONFIG.baseURL}/api/${endpoint}`;
    
    for (let i = 0; i < API_CONFIG.retries; i++) {
        try {
            const response = await fetch(url, {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                body: options.body ? JSON.stringify(options.body) : undefined,
                signal: AbortSignal.timeout(API_CONFIG.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✅ API Success: ${endpoint}`, data);
            return data;
        } catch (error) {
            console.error(`❌ API Error (attempt ${i + 1}/${API_CONFIG.retries}): ${endpoint}`, error);
            if (i === API_CONFIG.retries - 1) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

// ============================================================================
// WALLET API
// ============================================================================

const WalletAPI = {
    async getBalance(address) {
        try {
            const data = await apiRequest(`wallet/balance/${address}`);
            return data.balance || 0;
        } catch (error) {
            console.error('Failed to get balance:', error);
            return 0;
        }
    },

    async getWalletInfo() {
        try {
            const data = await apiRequest('wallet:get');
            return data;
        } catch (error) {
            console.warn('Using mock wallet info - Owner/Treasury account');
            return {
                address: 'zk13str_f071622a9993731a2d2cce32e05cf60bc0b31061_438d',
                domain: 'STR.foundation',
                kycStatus: 'verified',
                role: 'owner',
                treasuryAccess: true,
                balance: 42210000000, // 67% of 63B STR
                network: 'sourceless'
            };
        }
    },

    async sendTransaction(recipient, amount, memo = '') {
        try {
            Components.Utils.showNotification('🔄 Sending transaction...', 'info');
            
            const data = await apiRequest('transaction/send', {
                method: 'POST',
                body: {
                    to: recipient,
                    amount: parseFloat(amount),
                    memo: memo
                }
            });

            Components.Utils.showNotification('✅ Transaction sent successfully!', 'success');
            return data;
        } catch (error) {
            Components.Utils.showNotification('❌ Transaction failed: ' + error.message, 'error');
            throw error;
        }
    },

    async getTransactionHistory(address, limit = 20) {
        try {
            const data = await apiRequest(`wallet/transactions/${address}?limit=${limit}`);
            return data.transactions || [];
        } catch (error) {
            console.warn('Using mock transaction history');
            // Return mock transactions for demo
            return [
                {
                    type: 'receive',
                    address: 'zk13str_alice_0001',
                    amount: 50.0,
                    timestamp: Date.now() - 3600000,
                    status: 'confirmed',
                    hash: '0xabc123...'
                },
                {
                    type: 'send',
                    address: 'zk13str_bob_0002',
                    amount: 25.0,
                    timestamp: Date.now() - 7200000,
                    status: 'confirmed',
                    hash: '0xdef456...'
                },
                {
                    type: 'receive',
                    address: 'zk13str_charlie_0003',
                    amount: 100.0,
                    timestamp: Date.now() - 10800000,
                    status: 'confirmed',
                    hash: '0xghi789...'
                },
                {
                    type: 'send',
                    address: 'zk13str_dave_0004',
                    amount: 15.5,
                    timestamp: Date.now() - 14400000,
                    status: 'pending',
                    hash: '0xjkl012...'
                },
                {
                    type: 'receive',
                    address: 'zk13str_eve_0005',
                    amount: 75.25,
                    timestamp: Date.now() - 18000000,
                    status: 'confirmed',
                    hash: '0xmno345...'
                }
            ];
        }
    },

    async getMultiTokenBalances(address) {
        try {
            const data = await apiRequest(`wallet/balances/${address}`);
            return data.balances || {
                STR: 0,
                CCOS: 0,
                CCOIN: 0,
                ARSS: 0
            };
        } catch (error) {
            console.warn('Using mock token balances - Treasury holdings');
            // Owner has access to treasury (67% of total supply)
            return { 
                STR: 42210000000,      // 67% of 63B STR (treasury)
                CCOS: 42210000,        // 67% of 63M CCOS (treasury)
                CCOIN: 5000000,        // 5M CCOIN
                ARSS: 10000000,        // 10M ARSS
                wSTR: 1000000,         // 1M wSTR
                eSTR: 500000,          // 500K eSTR
                $TR: 2500000           // 2.5M $TR (USD-pegged)
            };
        }
    }
};

// ============================================================================
// EXPLORER API
// ============================================================================

const ExplorerAPI = {
    async getBlockchainStats() {
        try {
            const data = await apiRequest('blockchain/stats');
            return data;
        } catch (error) {
            console.warn('Using mock blockchain stats');
            return {
                totalBlocks: 125847,
                totalTransactions: 1548932,
                networkTPS: 100000,
                networkTPMS: 1313,
                totalSTR: 1000000000,
                crossChainTxs: 45213,
                activeValidators: 1313,
                totalValidators: 1313,
                networkHashRate: '15.2 PH/s',
                peers: 7
            };
        }
    },

    async getBlock(blockNumber) {
        try {
            const data = await apiRequest(`blockchain/block/${blockNumber}`);
            return data.block;
        } catch (error) {
            console.warn('Using mock block data');
            return {
                number: blockNumber,
                hash: '0xabc123def456...',
                previousHash: '0x789ghi012jkl...',
                timestamp: Date.now(),
                miner: 'zk13str_validator_001',
                transactions: 42,
                ledger: 'main'
            };
        }
    },

    async getRecentBlocks(limit = 10) {
        try {
            const data = await apiRequest(`blockchain/blocks/recent?limit=${limit}`);
            return data.blocks || [];
        } catch (error) {
            console.warn('Using mock recent blocks');
            const blocks = [];
            for (let i = 0; i < limit; i++) {
                blocks.push({
                    number: 125847 - i,
                    hash: `0x${Math.random().toString(16).substr(2, 12)}...`,
                    timestamp: Date.now() - (i * 60000),
                    transactions: Math.floor(Math.random() * 100),
                    miner: `zk13str_validator_${String(i + 1).padStart(3, '0')}`,
                    ledger: ['main', 'asset', 'ccoin'][i % 3]
                });
            }
            return blocks;
        }
    },

    async search(query) {
        try {
            Components.Utils.showNotification('🔍 Searching...', 'info');
            const data = await apiRequest(`blockchain/search?q=${encodeURIComponent(query)}`);
            
            if (data.results && data.results.length > 0) {
                Components.Utils.showNotification(`✅ Found ${data.results.length} result(s)`, 'success');
            } else {
                Components.Utils.showNotification('⚠️ No results found', 'info');
            }
            
            return data.results || [];
        } catch (error) {
            Components.Utils.showNotification('❌ Search failed', 'error');
            return [];
        }
    },

    async viewBlock(blockNumber) {
        const block = await this.getBlock(blockNumber);
        const container = document.getElementById('search-results');
        if (container && block) {
            container.innerHTML = Components.ExplorerComponents.createBlockViewer(block);
        }
    },

    async getLedgerStats(ledger) {
        try {
            const data = await apiRequest(`blockchain/ledger/${ledger}/stats`);
            return data;
        } catch (error) {
            console.error(`Failed to get ${ledger} ledger stats:`, error);
            return { blocks: 0, transactions: 0 };
        }
    }
};

// ============================================================================
// SMART CONTRACT API
// ============================================================================

const ContractAPI = {
    async compile() {
        const code = document.getElementById('contract-code')?.value;
        if (!code) {
            Components.Utils.showNotification('❌ No code to compile', 'error');
            return;
        }

        try {
            Components.Utils.showNotification('🔨 Compiling...', 'info');
            const data = await apiRequest('contracts/compile', {
                method: 'POST',
                body: { code }
            });

            const output = document.getElementById('compile-output');
            if (output) {
                output.innerHTML = data.success
                    ? `<div class="success">✅ Compilation successful!</div>`
                    : `<div class="error">❌ ${data.error}</div>`;
            }

            Components.Utils.showNotification(
                data.success ? '✅ Compilation successful!' : '❌ Compilation failed',
                data.success ? 'success' : 'error'
            );

            return data;
        } catch (error) {
            Components.Utils.showNotification('❌ Compilation error: ' + error.message, 'error');
            throw error;
        }
    },

    async deployFromEditor() {
        const code = document.getElementById('contract-code')?.value;
        const name = document.getElementById('contract-name')?.value || 'Untitled';

        if (!code) {
            Components.Utils.showNotification('❌ No contract code provided', 'error');
            return;
        }

        try {
            Components.Utils.showNotification('🚀 Deploying contract...', 'info');
            const data = await apiRequest('contracts/deploy', {
                method: 'POST',
                body: {
                    name,
                    code,
                    fee: 100 // 100 CCOS deployment fee
                }
            });

            Components.Utils.showNotification('✅ Contract deployed successfully!', 'success');
            return data;
        } catch (error) {
            Components.Utils.showNotification('❌ Deployment failed: ' + error.message, 'error');
            throw error;
        }
    },

    async getDeployedContracts(walletAddress) {
        try {
            const data = await apiRequest(`contracts/list/${walletAddress}`);
            return data.contracts || [];
        } catch (error) {
            console.error('Failed to get deployed contracts:', error);
            return [];
        }
    },

    async interact(contractAddress) {
        // Open contract interaction modal
        Components.Utils.showNotification('🔄 Loading contract interface...', 'info');
        try {
            const data = await apiRequest(`contracts/${contractAddress}/interface`);
            // TODO: Show modal with contract ABI and interaction forms
            console.log('Contract ABI:', data);
        } catch (error) {
            Components.Utils.showNotification('❌ Failed to load contract', 'error');
        }
    },

    async loadTemplate(templateName) {
        try {
            const data = await apiRequest(`contracts/template/${encodeURIComponent(templateName)}`);
            const codeEditor = document.getElementById('contract-code');
            if (codeEditor && data.code) {
                codeEditor.value = data.code;
                Components.Utils.showNotification(`✅ Loaded template: ${templateName}`, 'success');
            }
        } catch (error) {
            Components.Utils.showNotification('❌ Failed to load template', 'error');
        }
    }
};

// ============================================================================
// DOMAIN API
// ============================================================================

const DomainAPI = {
    async checkAvailability(domain) {
        try {
            const data = await apiRequest(`domains/check/${domain}`);
            return data.available;
        } catch (error) {
            console.error('Failed to check domain availability:', error);
            return false;
        }
    },

    async register(domain, walletAddress, period) {
        try {
            Components.Utils.showNotification('🌐 Registering domain...', 'info');
            const data = await apiRequest('domains/register', {
                method: 'POST',
                body: {
                    domain,
                    wallet: walletAddress,
                    period: parseInt(period)
                }
            });

            Components.Utils.showNotification('✅ Domain registered successfully!', 'success');
            return data;
        } catch (error) {
            Components.Utils.showNotification('❌ Registration failed: ' + error.message, 'error');
            throw error;
        }
    },

    async getUserDomains(walletAddress) {
        try {
            const data = await apiRequest(`domains/list/${walletAddress}`);
            return data.domains || [];
        } catch (error) {
            console.error('Failed to get user domains:', error);
            return [];
        }
    },

    async manage(domain) {
        Components.Utils.showNotification(`🔧 Opening management for ${domain}...`, 'info');
        // TODO: Show domain management modal
    },

    async renew(domain) {
        try {
            Components.Utils.showNotification('🔄 Renewing domain...', 'info');
            const data = await apiRequest('domains/renew', {
                method: 'POST',
                body: { domain }
            });

            Components.Utils.showNotification('✅ Domain renewed!', 'success');
            return data;
        } catch (error) {
            Components.Utils.showNotification('❌ Renewal failed: ' + error.message, 'error');
            throw error;
        }
    },

    async resolve(domain) {
        try {
            const data = await apiRequest(`domains/resolve/${domain}`);
            return data.address;
        } catch (error) {
            console.error('Failed to resolve domain:', error);
            return null;
        }
    }
};

// ============================================================================
// ARES AI API
// ============================================================================

const AresAPI = {
    async sendMessage() {
        const input = document.getElementById('ares-input');
        const messagesContainer = document.getElementById('ares-messages');
        
        if (!input || !messagesContainer) return;

        const message = input.value.trim();
        if (!message) return;

        // Add user message
        const userMsg = document.createElement('div');
        userMsg.className = 'message user';
        userMsg.innerHTML = `<strong>You:</strong><p>${message}</p>`;
        messagesContainer.appendChild(userMsg);

        input.value = '';
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            // Show typing indicator
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'message assistant typing';
            typingIndicator.innerHTML = '<strong>ARES:</strong><p>Thinking...</p>';
            messagesContainer.appendChild(typingIndicator);

            const data = await apiRequest('ares/chat', {
                method: 'POST',
                body: { message }
            });

            // Remove typing indicator
            typingIndicator.remove();

            // Add AI response
            const aiMsg = document.createElement('div');
            aiMsg.className = 'message assistant';
            aiMsg.innerHTML = `<strong>ARES:</strong><p>${data.response}</p>`;
            messagesContainer.appendChild(aiMsg);

            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } catch (error) {
            Components.Utils.showNotification('❌ ARES is currently offline', 'error');
        }
    },

    async generateContract() {
        const description = document.getElementById('contract-description')?.value;
        if (!description) {
            Components.Utils.showNotification('❌ Please describe what you want to create', 'error');
            return;
        }

        try {
            Components.Utils.showNotification('🤖 ARES is generating your contract...', 'info');
            const data = await apiRequest('ares/generate', {
                method: 'POST',
                body: { description }
            });

            const output = document.getElementById('generated-code');
            if (output && data.code) {
                output.innerHTML = `
                    <h4>Generated Contract:</h4>
                    <pre><code>${data.code}</code></pre>
                    <button class="btn-primary" onclick="AresAPI.useGeneratedCode()">Use This Code</button>
                `;
                Components.Utils.showNotification('✅ Contract generated!', 'success');
            }
        } catch (error) {
            Components.Utils.showNotification('❌ Generation failed: ' + error.message, 'error');
        }
    },

    useGeneratedCode() {
        const generatedCode = document.querySelector('#generated-code code')?.textContent;
        const codeEditor = document.getElementById('contract-code');
        
        if (generatedCode && codeEditor) {
            codeEditor.value = generatedCode;
            Components.Utils.showNotification('✅ Code copied to editor!', 'success');
            
            // Switch to editor tab
            document.querySelector('[data-page="contracts"]')?.click();
        }
    }
};

// ============================================================================
// GOVERNANCE API
// ============================================================================

const GovernanceAPI = {
    async getProposals() {
        try {
            const data = await apiRequest('governance/proposals');
            return data.proposals || [];
        } catch (error) {
            console.error('Failed to get proposals:', error);
            return [];
        }
    },

    async createProposal(title, description) {
        try {
            Components.Utils.showNotification('📝 Creating proposal...', 'info');
            const data = await apiRequest('governance/proposal/create', {
                method: 'POST',
                body: { title, description }
            });

            Components.Utils.showNotification('✅ Proposal created!', 'success');
            return data;
        } catch (error) {
            Components.Utils.showNotification('❌ Failed to create proposal', 'error');
            throw error;
        }
    },

    async vote(proposalId, vote) {
        try {
            Components.Utils.showNotification('🗳️ Submitting vote...', 'info');
            const data = await apiRequest('governance/vote', {
                method: 'POST',
                body: { proposalId, vote }
            });

            Components.Utils.showNotification('✅ Vote recorded!', 'success');
            return data;
        } catch (error) {
            Components.Utils.showNotification('❌ Vote failed', 'error');
            throw error;
        }
    }
};

// ============================================================================
// BRIDGE API
// ============================================================================

const BridgeAPI = {
    async getSupportedChains() {
        try {
            const data = await apiRequest('bridge/chains');
            return data.chains || ['Bitcoin', 'Ethereum', 'Cardano', 'Stellar', 'Ripple'];
        } catch (error) {
            console.error('Failed to get supported chains:', error);
            return ['Bitcoin', 'Ethereum', 'Cardano', 'Stellar', 'Ripple'];
        }
    },

    async bridgeAssets(fromChain, toChain, asset, amount, fromAddress, toAddress) {
        try {
            Components.Utils.showNotification('🌉 Initiating bridge transfer...', 'info');
            const data = await apiRequest('bridge/transfer', {
                method: 'POST',
                body: {
                    fromChain,
                    toChain,
                    asset,
                    amount: parseFloat(amount),
                    fromAddress,
                    toAddress
                }
            });

            Components.Utils.showNotification('✅ Bridge transfer initiated!', 'success');
            return data;
        } catch (error) {
            Components.Utils.showNotification('❌ Bridge failed: ' + error.message, 'error');
            throw error;
        }
    },

    async getBridgeHistory(address) {
        try {
            const data = await apiRequest(`bridge/history/${address}`);
            return data.transfers || [];
        } catch (error) {
            console.error('Failed to get bridge history:', error);
            return [];
        }
    }
};

// ============================================================================
// VALIDATOR API
// ============================================================================

const ValidatorAPI = {
    async getNetworkStats() {
        try {
            const data = await apiRequest('validators/stats');
            return data;
        } catch (error) {
            console.error('Failed to get validator stats:', error);
            return {
                totalValidators: 1313,
                genesisValidators: 1313,
                personalValidators: 0,
                totalStorage: 0,
                totalCPU: 0,
                totalBandwidth: 0
            };
        }
    },

    async registerValidator(domain, resources) {
        try {
            Components.Utils.showNotification('🔧 Registering validator...', 'info');
            const data = await apiRequest('validator/register', {
                method: 'POST',
                body: {
                    domain,
                    ...resources
                }
            });

            Components.Utils.showNotification('✅ Validator registered!', 'success');
            return data;
        } catch (error) {
            Components.Utils.showNotification('❌ Registration failed', 'error');
            throw error;
        }
    }
};

// Export all APIs
window.API = {
    WalletAPI,
    ExplorerAPI,
    ContractAPI,
    DomainAPI,
    AresAPI,
    GovernanceAPI,
    BridgeAPI,
    ValidatorAPI,
    apiRequest
};

console.log('✅ API layer loaded');
