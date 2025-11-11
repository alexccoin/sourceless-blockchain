// Token Operations JavaScript
// Add these functions to renderer.js

// ============== wSTR (Wrapped STR) Operations ==============

async function initWSTRPanel() {
    // Load wSTR balance
    const balance = await window.sourcelessAPI.invoke('wstr:balance');
    updateWSTRDisplay(balance);
    
    // Wrap STR form
    document.getElementById('wrapSTRForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const strAmount = parseFloat(document.getElementById('wrapSTRAmount').value);
        const domainIdsInput = document.getElementById('wrapDomainIds').value;
        const domainIds = domainIdsInput ? domainIdsInput.split(',').map(id => id.trim()) : [];
        
        try {
            const result = await window.sourcelessAPI.invoke('wstr:wrap', { strAmount, domainIds });
            if (result.success) {
                alert(`✅ ${result.message}\nwSTR Amount: ${result.wstrAmount}\nTotal Value: $${result.wstrValue}`);
                updateWSTRDisplay(await window.sourcelessAPI.invoke('wstr:balance'));
            } else {
                alert(`❌ Error: ${result.error}`);
            }
        } catch (err) {
            alert(`❌ Error: ${err.message}`);
        }
    });
    
    // Unwrap wSTR form
    document.getElementById('unwrapSTRForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const wstrAmount = parseFloat(document.getElementById('unwrapSTRAmount').value);
        
        try {
            const result = await window.sourcelessAPI.invoke('wstr:unwrap', { wstrAmount });
            if (result.success) {
                alert(`✅ ${result.message}\nSTR Returned: ${result.strAmount}`);
                updateWSTRDisplay(await window.sourcelessAPI.invoke('wstr:balance'));
            } else {
                alert(`❌ Error: ${result.error}`);
            }
        } catch (err) {
            alert(`❌ Error: ${err.message}`);
        }
    });
}

function updateWSTRDisplay(data) {
    document.getElementById('wstr-balance').textContent = `${data.balance} wSTR`;
    document.getElementById('wstr-value').textContent = `$${data.value.toFixed(2)}`;
    document.getElementById('wstr-domains').textContent = String(data.domainCount);
    document.getElementById('overview-wstr').textContent = `${data.balance} wSTR`;
}

// ============== eSTR (Energy Sourceless) Operations ==============

async function initESTRPanel() {
    // Load eSTR balance
    const balance = await window.sourcelessAPI.invoke('estr:balance');
    updateESTRDisplay(balance);
    
    // Mine eSTR form
    document.getElementById('mineESTRForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('mineESTRAmount').value);
        const energyType = document.getElementById('energyType').value;
        
        try {
            const result = await window.sourcelessAPI.invoke('estr:mint', { amount, energyType });
            if (result.success) {
                const bonusText = result.bonus > 0 ? ` (includes ${(result.bonus * 100).toFixed(0)}% ${energyType} bonus)` : '';
                alert(`✅ ${result.message}\nMinted: ${result.amount} eSTR${bonusText}`);
                updateESTRDisplay(await window.sourcelessAPI.invoke('estr:balance'));
            } else {
                alert(`❌ Error: ${result.error}`);
            }
        } catch (err) {
            alert(`❌ Error: ${err.message}`);
        }
    });
    
    // Spend eSTR form
    document.getElementById('spendESTRForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('spendESTRAmount').value);
        const operation = document.getElementById('operationType').value;
        
        try {
            const result = await window.sourcelessAPI.invoke('estr:spend', { amount, operation });
            if (result.success) {
                alert(`✅ ${result.message}\nRemaining Balance: ${result.remainingBalance} eSTR`);
                updateESTRDisplay(await window.sourcelessAPI.invoke('estr:balance'));
            } else {
                alert(`❌ Error: ${result.error}`);
            }
        } catch (err) {
            alert(`❌ Error: ${err.message}`);
        }
    });
}

function updateESTRDisplay(data) {
    document.getElementById('estr-balance').textContent = `${data.balance} eSTR`;
    document.getElementById('estr-energy').textContent = `${data.energyUnits} kWh`;
    document.getElementById('estr-credits').textContent = String(data.computeCredits);
    document.getElementById('overview-estr').textContent = `${data.balance} eSTR`;
}

// ============== $TR (Dollar Sourceless) Operations ==============

async function initTRPanel() {
    // Load $TR balance
    const balance = await window.sourcelessAPI.invoke('tr:balance');
    updateTRDisplay(balance);
    
    // Mint $TR form
    document.getElementById('mintTRForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const collateralType = document.getElementById('collateralType').value;
        const collateralAmount = parseFloat(document.getElementById('collateralAmount').value);
        const trAmount = parseFloat(document.getElementById('mintTRAmount').value);
        
        try {
            const result = await window.sourcelessAPI.invoke('tr:mint', { 
                collateralType, 
                collateralAmount, 
                trAmount 
            });
            if (result.success) {
                alert(`✅ ${result.message}\nCollateralization Ratio: ${result.collateralizationRatio.toFixed(2)}%`);
                updateTRDisplay(await window.sourcelessAPI.invoke('tr:balance'));
            } else {
                alert(`❌ Error: ${result.error}`);
            }
        } catch (err) {
            alert(`❌ Error: ${err.message}`);
        }
    });
    
    // Redeem $TR form
    document.getElementById('redeemTRForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const trAmount = parseFloat(document.getElementById('redeemTRAmount').value);
        
        try {
            const result = await window.sourcelessAPI.invoke('tr:redeem', { trAmount });
            if (result.success) {
                alert(`✅ ${result.message}\nCollateral Returned: ${result.collateralReturned}`);
                updateTRDisplay(await window.sourcelessAPI.invoke('tr:balance'));
            } else {
                alert(`❌ Error: ${result.error}`);
            }
        } catch (err) {
            alert(`❌ Error: ${err.message}`);
        }
    });
    
    // Transfer $TR form
    document.getElementById('transferTRForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const to = document.getElementById('trRecipient').value;
        const amount = parseFloat(document.getElementById('transferTRAmount').value);
        
        try {
            const result = await window.sourcelessAPI.invoke('tr:transfer', { to, amount });
            if (result.success) {
                alert(`✅ ${result.message}\nTx ID: ${result.txId}`);
                updateTRDisplay(await window.sourcelessAPI.invoke('tr:balance'));
            } else {
                alert(`❌ Error: ${result.error}`);
            }
        } catch (err) {
            alert(`❌ Error: ${err.message}`);
        }
    });
}

function updateTRDisplay(data) {
    document.getElementById('tr-balance').textContent = `${data.balance} $TR`;
    document.getElementById('tr-usd').textContent = `$${data.usdValue.toFixed(2)} USD`;
    document.getElementById('tr-collateral').textContent = `${data.collateralizationRatio.toFixed(2)}%`;
    document.getElementById('overview-tr').textContent = `${data.balance} $TR`;
}

// ============== Genesis Blockchain Info ==============

async function initGenesisPanel() {
    try {
        const genesisInfo = await window.sourcelessAPI.invoke('genesis:info');
        if (genesisInfo) {
            const infoDiv = document.getElementById('genesisInfo');
            if (infoDiv) {
                infoDiv.innerHTML = `
                    <div class="info-item">
                        <strong>${genesisInfo.networkName}</strong>
                        <small>Network Name</small>
                    </div>
                    <div class="info-item">
                        <strong>Chain #${genesisInfo.chainId}</strong>
                        <small>Chain ID</small>
                    </div>
                    <div class="info-item">
                        <strong>${new Date(genesisInfo.timestamp).toLocaleDateString()}</strong>
                        <small>Genesis Date</small>
                    </div>
                    <div class="info-item">
                        <strong>${genesisInfo.distribution.market}% / ${genesisInfo.distribution.treasury}%</strong>
                        <small>Market / Treasury</small>
                    </div>
                `;
            }
            
            // Populate token supply table
            const supplyTable = document.getElementById('genesisSupplyTable');
            if (supplyTable) {
                const tokens = [
                    { name: 'STR (Sourceless)', supply: genesisInfo.initialSupply.STR, format: 'B' },
                    { name: 'CCOS (CCOIN Network)', supply: genesisInfo.initialSupply.CCOS, format: 'M' },
                    { name: 'ARSS (Asset Shares)', supply: genesisInfo.initialSupply.ARSS, format: '' },
                    { name: 'wSTR (Wrapped STR)', supply: genesisInfo.initialSupply.wSTR, format: '' },
                    { name: 'eSTR (Energy Sourceless)', supply: genesisInfo.initialSupply.eSTR, format: '' },
                    { name: '$TR (Dollar Sourceless)', supply: genesisInfo.initialSupply.$TR, format: '' }
                ];
                
                supplyTable.innerHTML = tokens.map(token => {
                    const supply = token.supply;
                    const divisor = token.format === 'B' ? 1e9 : token.format === 'M' ? 1e6 : 1;
                    const displaySupply = supply / divisor;
                    const market = (supply * genesisInfo.distribution.market / 100) / divisor;
                    const treasury = (supply * genesisInfo.distribution.treasury / 100) / divisor;
                    
                    return `
                        <tr style="border-bottom: 1px solid rgba(0, 212, 255, 0.1);">
                            <td style="padding: 0.5rem;">${token.name}</td>
                            <td style="text-align: right; padding: 0.5rem;">${displaySupply.toLocaleString()} ${token.format}</td>
                            <td style="text-align: right; padding: 0.5rem; color: #00ff88;">${market.toLocaleString()} ${token.format}</td>
                            <td style="text-align: right; padding: 0.5rem; color: #00d4ff;">${treasury.toLocaleString()} ${token.format}</td>
                        </tr>
                    `;
                }).join('');
            }
        }
    } catch (err) {
        console.error('Failed to load genesis info:', err);
    }
}

// ============== Token Overview Updates ==============

function updateTokenOverview(walletData) {
    if (walletData && walletData.balances) {
        document.getElementById('overview-str').textContent = `${walletData.balances.STR || 0} STR`;
        document.getElementById('overview-ccos').textContent = `${walletData.balances.CCOS || 0} CCOS`;
        document.getElementById('overview-arss').textContent = `${walletData.balances.ARSS || 0} ARSS`;
        // wSTR, eSTR, $TR updated by their respective panels
    }
}

// ============== Initialize All Token Panels ==============

function initAllTokenPanels() {
    initWSTRPanel();
    initESTRPanel();
    initTRPanel();
    initGenesisPanel();
}

// Add to DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    // ... existing init code ...
    
    // Initialize new token panels
    if (hasAPI) {
        initAllTokenPanels();
    }
});
