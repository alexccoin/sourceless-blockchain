/**
 * Validator Node for Sourceless Mini-Node Client
 * Handles staking, validation, and reward claiming
 */

class ValidatorNode {
    constructor(config) {
        this.config = config;
        this.active = false;
        this.stats = {
            stakedAmount: 0,
            lockPeriod: 0,
            lockEndsAt: 0,
            totalRewards: 0,
            blocksValidated: 0,
            uptime: 0,
            startTime: null
        };
        
        this.minStake = 1000; // STR
        this.lockPeriods = [7, 30, 90]; // days
        this.apyRates = [5, 10, 15]; // percentage
        
        this.initializeValidatorUI();
    }
    
    initializeValidatorUI() {
        // Start validator button
        document.getElementById('start-validator-btn')?.addEventListener('click', () => this.startValidator());
        
        // Stop validator button
        document.getElementById('stop-validator-btn')?.addEventListener('click', () => this.stopValidator());
        
        // Claim rewards button
        document.getElementById('claim-rewards-btn')?.addEventListener('click', () => this.claimRewards());
        
        // Unstake button
        document.getElementById('unstake-btn')?.addEventListener('click', () => this.unstake());
        
        // Load validator status
        this.loadValidatorStatus();
    }
    
    async startValidator() {
        const stakeAmount = parseFloat(document.getElementById('stake-amount').value);
        const lockPeriod = parseInt(document.getElementById('lock-period').value);
        
        if (stakeAmount < this.minStake) {
            alert(`Minimum stake is ${this.minStake} STR`);
            return;
        }
        
        if (!this.lockPeriods.includes(lockPeriod)) {
            alert('Invalid lock period');
            return;
        }
        
        try {
            // Check wallet balance
            const wallet = window.sourcelessClient?.wallet;
            if (!wallet || !wallet.wallet) {
                alert('Please create or import a wallet first');
                return;
            }
            
            // Request staking
            const response = await fetch(`${this.config.networkEndpoint}/api/validator:stake`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address: wallet.wallet.address,
                    amount: stakeAmount,
                    lockPeriod: lockPeriod
                })
            });
            
            if (response.ok) {
                this.active = true;
                this.stats.stakedAmount = stakeAmount;
                this.stats.lockPeriod = lockPeriod;
                this.stats.lockEndsAt = Date.now() + (lockPeriod * 24 * 60 * 60 * 1000);
                this.stats.startTime = Date.now();
                this.stats.blocksValidated = 0;
                this.stats.totalRewards = 0;
                
                this.saveValidatorStatus();
                this.updateValidatorUI();
                this.startValidationLoop();
                
                window.sourcelessClient?.showNotification('Validator started successfully!', 'success');
            } else {
                throw new Error('Failed to start validator');
            }
            
        } catch (error) {
            console.error('Validator start error:', error);
            window.sourcelessClient?.showNotification('Failed to start validator: ' + error.message, 'error');
        }
    }
    
    stopValidator() {
        if (!this.active) {
            alert('Validator is not running');
            return;
        }
        
        if (confirm('Are you sure you want to stop the validator? Your stake will remain locked.')) {
            this.active = false;
            this.saveValidatorStatus();
            this.updateValidatorUI();
            window.sourcelessClient?.showNotification('Validator stopped', 'info');
        }
    }
    
    async unstake() {
        if (!this.stats.stakedAmount) {
            alert('No stake to withdraw');
            return;
        }
        
        if (Date.now() < this.stats.lockEndsAt) {
            const remainingDays = Math.ceil((this.stats.lockEndsAt - Date.now()) / (24 * 60 * 60 * 1000));
            alert(`Cannot unstake yet. ${remainingDays} days remaining in lock period.`);
            return;
        }
        
        if (confirm('Unstake all tokens and stop validator?')) {
            try {
                const response = await fetch(`${this.config.networkEndpoint}/api/validator:unstake`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        address: window.sourcelessClient?.wallet?.wallet?.address
                    })
                });
                
                if (response.ok) {
                    this.active = false;
                    this.stats.stakedAmount = 0;
                    this.stats.lockPeriod = 0;
                    this.stats.lockEndsAt = 0;
                    
                    this.saveValidatorStatus();
                    this.updateValidatorUI();
                    
                    window.sourcelessClient?.showNotification('Unstaked successfully!', 'success');
                }
            } catch (error) {
                console.error('Unstake error:', error);
                window.sourcelessClient?.showNotification('Unstake failed: ' + error.message, 'error');
            }
        }
    }
    
    async claimRewards() {
        if (this.stats.totalRewards <= 0) {
            alert('No rewards to claim');
            return;
        }
        
        try {
            const response = await fetch(`${this.config.networkEndpoint}/api/validator:claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address: window.sourcelessClient?.wallet?.wallet?.address
                })
            });
            
            if (response.ok) {
                const claimed = this.stats.totalRewards;
                this.stats.totalRewards = 0;
                this.saveValidatorStatus();
                this.updateValidatorUI();
                
                window.sourcelessClient?.showNotification(`Claimed ${claimed.toFixed(2)} CCOS!`, 'success');
            }
        } catch (error) {
            console.error('Claim error:', error);
            window.sourcelessClient?.showNotification('Claim failed: ' + error.message, 'error');
        }
    }
    
    startValidationLoop() {
        if (!this.active) return;
        
        // Validate blocks periodically
        setInterval(() => {
            if (this.active) {
                this.validateNextBlock();
            }
        }, 30000); // Every 30 seconds
        
        // Update uptime
        setInterval(() => {
            if (this.active && this.stats.startTime) {
                this.stats.uptime = Date.now() - this.stats.startTime;
                this.updateValidatorUI();
            }
        }, 1000);
    }
    
    async validateNextBlock() {
        try {
            // Simulate block validation
            const success = Math.random() > 0.05; // 95% success rate
            
            if (success) {
                this.stats.blocksValidated++;
                
                // Calculate reward (0.1-1 CCOS per block)
                const reward = Math.random() * 0.9 + 0.1;
                this.stats.totalRewards += reward;
                
                // Add validation log entry
                this.addValidationLog('Block validated successfully', reward);
                
                this.saveValidatorStatus();
                this.updateValidatorUI();
            } else {
                this.addValidationLog('Block validation failed', 0);
            }
            
        } catch (error) {
            console.error('Validation error:', error);
            this.addValidationLog('Validation error: ' + error.message, 0);
        }
    }
    
    addValidationLog(message, reward = null) {
        const logContainer = document.getElementById('validation-log');
        if (!logContainer) return;
        
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = `
            <span class="log-time">${new Date().toLocaleTimeString()}</span>
            <span class="log-message">${message}</span>
            ${reward ? `<span class="log-reward">+${reward.toFixed(4)} CCOS</span>` : ''}
        `;
        
        logContainer.insertBefore(logEntry, logContainer.firstChild);
        
        // Keep only last 20 entries
        while (logContainer.children.length > 20) {
            logContainer.removeChild(logContainer.lastChild);
        }
    }
    
    updateValidatorUI() {
        // Update stats
        document.getElementById('validator-staked').textContent = this.stats.stakedAmount.toFixed(2) + ' STR';
        document.getElementById('validator-rewards').textContent = this.stats.totalRewards.toFixed(4) + ' CCOS';
        document.getElementById('validator-blocks').textContent = this.stats.blocksValidated.toString();
        document.getElementById('validator-uptime').textContent = this.formatUptime(this.stats.uptime);
        
        // Update APY display
        const apyIndex = this.lockPeriods.indexOf(this.stats.lockPeriod);
        if (apyIndex !== -1) {
            document.getElementById('current-apy').textContent = this.apyRates[apyIndex] + '%';
        }
        
        // Update lock period
        if (this.stats.lockEndsAt > Date.now()) {
            const remainingDays = Math.ceil((this.stats.lockEndsAt - Date.now()) / (24 * 60 * 60 * 1000));
            document.getElementById('lock-remaining').textContent = `${remainingDays} days remaining`;
        } else if (this.stats.stakedAmount > 0) {
            document.getElementById('lock-remaining').textContent = 'Lock period ended';
        }
        
        // Update controls
        const stakeForm = document.getElementById('stake-form');
        const validatorControls = document.getElementById('validator-controls');
        const validatorStats = document.getElementById('validator-stats');
        
        if (this.active || this.stats.stakedAmount > 0) {
            if (stakeForm) stakeForm.style.display = 'none';
            if (validatorControls) validatorControls.style.display = 'block';
            if (validatorStats) validatorStats.style.display = 'grid';
        } else {
            if (stakeForm) stakeForm.style.display = 'block';
            if (validatorControls) validatorControls.style.display = 'none';
            if (validatorStats) validatorStats.style.display = 'none';
        }
        
        // Update button states
        const stopBtn = document.getElementById('stop-validator-btn');
        const claimBtn = document.getElementById('claim-rewards-btn');
        const unstakeBtn = document.getElementById('unstake-btn');
        
        if (stopBtn) stopBtn.disabled = !this.active;
        if (claimBtn) claimBtn.disabled = this.stats.totalRewards <= 0;
        if (unstakeBtn) unstakeBtn.disabled = Date.now() < this.stats.lockEndsAt;
    }
    
    async fetchValidatorStats() {
        try {
            const wallet = window.sourcelessClient?.wallet;
            if (!wallet || !wallet.wallet) return;
            
            const response = await fetch(`${this.config.networkEndpoint}/api/validator:stats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address: wallet.wallet.address
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.stats) {
                    this.stats = { ...this.stats, ...data.stats };
                    this.updateValidatorUI();
                }
            }
        } catch (error) {
            console.error('Stats fetch error:', error);
        }
    }
    
    calculateAPY() {
        const index = this.lockPeriods.indexOf(this.stats.lockPeriod);
        return index !== -1 ? this.apyRates[index] : 0;
    }
    
    formatUptime(ms) {
        if (!ms) return '0s';
        
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    }
    
    saveValidatorStatus() {
        try {
            localStorage.setItem('sourceless-validator', JSON.stringify({
                active: this.active,
                stats: this.stats
            }));
        } catch (error) {
            console.error('Validator save error:', error);
        }
    }
    
    loadValidatorStatus() {
        try {
            const data = localStorage.getItem('sourceless-validator');
            if (data) {
                const parsed = JSON.parse(data);
                this.active = parsed.active || false;
                this.stats = { ...this.stats, ...parsed.stats };
                this.updateValidatorUI();
                
                if (this.active) {
                    this.startValidationLoop();
                }
            }
        } catch (error) {
            console.error('Validator load error:', error);
        }
    }
}
