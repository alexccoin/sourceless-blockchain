// GENESIS NODES MANAGER - 1313 STARW Mini Validation Nodes
// Creates and manages the initial network of 1313 validation nodes with special domains

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const STARWMiniValidationNode = require('../src/main/starw/STARWMiniValidationNode');

class GenesisNodeManager {
    constructor(database) {
        this.database = database;
        this.nodes = new Map(); // nodeId → node instance
        this.specialDomains = new Map(); // domain → node data
        this.nodeRegistry = []; // All 1313 nodes metadata
        this.totalNodes = 1313;
        this.activeNodes = 0;
        
        // Token allocation logic
        this.tokenConfig = {
            STR: { total: 63_000_000_000, symbol: 'STR' },      // 63 Billion STR
            CCOS: { total: 63_000_000, symbol: 'CCOS' },        // 63 Million CCOS
            WSTR: { total: 10_000_000_000, symbol: 'WSTR' },    // 10 Billion WSTR (Wrapped STR)
            ARSS: { total: 5_000_000_000, symbol: 'ARSS' },     // 5 Billion ARSS (Ares Token)
            ESTR: { total: 1_000_000_000, symbol: 'ESTR' }      // 1 Billion ESTR (Escrowed STR)
        };
        
        // Special domains with abbreviations - First nodes are the most important
        this.specialDomainsConfig = [
            { domain: 'STR.TREASURY', abbr: 'TRS', role: 'treasury', power: 100, 
              tokens: { 
                STR: 20_000_000_000,    // 20B STR (31.7% of total)
                CCOS: 20_000_000,       // 20M CCOS (31.7% of total)
                WSTR: 3_000_000_000,    // 3B WSTR (30% of total)
                ARSS: 1_500_000_000,    // 1.5B ARSS (30% of total)
                ESTR: 500_000_000       // 500M ESTR (50% of total)
              }
            },
            { domain: 'STR.SOURCELESS', abbr: 'SRC', role: 'genesis', power: 100,
              tokens: {
                STR: 10_000_000_000,    // 10B STR
                CCOS: 10_000_000,       // 10M CCOS
                WSTR: 2_000_000_000,    // 2B WSTR
                ARSS: 1_000_000_000,    // 1B ARSS
                ESTR: 200_000_000       // 200M ESTR
              }
            },
            { domain: 'STR.ALEX', abbr: 'ALX', role: 'founder', power: 100,
              tokens: {
                STR: 5_000_000_000,     // 5B STR
                CCOS: 5_000_000,        // 5M CCOS
                WSTR: 1_000_000_000,    // 1B WSTR
                ARSS: 500_000_000,      // 500M ARSS
                ESTR: 100_000_000       // 100M ESTR
              }
            },
            { domain: 'STR.OBI', abbr: 'OBI', role: 'master', power: 95,
              tokens: { STR: 1_000_000_000, CCOS: 1_000_000, WSTR: 200_000_000, ARSS: 100_000_000, ESTR: 50_000_000 }
            },
            { domain: 'STR.GROK', abbr: 'GRK', role: 'oracle', power: 95,
              tokens: { STR: 1_000_000_000, CCOS: 1_000_000, WSTR: 200_000_000, ARSS: 100_000_000, ESTR: 50_000_000 }
            },
            { domain: 'STR.STAR', abbr: 'STR', role: 'core', power: 90,
              tokens: { STR: 800_000_000, CCOS: 800_000, WSTR: 150_000_000, ARSS: 80_000_000, ESTR: 30_000_000 }
            },
            { domain: 'STR.DARTH', abbr: 'DTH', role: 'enforcer', power: 90,
              tokens: { STR: 800_000_000, CCOS: 800_000, WSTR: 150_000_000, ARSS: 80_000_000, ESTR: 30_000_000 }
            },
            { domain: 'STR.STARWARS', abbr: 'SWS', role: 'guardian', power: 85,
              tokens: { STR: 500_000_000, CCOS: 500_000, WSTR: 100_000_000, ARSS: 50_000_000, ESTR: 20_000_000 }
            },
            { domain: 'STR.YODA', abbr: 'YDA', role: 'sage', power: 85,
              tokens: { STR: 500_000_000, CCOS: 500_000, WSTR: 100_000_000, ARSS: 50_000_000, ESTR: 20_000_000 }
            },
            { domain: 'STR.LUKE', abbr: 'LKE', role: 'knight', power: 80,
              tokens: { STR: 300_000_000, CCOS: 300_000, WSTR: 60_000_000, ARSS: 30_000_000, ESTR: 10_000_000 }
            },
            { domain: 'STR.LEIA', abbr: 'LEI', role: 'diplomat', power: 80,
              tokens: { STR: 300_000_000, CCOS: 300_000, WSTR: 60_000_000, ARSS: 30_000_000, ESTR: 10_000_000 }
            },
            { domain: 'STR.HAN', abbr: 'HAN', role: 'pilot', power: 75,
              tokens: { STR: 200_000_000, CCOS: 200_000, WSTR: 40_000_000, ARSS: 20_000_000, ESTR: 5_000_000 }
            },
            { domain: 'STR.CHEWIE', abbr: 'CHW', role: 'warrior', power: 75,
              tokens: { STR: 200_000_000, CCOS: 200_000, WSTR: 40_000_000, ARSS: 20_000_000, ESTR: 5_000_000 }
            },
            { domain: 'STR.R2D2', abbr: 'R2D', role: 'tech', power: 70,
              tokens: { STR: 100_000_000, CCOS: 100_000, WSTR: 20_000_000, ARSS: 10_000_000, ESTR: 2_000_000 }
            },
            { domain: 'STR.C3PO', abbr: 'C3P', role: 'protocol', power: 70,
              tokens: { STR: 100_000_000, CCOS: 100_000, WSTR: 20_000_000, ARSS: 10_000_000, ESTR: 2_000_000 }
            },
            { domain: 'STR.VADER', abbr: 'VDR', role: 'sentinel', power: 85,
              tokens: { STR: 500_000_000, CCOS: 500_000, WSTR: 100_000_000, ARSS: 50_000_000, ESTR: 20_000_000 }
            },
            { domain: 'STR.PALPATINE', abbr: 'PLP', role: 'overseer', power: 80,
              tokens: { STR: 300_000_000, CCOS: 300_000, WSTR: 60_000_000, ARSS: 30_000_000, ESTR: 10_000_000 }
            },
            { domain: 'STR.ANAKIN', abbr: 'ANK', role: 'protector', power: 75,
              tokens: { STR: 200_000_000, CCOS: 200_000, WSTR: 40_000_000, ARSS: 20_000_000, ESTR: 5_000_000 }
            },
            { domain: 'STR.PADME', abbr: 'PDM', role: 'mediator', power: 75,
              tokens: { STR: 200_000_000, CCOS: 200_000, WSTR: 40_000_000, ARSS: 20_000_000, ESTR: 5_000_000 }
            },
            { domain: 'STR.AHSOKA', abbr: 'AHK', role: 'guardian', power: 80,
              tokens: { STR: 300_000_000, CCOS: 300_000, WSTR: 60_000_000, ARSS: 30_000_000, ESTR: 10_000_000 }
            },
            { domain: 'STR.MANDO', abbr: 'MND', role: 'bounty', power: 75,
              tokens: { STR: 200_000_000, CCOS: 200_000, WSTR: 40_000_000, ARSS: 20_000_000, ESTR: 5_000_000 }
            }
        ];
        
        console.log('🌌 Genesis Node Manager Initialized');
        console.log(`   📊 Target: ${this.totalNodes} validation nodes`);
        console.log(`   ⭐ Special Domains: ${this.specialDomainsConfig.length}`);
    }

    /**
     * Generate ZK13STR wallet address
     */
    generateWalletAddress(seed) {
        const hash1 = crypto.createHash('sha256').update(seed).digest('hex');
        const hash2 = crypto.createHash('sha256').update(hash1 + Date.now()).digest('hex');
        const checksum = crypto.createHash('sha256').update(hash2).digest('hex').substring(0, 4);
        
        return `zk13str_${hash2.substring(0, 40)}_${checksum}`;
    }

    /**
     * Generate sequential node ID
     */
    generateNodeId(index) {
        return `genesis_node_${String(index).padStart(4, '0')}`;
    }

    /**
     * Create special domain nodes (STR.TREASURY, STR.SOURCELESS, STR.ALEX, etc.)
     */
    async createSpecialDomainNodes() {
        console.log('\n⭐ Creating Special Domain Nodes with Token Allocation...\n');
        
        for (let i = 0; i < this.specialDomainsConfig.length; i++) {
            const config = this.specialDomainsConfig[i];
            const nodeId = this.generateNodeId(i + 1);
            const walletAddress = this.generateWalletAddress(`${config.domain}_${Date.now()}`);
            
            // Create validation node (lightweight)
            const node = new STARWMiniValidationNode(walletAddress);
            
            // Store node
            this.nodes.set(nodeId, node);
            
            // Allocate tokens to wallet
            const tokenBalances = config.tokens || {
                STR: 10_000_000,    // Default 10M STR for genesis nodes
                CCOS: 10_000,       // Default 10K CCOS
                WSTR: 1_000_000,    // Default 1M WSTR
                ARSS: 500_000,      // Default 500K ARSS
                ESTR: 100_000       // Default 100K ESTR
            };
            
            const nodeData = {
                nodeId,
                walletAddress,
                domain: config.domain,
                abbreviation: config.abbr,
                role: config.role,
                power: config.power,
                tokenBalances: tokenBalances,
                nodeInstance: node,
                createdAt: Date.now(),
                status: 'active'
            };
            
            this.specialDomains.set(config.domain, nodeData);
            this.nodeRegistry.push(nodeData);
            this.activeNodes++;
            
            console.log(`   ✅ ${config.domain} (${config.abbr}) → ${walletAddress.substring(0, 30)}...`);
            console.log(`      Role: ${config.role} | Power: ${config.power} | Node: ${nodeId}`);
            console.log(`      💰 Tokens: STR=${this.formatNumber(tokenBalances.STR)} | CCOS=${this.formatNumber(tokenBalances.CCOS)} | WSTR=${this.formatNumber(tokenBalances.WSTR)} | ARSS=${this.formatNumber(tokenBalances.ARSS)} | ESTR=${this.formatNumber(tokenBalances.ESTR)}`);
        }
        
        console.log(`\n✅ ${this.specialDomainsConfig.length} special domain nodes created with token allocations`);
    }

    /**
     * Format number with commas
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Create remaining genesis nodes (sequential naming)
     */
    async createGenesisNodes() {
        const startIndex = this.specialDomainsConfig.length + 1;
        const remainingNodes = this.totalNodes - this.specialDomainsConfig.length;
        
        console.log(`\n🔷 Creating ${remainingNodes} Genesis Nodes...`);
        console.log(`   Starting from index ${startIndex}...`);
        
        // Create nodes sequentially (avoid stack overflow)
        for (let i = startIndex; i <= this.totalNodes; i++) {
            const nodeId = this.generateNodeId(i);
            const domain = `STR.GENESIS${String(i).padStart(4, '0')}`;
            const walletAddress = this.generateWalletAddress(`genesis_${i}_${Date.now()}`);
            
            // Create validation node (lightweight - no actual start)
            const node = new STARWMiniValidationNode(walletAddress);
            
            // Allocate tokens to regular genesis validators (smaller amounts)
            const baseAmount = 1_000_000; // 1M STR base
            const randomMultiplier = Math.random() * 5 + 1; // 1x to 6x multiplier
            const tokenBalances = {
                STR: Math.floor(baseAmount * randomMultiplier),
                CCOS: Math.floor(1_000 * randomMultiplier),
                WSTR: Math.floor(200_000 * randomMultiplier),
                ARSS: Math.floor(100_000 * randomMultiplier),
                ESTR: Math.floor(50_000 * randomMultiplier)
            };
            
            const nodeData = {
                nodeId,
                walletAddress,
                domain,
                abbreviation: `GN${String(i).padStart(4, '0')}`,
                role: 'validator',
                power: Math.floor(Math.random() * 30) + 50, // 50-80 power
                tokenBalances: tokenBalances,
                nodeInstance: node,
                createdAt: Date.now(),
                status: 'active' // Mark as active immediately
            };
            
            this.nodes.set(nodeId, node);
            this.nodeRegistry.push(nodeData);
            this.activeNodes++;
            
            // Progress logging every 100 nodes
            if (i % 100 === 0) {
                const progress = ((i - startIndex + 1) / remainingNodes * 100).toFixed(1);
                console.log(`   📊 Progress: ${progress}% (${this.activeNodes}/${this.totalNodes} nodes created)`);
            }
        }
        
        console.log(`\n✅ All ${this.totalNodes} genesis nodes created and active`);
    }

    /**
     * Save genesis nodes configuration to disk
     */
    async saveGenesisConfig() {
        console.log('\n💾 Saving genesis configuration...');
        
        const config = {
            totalNodes: this.totalNodes,
            activeNodes: this.activeNodes,
            specialDomains: Array.from(this.specialDomains.values()).map(node => ({
                nodeId: node.nodeId,
                walletAddress: node.walletAddress,
                domain: node.domain,
                abbreviation: node.abbreviation,
                role: node.role,
                power: node.power,
                tokenBalances: node.tokenBalances
            })),
            allNodes: this.nodeRegistry.map(node => ({
                nodeId: node.nodeId,
                walletAddress: node.walletAddress,
                domain: node.domain,
                abbreviation: node.abbreviation,
                role: node.role,
                power: node.power,
                tokenBalances: node.tokenBalances,
                status: node.status
            })),
            tokenAllocation: {
                totalAllocated: this.calculateTotalAllocated(),
                tokenConfig: this.tokenConfig
            },
            createdAt: Date.now(),
            version: '1.0.0'
        };
        
        // Save main config
        await fs.writeFile(
            path.join(__dirname, 'config', 'genesis-nodes.json'),
            JSON.stringify(config, null, 2)
        );
        
        // Save special domains separately
        await fs.writeFile(
            path.join(__dirname, 'domains', 'special-domains.json'),
            JSON.stringify({
                domains: Array.from(this.specialDomains.values())
            }, null, 2)
        );
        
        // Save wallets
        const walletData = this.nodeRegistry.map(node => ({
            nodeId: node.nodeId,
            walletAddress: node.walletAddress,
            domain: node.domain,
            privateKey: '0x' + crypto.randomBytes(32).toString('hex') // Mock private key
        }));
        
        await fs.writeFile(
            path.join(__dirname, 'wallets', 'genesis-wallets.json'),
            JSON.stringify({ wallets: walletData }, null, 2)
        );
        
        console.log('   ✅ Configuration saved to genesis-nodes/config/');
        console.log('   ✅ Special domains saved to genesis-nodes/domains/');
        console.log('   ✅ Wallets saved to genesis-nodes/wallets/');
    }

    /**
     * Calculate total allocated tokens across all nodes
     */
    calculateTotalAllocated() {
        const totals = { STR: 0, CCOS: 0, WSTR: 0, ARSS: 0, ESTR: 0 };
        
        for (const node of this.nodeRegistry) {
            if (node.tokenBalances) {
                totals.STR += node.tokenBalances.STR || 0;
                totals.CCOS += node.tokenBalances.CCOS || 0;
                totals.WSTR += node.tokenBalances.WSTR || 0;
                totals.ARSS += node.tokenBalances.ARSS || 0;
                totals.ESTR += node.tokenBalances.ESTR || 0;
            }
        }
        
        return totals;
    }

    /**
     * Get network statistics
     */
    getNetworkStats() {
        const totalTPS = this.activeNodes * 100; // Each node ~100 TPS
        const totalTPMS = Math.floor(totalTPS / 1000); // Convert to TPMS
        
        let totalValidations = 0;
        let totalWitnesses = 0;
        
        for (const node of this.nodes.values()) {
            const metrics = node.getMetrics();
            totalValidations += metrics.totalValidations || 0;
            totalWitnesses += metrics.witnessPool?.size || 0;
        }
        
        return {
            totalNodes: this.totalNodes,
            activeNodes: this.activeNodes,
            specialDomains: this.specialDomains.size,
            totalTPS,
            totalTPMS,
            totalValidations,
            totalWitnesses,
            averageNodeSize: 0.7, // MB (estimated)
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get specific node by ID or domain
     */
    getNode(identifier) {
        // Try nodeId first
        if (this.nodes.has(identifier)) {
            return this.nodes.get(identifier);
        }
        
        // Try domain
        const domainData = this.specialDomains.get(identifier);
        if (domainData) {
            return domainData.nodeInstance;
        }
        
        // Search by wallet address
        for (const nodeData of this.nodeRegistry) {
            if (nodeData.walletAddress === identifier) {
                return nodeData.nodeInstance;
            }
        }
        
        return null;
    }

    /**
     * Get all special domain nodes
     */
    getSpecialDomains() {
        return Array.from(this.specialDomains.values());
    }

    /**
     * Run simulation - generate cross-node transactions
     */
    async runNetworkSimulation(durationSeconds = 60) {
        console.log(`\n🌐 Running Network Simulation (${durationSeconds}s)...`);
        
        const startTime = Date.now();
        const endTime = startTime + (durationSeconds * 1000);
        let transactionCount = 0;
        
        const simulationInterval = setInterval(async () => {
            if (Date.now() >= endTime) {
                clearInterval(simulationInterval);
                console.log(`\n✅ Simulation complete: ${transactionCount} transactions processed`);
                return;
            }
            
            // Random transaction between nodes
            const fromIndex = Math.floor(Math.random() * this.nodeRegistry.length);
            const toIndex = Math.floor(Math.random() * this.nodeRegistry.length);
            
            if (fromIndex !== toIndex) {
                const fromNode = this.nodeRegistry[fromIndex];
                const toNode = this.nodeRegistry[toIndex];
                
                const tx = {
                    from: fromNode.walletAddress,
                    to: toNode.walletAddress,
                    amount: Math.floor(Math.random() * 1000) + 1,
                    timestamp: Date.now(),
                    hash: crypto.randomBytes(32).toString('hex')
                };
                
                try {
                    await fromNode.nodeInstance.submitTransaction(tx);
                    transactionCount++;
                    
                    if (transactionCount % 100 === 0) {
                        console.log(`   📊 ${transactionCount} transactions processed...`);
                    }
                } catch (error) {
                    // Silent fail
                }
            }
        }, 100); // 10 TPS simulation rate
        
        return new Promise((resolve) => {
            setTimeout(() => {
                clearInterval(simulationInterval);
                resolve(transactionCount);
            }, durationSeconds * 1000 + 500);
        });
    }

    /**
     * Shutdown all nodes gracefully
     */
    async shutdown() {
        console.log('\n🛑 Shutting down all genesis nodes...');
        
        for (const [nodeId, node] of this.nodes) {
            if (node.isRunning) {
                await node.stop();
            }
        }
        
        this.activeNodes = 0;
        console.log('✅ All genesis nodes stopped');
    }

    /**
     * Initialize entire genesis network
     */
    async initialize() {
        console.log('\n🌌 INITIALIZING GENESIS NODE NETWORK');
        console.log('=====================================\n');
        
        const startTime = Date.now();
        
        // Step 1: Create special domain nodes
        await this.createSpecialDomainNodes();
        
        // Step 2: Create remaining genesis nodes
        await this.createGenesisNodes();
        
        // Step 3: Save configuration
        await this.saveGenesisConfig();
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        console.log('\n=====================================');
        console.log('✅ GENESIS NETWORK INITIALIZED');
        console.log('=====================================');
        console.log(`   ⏱️  Time: ${duration}s`);
        console.log(`   📊 Total Nodes: ${this.totalNodes}`);
        console.log(`   ✅ Active Nodes: ${this.activeNodes}`);
        console.log(`   ⭐ Special Domains: ${this.specialDomains.size}`);
        console.log(`   🚀 Network Capacity: ${this.getNetworkStats().totalTPMS} TPMS`);
        console.log('=====================================\n');
        
        return this.getNetworkStats();
    }
}

module.exports = GenesisNodeManager;
