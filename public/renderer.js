// Sourceless Blockchain v0.13 - STARW Personal Node Client
console.log('🔷 Sourceless Client Loaded');

// Navigation
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initExplorer();
    initForms();
    loadDashboard();
});

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
    document.getElementById('sendForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Transaction submitted to mempool');
    });
    
    // Deploy contract form
    document.getElementById('deployContractForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Contract deployed to Contract Ledger');
    });
    
    // Execute contract form
    document.getElementById('executeContractForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Contract executed');
    });
    
    // Register domain form
    document.getElementById('registerDomainForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Domain registered on Asset Ledger');
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
    
    // Load recent transactions
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
