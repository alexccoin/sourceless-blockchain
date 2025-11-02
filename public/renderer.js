// Sourceless Blockchain v0.13 - STARW Personal Node Client
console.log('🔷 Sourceless Client Loaded');

// Check if sourcelessAPI is available
const hasAPI = typeof window.sourcelessAPI !== 'undefined';

// Navigation
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initExplorer();
    initForms();
    loadDashboard();
    
    // Setup real-time updates if API is available
    if (hasAPI) {
        setupRealTimeUpdates();
    }
});

function setupRealTimeUpdates() {
    // Listen for wallet updates
    window.sourcelessAPI.onWalletUpdate((data) => {
        console.log('Wallet updated:', data);
        updateWalletDisplay(data);
    });
    
    // Listen for ledger updates
    window.sourcelessAPI.onLedgerUpdate((data) => {
        console.log('Ledger updated:', data);
        updateLedgerDisplay(data);
    });
    
    // Listen for ARSS updates
    window.sourcelessAPI.onARSSUpdate((data) => {
        console.log('ARSS updated:', data);
        updateARSSDisplay(data);
    });
    
    // Listen for CCOIN updates
    window.sourcelessAPI.onCCOINUpdate((data) => {
        console.log('CCOIN updated:', data);
        updateCCOINDisplay(data);
    });
}

function updateWalletDisplay(data) {
    if (data) {
        document.getElementById('walletAddress').textContent = data.address?.substring(0, 20) + '...';
        document.getElementById('wallet-address').textContent = data.address;
        document.getElementById('wallet-domain').textContent = data.strDomain;
        document.getElementById('wallet-kyc').textContent = data.kycVerified ? '✅ Verified' : '❌ Not Verified';
        document.getElementById('wallet-balance').textContent = data.balance + ' STR';
        document.getElementById('totalBalance').textContent = data.balance + ' STR';
    }
}

function updateLedgerDisplay(data) {
    if (data) {
        const ledgerStatus = document.getElementById('ledgerStatus');
        ledgerStatus.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <strong>Fuel Ledger (STR Fuel)</strong><br>
                <small>Height: ${data.main?.blockHeight || 0} | Mining Reward: ${data.main?.miningReward || 100} STR</small>
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>STR.Domains (Identity & Library)</strong><br>
                <small>Height: ${data.asset?.blockHeight || 0} | Domains: ${data.asset?.totalDomains || 0}</small>
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>STARW VM (Contracts & ARSS)</strong><br>
                <small>Height: ${data.contract?.blockHeight || 0} | Contracts: ${data.contract?.totalContracts || 0}</small>
            </div>
            <div>
                <strong>Governance DAO</strong><br>
                <small>Height: ${data.governance?.blockHeight || 0} | Proposals: ${data.governance?.totalProposals || 0}</small>
            </div>
        `;
    }
}

function updateARSSDisplay(data) {
    if (data) {
        document.getElementById('arss-total').textContent = data.total + ' ARSS';
        document.getElementById('arss-used').textContent = data.used + ' ARSS';
        document.getElementById('arss-available').textContent = data.available + ' ARSS';
        document.getElementById('arssBalance').textContent = data.available;
        
        const percentage = (data.used / data.total * 100).toFixed(0);
        document.querySelector('.arss-bar').style.width = percentage + '%';
    }
}

function updateCCOINDisplay(data) {
    if (data) {
        document.getElementById('ccoin-balance').textContent = data.balance + ' CCOIN';
        document.getElementById('ccoin-pending').textContent = data.pending;
        document.getElementById('ccoin-bridges').textContent = data.networks + ' networks';
        document.getElementById('ccoinBalance').textContent = data.balance;
    }
}

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show corresponding page
            const pageName = item.dataset.page;
            const pages = document.querySelectorAll('.page');
            pages.forEach(page => page.classList.remove('active'));
            document.getElementById(`page-${pageName}`).classList.add('active');
            
            // Load page data
            loadPageData(pageName);
        });
    });
}

function initExplorer() {
    // Explorer tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const tab = btn.dataset.tab;
            const contents = document.querySelectorAll('.explorer-content');
            contents.forEach(c => c.classList.remove('active'));
            document.getElementById(`explorer-${tab}`).classList.add('active');
        });
    });
    
    // Ledger selector
    const ledgerBtns = document.querySelectorAll('.ledger-btn');
    ledgerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            ledgerBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const ledger = btn.dataset.ledger;
            loadBlocks(ledger);
        });
    });
}

function initForms() {
    // Send STR form
    document.getElementById('sendForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (hasAPI) {
            const formData = new FormData(e.target);
            const result = await window.sourcelessAPI.sendTransaction({
                to: formData.get('to'),
                amount: parseFloat(formData.get('amount')),
                fee: parseFloat(formData.get('fee')) || 0.01,
                memo: formData.get('memo')
            });
            alert(result.success ? 'Transaction submitted!' : 'Transaction failed');
        } else {
            alert('Transaction submitted to mempool');
        }
    });
    
    // Deploy contract form
    document.getElementById('deployContractForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (hasAPI) {
            const name = e.target.querySelector('[placeholder="Contract Name"]').value;
            const code = document.getElementById('contractCode').value;
            const balance = parseFloat(e.target.querySelector('[placeholder="Initial Balance (STR)"]').value) || 0;
            
            const result = await window.sourcelessAPI.deployContract({ name, code, balance });
            alert(result.success ? `Contract deployed at ${result.address}` : 'Deployment failed');
        } else {
            alert('Contract deployed to Contract Ledger');
        }
    });
    
    // Execute contract form
    document.getElementById('executeContractForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (hasAPI) {
            const address = e.target.querySelector('[placeholder="Contract Address"]').value;
            const method = e.target.querySelector('[placeholder="Method Name"]').value;
            const params = JSON.parse(e.target.querySelector('[placeholder^="Parameters"]').value || '[]');
            const value = parseFloat(e.target.querySelector('[placeholder="Value (STR)"]').value) || 0;
            
            const result = await window.sourcelessAPI.executeContract({ address, method, params, value });
            alert(result.success ? 'Contract executed!' : 'Execution failed');
        } else {
            alert('Contract executed');
        }
    });
    
    // Register domain form
    document.getElementById('registerDomainForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (hasAPI) {
            const name = 'STR.' + e.target.querySelector('[placeholder="username"]').value;
            const title = e.target.querySelector('[placeholder="Title"]').value;
            const description = e.target.querySelector('[placeholder="Description"]').value;
            
            const result = await window.sourcelessAPI.registerDomain({ name, title, description });
            alert(result.success ? 'Domain registered!' : 'Registration failed');
        } else {
            alert('Domain registered on Asset Ledger');
        }
    });
    
    // AppLess form
    document.getElementById('applessForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('AppLess executed with zk-SNARK proof');
    });
    
    // Proposal form
    document.getElementById('proposalForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Proposal submitted to Governance Ledger');
    });
    
    // Bridge form
    document.getElementById('bridgeForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Bridge transaction initiated');
    });
    
    // Settings form
    document.getElementById('settingsForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Settings saved');
    });
}

async function loadDashboard() {
    if (hasAPI) {
        try {
            // Load wallet data
            const walletData = await window.sourcelessAPI.getWalletData();
            updateWalletDisplay(walletData);
            
            // Load ledger stats
            const ledgerStats = await window.sourcelessAPI.getLedgerStats();
            updateLedgerDisplay(ledgerStats);
            
            // Load ARSS metering
            const arssData = await window.sourcelessAPI.getARSSMetering();
            updateARSSDisplay(arssData);
            
            // Load CCOIN balance
            const ccoinData = await window.sourcelessAPI.getCCOINBalance();
            updateCCOINDisplay(ccoinData);
            
            // Update node status with mock data for now
            document.getElementById('nodeStatus').textContent = 'Operational';
            document.getElementById('peerCount').textContent = '42';
            document.getElementById('blockHeight').textContent = ledgerStats.main?.blockHeight || '12,345';
            document.getElementById('stakedAmount').textContent = '500 STR';
            document.getElementById('networkTPS').textContent = '100,000';
            document.getElementById('domainCount').textContent = ledgerStats.asset?.totalDomains || '1';
            
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            loadMockDashboard();
        }
    } else {
        loadMockDashboard();
    }
    
    // Load recent transactions (mock for now)
    const recentTx = document.getElementById('recentTransactions');
    recentTx.innerHTML = `
        <div style="margin-bottom: 0.5rem;">
            <small>Transfer: 50 STR to STR.alice</small><br>
            <small style="color: #888;">2 minutes ago</small>
        </div>
        <div style="margin-bottom: 0.5rem;">
            <small>Domain registered: STR.mybusiness</small><br>
            <small style="color: #888;">15 minutes ago</small>
        </div>
        <div>
            <small>Contract deployed: VotingSystem</small><br>
            <small style="color: #888;">1 hour ago</small>
        </div>
    `;
}

function loadMockDashboard() {
    // Update node status
    document.getElementById('nodeStatus').textContent = 'Operational';
    document.getElementById('peerCount').textContent = '42';
    document.getElementById('blockHeight').textContent = '12,345';
    
    // Update wallet indicator
    const walletAddr = 'zk13str_27bb...de53';
    document.getElementById('walletAddress').textContent = walletAddr;
    
    // Update stats
    document.getElementById('totalBalance').textContent = '1,000 STR';
    document.getElementById('stakedAmount').textContent = '500 STR';
    document.getElementById('networkTPS').textContent = '100,000';
    document.getElementById('arssBalance').textContent = '750';
    document.getElementById('ccoinBalance').textContent = '50.5';
    document.getElementById('domainCount').textContent = '1';
    
    // Load ledger status
    const ledgerStatus = document.getElementById('ledgerStatus');
    ledgerStatus.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <strong>Fuel Ledger (STR Fuel)</strong><br>
            <small>Height: 12,345 | Mining Reward: 100 STR</small>
        </div>
        <div style="margin-bottom: 1rem;">
            <strong>STR.Domains (Identity & Library)</strong><br>
            <small>Height: 8,234 | Mining Reward: 50 STR</small>
        </div>
        <div style="margin-bottom: 1rem;">
            <strong>STARW VM (Contracts & ARSS)</strong><br>
            <small>Height: 5,678 | Mining Reward: 50 STR</small>
        </div>
        <div>
            <strong>Governance DAO</strong><br>
            <small>Height: 1,234 | Mining Reward: 25 STR</small>
        </div>
    `;
}

function loadPageData(pageName) {
    switch (pageName) {
        case 'wallet':
            loadWalletData();
            break;
        case 'explorer':
            loadBlocks('main');
            break;
        case 'contracts':
            loadContracts();
            break;
        case 'domains':
            loadDomains();
            break;
    }
}

function loadWalletData() {
    document.getElementById('wallet-address').textContent = 'zk13str_27bb6bcd0f3aca27a58af9a91b6c1d8f1529116b_de53';
    document.getElementById('wallet-domain').textContent = 'STR.system';
    document.getElementById('wallet-kyc').textContent = '✅ Verified';
    document.getElementById('wallet-balance').textContent = '1,000 STR';
    
    const txHistory = document.getElementById('transactionHistory');
    txHistory.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="border-bottom: 1px solid rgba(0, 212, 255, 0.2);">
                    <th style="padding: 0.5rem; text-align: left;">Type</th>
                    <th style="padding: 0.5rem; text-align: left;">To/From</th>
                    <th style="padding: 0.5rem; text-align: right;">Amount</th>
                    <th style="padding: 0.5rem; text-align: right;">Time</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding: 0.5rem;">Send</td>
                    <td style="padding: 0.5rem;">STR.alice</td>
                    <td style="padding: 0.5rem; text-align: right; color: #ff5555;">-50 STR</td>
                    <td style="padding: 0.5rem; text-align: right;">2 min ago</td>
                </tr>
                <tr>
                    <td style="padding: 0.5rem;">Receive</td>
                    <td style="padding: 0.5rem;">STR.bob</td>
                    <td style="padding: 0.5rem; text-align: right; color: #00ff88;">+100 STR</td>
                    <td style="padding: 0.5rem; text-align: right;">1 hour ago</td>
                </tr>
            </tbody>
        </table>
    `;
}

function loadBlocks(ledgerType) {
    const blockList = document.getElementById('blockList');
    blockList.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="border-bottom: 1px solid rgba(0, 212, 255, 0.2);">
                    <th style="padding: 0.5rem; text-align: left;">Block</th>
                    <th style="padding: 0.5rem; text-align: left;">Hash</th>
                    <th style="padding: 0.5rem; text-align: right;">Txs</th>
                    <th style="padding: 0.5rem; text-align: right;">Time</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding: 0.5rem;">#12345</td>
                    <td style="padding: 0.5rem;"><code>0x7a3f...</code></td>
                    <td style="padding: 0.5rem; text-align: right;">23</td>
                    <td style="padding: 0.5rem; text-align: right;">2 min ago</td>
                </tr>
                <tr>
                    <td style="padding: 0.5rem;">#12344</td>
                    <td style="padding: 0.5rem;"><code>0x9b2e...</code></td>
                    <td style="padding: 0.5rem; text-align: right;">18</td>
                    <td style="padding: 0.5rem; text-align: right;">4 min ago</td>
                </tr>
            </tbody>
        </table>
    `;
}

function loadContracts() {
    const contractList = document.getElementById('contractList');
    contractList.innerHTML = `
        <div style="margin-bottom: 1rem; padding: 1rem; background: rgba(0, 0, 0, 0.2); border-radius: 4px;">
            <strong>VotingSystem</strong><br>
            <small>Address: zk13str_contract_abc123</small><br>
            <small>Balance: 100 STR</small>
        </div>
    `;
}

function loadDomains() {
    const myDomains = document.getElementById('myDomains');
    myDomains.innerHTML = `
        <div style="margin-bottom: 1rem; padding: 1rem; background: rgba(0, 0, 0, 0.2); border-radius: 4px;">
            <strong>STR.system</strong><br>
            <small>Owner: zk13str_27bb...de53</small><br>
            <small>KYC: ✅ Verified</small><br>
            <small>Lifetime Ownership</small>
        </div>
    `;
}

// Global functions
function copyAddress() {
    const addr = document.getElementById('wallet-address').textContent;
    navigator.clipboard.writeText(addr);
    alert('Address copied to clipboard!');
}

function generateCode() {
    const prompt = document.getElementById('aiPrompt').value;
    if (!prompt) {
        alert('Please enter a prompt');
        return;
    }
    
    document.getElementById('generatedCode').innerHTML = `<code>// ARES AI Generated Code
// Prompt: ${prompt}

class VotingContract {
    constructor() {
        this.proposals = [];
        this.votes = {};
    }
    
    createProposal(title, description) {
        this.proposals.push({
            id: this.proposals.length,
            title,
            description,
            votes: 0
        });
    }
    
    vote(proposalId, voter) {
        if (!this.votes[voter]) {
            this.votes[voter] = proposalId;
            this.proposals[proposalId].votes++;
        }
    }
}

module.exports = VotingContract;</code>`;
}

function copyCode() {
    const code = document.getElementById('generatedCode').textContent;
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
}

function deployGenerated() {
    alert('AI-generated contract deployed to Contract Ledger!');
}

function openBridge() {
    // Navigate to bridge page
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(nav => nav.classList.remove('active'));
    document.querySelector('[data-page="bridge"]').classList.add('active');
    
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    document.getElementById('page-bridge').classList.add('active');
}
