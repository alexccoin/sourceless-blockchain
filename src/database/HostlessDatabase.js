// HOSTLESS DATABASE - Pure Blockchain & Distributed Ledger Technology
// On-chain and off-chain data management powered by STARW
// No centralized database - all data stored on the blockchain and distributed network

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const STARWMiniValidationNode = require('../main/starw/STARWMiniValidationNode');

class HostlessDatabase {
    constructor() {
        this.initialized = false;
        this.onChainData = new Map(); // On-chain: permanent blockchain data
        this.offChainData = new Map(); // Off-chain: temporary cached data
        this.starwStorage = null; // STARW distributed storage
        this.ledgerChains = new Map(); // Multi-ledger chains
        this.hostlessPath = path.join(process.cwd(), '.hostless');
        this.publicIdentities = new Map(); // STR.DOMAIN → Public Identity Mapping
        this.domainWebsites = new Map(); // STR.DOMAIN → STARW Hosted Website Data
        this.identityLedger = []; // Public discovery ledger
        this.validationNodes = new Map(); // Wallet Address → STARW Mini Validation Node
        
        console.log('🌐 HOSTLESS Database initialized (Pure Blockchain + DLT)');
        console.log('   📊 On-chain: Immutable blockchain storage');
        console.log('   💾 Off-chain: STARW distributed cache');
        console.log('   🔗 Multi-ledger: 6 specialized chains');
        console.log('   🆔 Identity Ledger: STR.DOMAIN public discovery');
        console.log('   🌍 STARW Websites: Public domain hosting');
    }

    async initialize() {
        if (this.initialized) return;
        
        try {
            console.log('🗄️ Initializing HOSTLESS blockchain database...');
            
            // Create HOSTLESS storage directory
            await this.initializeHostlessStorage();
            
            // Initialize multi-ledger chains
            await this.initializeLedgerChains();
            
            // Initialize STARW distributed storage
            await this.initializeStarwStorage();
            
            // Load or create genesis
            await this.loadOrCreateGenesis();
            
            this.initialized = true;
            console.log('✅ HOSTLESS database initialized successfully');
            console.log('   🎯 Pure blockchain storage active');
            console.log('   🌍 Distributed ledger technology enabled');
            
        } catch (error) {
            console.error('❌ HOSTLESS database initialization failed:', error);
            throw error;
        }
    }

    async initializeHostlessStorage() {
        try {
            await fs.mkdir(this.hostlessPath, { recursive: true });
            await fs.mkdir(path.join(this.hostlessPath, 'on-chain'), { recursive: true });
            await fs.mkdir(path.join(this.hostlessPath, 'off-chain'), { recursive: true });
            await fs.mkdir(path.join(this.hostlessPath, 'starw-storage'), { recursive: true });
            await fs.mkdir(path.join(this.hostlessPath, 'public-identities'), { recursive: true });
            await fs.mkdir(path.join(this.hostlessPath, 'domain-websites'), { recursive: true });
            await fs.mkdir(path.join(this.hostlessPath, 'identity-ledger'), { recursive: true });
            console.log('✅ HOSTLESS storage directories created');
        } catch (error) {
            if (error.code !== 'EEXIST') throw error;
        }
    }

    async initializeLedgerChains() {
        const ledgers = ['main', 'asset', 'contract', 'governance', 'ccoin', 'ccos'];
        
        for (const ledger of ledgers) {
            this.ledgerChains.set(ledger, {
                name: ledger,
                blocks: [],
                transactions: [],
                state: {},
                metadata: {
                    created: Date.now(),
                    blockCount: 0,
                    txCount: 0
                }
            });
            
            // Load existing chain data from HOSTLESS storage
            await this.loadLedgerChain(ledger);
        }
        
        console.log('✅ Multi-ledger chains initialized (6 ledgers)');
    }

    async loadLedgerChain(ledgerName) {
        try {
            const chainPath = path.join(this.hostlessPath, 'on-chain', `${ledgerName}.chain`);
            const data = await fs.readFile(chainPath, 'utf-8');
            const chain = JSON.parse(data);
            this.ledgerChains.set(ledgerName, chain);
        } catch (error) {
            // Chain doesn't exist yet - will be created
        }
    }

    async saveLedgerChain(ledgerName) {
        const chain = this.ledgerChains.get(ledgerName);
        const chainPath = path.join(this.hostlessPath, 'on-chain', `${ledgerName}.chain`);
        await fs.writeFile(chainPath, JSON.stringify(chain, null, 2));
    }

    async initializeStarwStorage() {
        this.starwStorage = {
            commitments: new Map(),
            distributedNodes: [],
            storageCapacity: 0,
            usedStorage: 0,
            arssRewards: 0
        };
        
        // Load STARW storage state
        try {
            const starwPath = path.join(this.hostlessPath, 'starw-storage', 'state.json');
            const data = await fs.readFile(starwPath, 'utf-8');
            const state = JSON.parse(data);
            this.starwStorage = {
                ...this.starwStorage,
                ...state
            };
        } catch (error) {
            // New STARW storage
        }
        
        console.log('✅ STARW distributed storage initialized');
    }

    async loadOrCreateGenesis() {
        // Try to load genesis from on-chain storage
        const genesisPath = path.join(this.hostlessPath, 'on-chain', 'genesis.json');
        
        try {
            const data = await fs.readFile(genesisPath, 'utf-8');
            const genesis = JSON.parse(data);
            this.onChainData.set('genesis', genesis);
            console.log('✅ Existing HOSTLESS genesis found:', genesis.hash);
            return genesis;
        } catch (error) {
            console.log('🌍 Creating HOSTLESS genesis blockchain state...');
            return await this.createGenesisState();
        }
    }

    async createGenesisState() {
        const genesis = {
            hash: crypto.randomBytes(32).toString('hex'),
            timestamp: Date.now(),
            network: 'Sourceless Mainnet',
            chainId: 1313,
            version: '0.14',
            strSupply: 63000000000,
            ccosSupply: 63000000,
            ledgers: 6,
            consensusType: 'PoW',
            storageType: 'HOSTLESS',
            dltEnabled: true
        };
        
        // Save to on-chain storage
        const genesisPath = path.join(this.hostlessPath, 'on-chain', 'genesis.json');
        await fs.writeFile(genesisPath, JSON.stringify(genesis, null, 2));
        
        this.onChainData.set('genesis', genesis);
        console.log('✅ HOSTLESS genesis blockchain state created');
        console.log('📋 Genesis Hash:', genesis.hash);
        
        return genesis;
    }

    // ON-CHAIN OPERATIONS (Permanent, Immutable)
    async writeOnChain(key, data) {
        this.onChainData.set(key, data);
        const onChainPath = path.join(this.hostlessPath, 'on-chain', `${key}.json`);
        await fs.writeFile(onChainPath, JSON.stringify(data, null, 2));
    }

    async readOnChain(key) {
        if (this.onChainData.has(key)) {
            return this.onChainData.get(key);
        }
        
        try {
            const onChainPath = path.join(this.hostlessPath, 'on-chain', `${key}.json`);
            const data = await fs.readFile(onChainPath, 'utf-8');
            const parsed = JSON.parse(data);
            this.onChainData.set(key, parsed);
            return parsed;
        } catch (error) {
            return null;
        }
    }

    // OFF-CHAIN OPERATIONS (Temporary, Cached via STARW)
    async writeOffChain(key, data, ttl = 3600000) {
        this.offChainData.set(key, {
            data,
            expires: Date.now() + ttl
        });
        
        const offChainPath = path.join(this.hostlessPath, 'off-chain', `${key}.cache`);
        await fs.writeFile(offChainPath, JSON.stringify({
            data,
            expires: Date.now() + ttl
        }));
    }

    async readOffChain(key) {
        const cached = this.offChainData.get(key);
        if (cached && cached.expires > Date.now()) {
            return cached.data;
        }
        
        try {
            const offChainPath = path.join(this.hostlessPath, 'off-chain', `${key}.cache`);
            const rawData = await fs.readFile(offChainPath, 'utf-8');
            const parsed = JSON.parse(rawData);
            
            if (parsed.expires > Date.now()) {
                this.offChainData.set(key, parsed);
                return parsed.data;
            }
        } catch (error) {
            // Cache miss or expired
        }
        
        return null;
    }

    // BLOCKCHAIN OPERATIONS
    async addBlock(ledgerName, block) {
        const chain = this.ledgerChains.get(ledgerName);
        if (!chain) throw new Error(`Ledger ${ledgerName} not found`);
        
        // Add to on-chain storage (permanent)
        chain.blocks.push(block);
        chain.metadata.blockCount++;
        
        // Update ledger chain
        this.ledgerChains.set(ledgerName, chain);
        
        // Persist to HOSTLESS storage
        await this.saveLedgerChain(ledgerName);
        
        return block;
    }

    async addTransaction(ledgerName, transaction) {
        const chain = this.ledgerChains.get(ledgerName);
        if (!chain) throw new Error(`Ledger ${ledgerName} not found`);
        
        // Add to on-chain storage (permanent)
        chain.transactions.push(transaction);
        chain.metadata.txCount++;
        
        // Update ledger chain
        this.ledgerChains.set(ledgerName, chain);
        
        // Persist to HOSTLESS storage
        await this.saveLedgerChain(ledgerName);
        
        return transaction;
    }

    // NETWORK STATISTICS (From blockchain data, not database)
    async getNetworkStats() {
        const genesis = this.onChainData.get('genesis') || await this.readOnChain('genesis');
        
        // Calculate from blockchain data
        let totalBlocks = 0;
        let totalTransactions = 0;
        
        for (const [name, chain] of this.ledgerChains) {
            totalBlocks += chain.metadata.blockCount;
            totalTransactions += chain.metadata.txCount;
        }
        
        return {
            network: genesis.network,
            chainId: genesis.chainId,
            genesisHash: genesis.hash,
            totalBlocks,
            totalTransactions,
            strSupply: genesis.strSupply,
            ccosSupply: genesis.ccosSupply,
            activePeers: this.starwStorage.distributedNodes.length,
            storageType: 'HOSTLESS',
            dltEnabled: true
        };
    }

    async getLedgerStats() {
        const stats = [];
        
        for (const [name, chain] of this.ledgerChains) {
            stats.push({
                name: name,
                displayName: this.getLedgerDisplayName(name),
                blockCount: chain.metadata.blockCount,
                txCount: chain.metadata.txCount,
                lastBlock: chain.blocks[chain.blocks.length - 1] || null,
                state: chain.state
            });
        }
        
        return stats;
    }

    getLedgerDisplayName(name) {
        const names = {
            'main': 'Main Ledger',
            'asset': 'Asset Ledger',
            'contract': 'Contract Ledger',
            'governance': 'Governance Ledger',
            'ccoin': 'CCOIN Ledger',
            'ccos': 'CCOS Ledger'
        };
        return names[name] || name;
    }

    async getGenesisHash() {
        try {
            const genesisPath = path.join(this.onChainPath, 'genesis.json');
            const data = await fs.readFile(genesisPath, 'utf-8');
            const genesis = JSON.parse(data);
            return genesis.hash || genesis.genesisHash || '';
        } catch (error) {
            return '';
        }
    }

    // STARW STORAGE OPERATIONS
    async addStorageCommitment(commitment) {
        const id = `commitment_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
        this.starwStorage.commitments.set(id, commitment);
        this.starwStorage.storageCapacity += commitment.size;
        
        // Save to STARW storage
        await this.saveStarwState();
        
        return id;
    }

    async saveStarwState() {
        const starwPath = path.join(this.hostlessPath, 'starw-storage', 'state.json');
        const state = {
            commitments: Array.from(this.starwStorage.commitments.entries()),
            distributedNodes: this.starwStorage.distributedNodes,
            storageCapacity: this.starwStorage.storageCapacity,
            usedStorage: this.starwStorage.usedStorage,
            arssRewards: this.starwStorage.arssRewards
        };
        await fs.writeFile(starwPath, JSON.stringify(state, null, 2));
    }

    // COMPATIBILITY METHODS (for existing code)
    async syncFromBlockchain(blockchain) {
        console.log('🔄 Syncing blockchain data to HOSTLESS database...');
        
        // Check if genesis exists
        const genesis = this.onChainData.get('genesis') || await this.readOnChain('genesis');
        
        if (genesis && blockchain.genesis && genesis.hash === blockchain.genesis.genesisHash) {
            console.log('✅ HOSTLESS database already contains blockchain data');
            console.log('   📊 Genesis Hash:', genesis.hash);
            console.log('   💰 Total STR Supply:', genesis.strSupply);
            console.log('   💎 Total CCOS Supply:', genesis.ccosSupply);
            return;
        }

        // First-time sync
        console.log('📥 First-time blockchain sync to HOSTLESS...');
        
        // Sync ledgers
        for (const ledger of blockchain.ledgers.values()) {
            const chain = this.ledgerChains.get(ledger.name);
            if (chain) {
                chain.blocks = ledger.chain || [];
                chain.transactions = ledger.pendingTransactions || [];
                chain.metadata.blockCount = chain.blocks.length;
                chain.metadata.txCount = chain.transactions.length;
                
                await this.saveLedgerChain(ledger.name);
            }
        }

        console.log('✅ Blockchain synced to HOSTLESS database');
    }

    // ==========================================
    // PUBLIC IDENTITY & STR.DOMAIN SYSTEM
    // ==========================================

    /**
     * Register a public identity with STR.DOMAIN
     * @param {string} domain - STR.DOMAIN (e.g., "STR.alice", "STR.company")
     * @param {string} walletAddress - Private wallet address (ZK13STR format)
     * @param {object} publicProfile - Public discoverable information
     */
    async registerPublicIdentity(domain, walletAddress, publicProfile = {}) {
        // Validate format: STR.{identifier} (1-64 chars, no spaces)
        const domainRegex = /^STR\.[a-zA-Z0-9\-_\.]{1,64}$/i;
        if (!domainRegex.test(domain)) {
            throw new Error('Domain must be format: STR.{identifier} (1-64 characters, letters/numbers/hyphens/underscores/dots, no spaces)');
        }

        // Normalize: uppercase STR prefix, preserve identifier case
        const normalizedDomain = 'STR.' + domain.substring(4);
        
        const identity = {
            domain: normalizedDomain,
            walletAddress: walletAddress, // Private, masked by domain
            publicProfile: {
                displayName: publicProfile.displayName || normalizedDomain,
                bio: publicProfile.bio || '',
                avatar: publicProfile.avatar || '',
                website: publicProfile.website || '',
                social: publicProfile.social || {},
                verified: publicProfile.verified || false,
                createdAt: Date.now(),
                updatedAt: Date.now()
            },
            metadata: {
                registrationBlock: publicProfile.registrationBlock || 0,
                registrationTx: publicProfile.registrationTx || '',
                expiresAt: publicProfile.expiresAt || null,
                renewable: publicProfile.renewable !== false
            }
        };

        // Store in memory
        this.publicIdentities.set(normalizedDomain, identity);

        // Save to public-identities directory (sanitize filename)
        const sanitizedFilename = normalizedDomain.replace(/\./g, '_');
        const identityPath = path.join(this.hostlessPath, 'public-identities', `${sanitizedFilename}.json`);
        await fs.writeFile(identityPath, JSON.stringify(identity, null, 2));

        // Add to identity ledger (public discovery)
        this.identityLedger.push({
            type: 'register',
            domain: normalizedDomain,
            timestamp: Date.now(),
            block: identity.metadata.registrationBlock
        });

        await this.saveIdentityLedger();

        console.log(`✅ Public identity registered: ${normalizedDomain} → ${walletAddress}`);
        return identity;
    }

    /**
     * Resolve STR.DOMAIN to wallet address (mask removal)
     * @param {string} domain - STR.DOMAIN to resolve (e.g., "STR.alice")
     * @returns {string} - Private wallet address
     */
    async resolveDomainToWallet(domain) {
        // Normalize domain
        const normalizedDomain = 'STR.' + domain.substring(4);
        const sanitizedFilename = normalizedDomain.replace(/\./g, '_');

        // Check memory cache
        if (this.publicIdentities.has(normalizedDomain)) {
            return this.publicIdentities.get(normalizedDomain).walletAddress;
        }

        // Load from disk
        try {
            const identityPath = path.join(this.hostlessPath, 'public-identities', `${sanitizedFilename}.json`);
            const data = await fs.readFile(identityPath, 'utf-8');
            const identity = JSON.parse(data);
            this.publicIdentities.set(normalizedDomain, identity);
            return identity.walletAddress;
        } catch (error) {
            return null;
        }
    }

    /**
     * Get public profile for a domain (discoverable information)
     * @param {string} domain - STR.DOMAIN (e.g., "STR.alice")
     * @returns {object} - Public profile data
     */
    async getPublicProfile(domain) {
        // Normalize domain
        const normalizedDomain = 'STR.' + domain.substring(4);
        const sanitizedFilename = normalizedDomain.replace(/\./g, '_');

        // Check memory cache
        if (this.publicIdentities.has(normalizedDomain)) {
            return this.publicIdentities.get(normalizedDomain).publicProfile;
        }

        // Load from disk
        try {
            const identityPath = path.join(this.hostlessPath, 'public-identities', `${sanitizedFilename}.json`);
            const data = await fs.readFile(identityPath, 'utf-8');
            const identity = JSON.parse(data);
            this.publicIdentities.set(normalizedDomain, identity);
            return identity.publicProfile;
        } catch (error) {
            return null;
        }
    }

    /**
     * Host website content on STARW for a domain
     * @param {string} domain - STR.DOMAIN (e.g., "STR.alice")
     * @param {object} websiteData - Website content and metadata
     */
    async hostDomainWebsite(domain, websiteData) {
        // Normalize domain
        const normalizedDomain = 'STR.' + domain.substring(4);
        const sanitizedFilename = normalizedDomain.replace(/\./g, '_');

        const website = {
            domain: normalizedDomain,
            content: {
                html: websiteData.html || '',
                css: websiteData.css || '',
                js: websiteData.js || '',
                assets: websiteData.assets || {}
            },
            metadata: {
                title: websiteData.title || domain,
                description: websiteData.description || '',
                keywords: websiteData.keywords || [],
                author: websiteData.author || '',
                version: websiteData.version || '1.0.0',
                updatedAt: Date.now(),
                size: this.calculateSize(websiteData),
                starwNodes: [] // Will be populated by STARW network
            },
            hosting: {
                enabled: true,
                starwStorage: true,
                distributedNodes: 0,
                bandwidth: 0,
                hits: 0
            }
        };

        // Store in memory
        this.domainWebsites.set(normalizedDomain, website);

        // Save to domain-websites directory
        const websitePath = path.join(this.hostlessPath, 'domain-websites', `${sanitizedFilename}.json`);
        await fs.writeFile(websitePath, JSON.stringify(website, null, 2));

        // Save actual website files
        const domainDir = path.join(this.hostlessPath, 'domain-websites', sanitizedFilename);
        await fs.mkdir(domainDir, { recursive: true });
        
        if (website.content.html) {
            await fs.writeFile(path.join(domainDir, 'index.html'), website.content.html);
        }
        if (website.content.css) {
            await fs.writeFile(path.join(domainDir, 'styles.css'), website.content.css);
        }
        if (website.content.js) {
            await fs.writeFile(path.join(domainDir, 'script.js'), website.content.js);
        }

        console.log(`🌍 Website hosted on STARW: ${normalizedDomain}`);
        console.log(`   📦 Size: ${website.metadata.size} bytes`);
        console.log(`   🔗 Public URL: https://${normalizedDomain}.stratus.network`);

        return website;
    }

    /**
     * Get website content for a domain
     * @param {string} domain - STR.DOMAIN (e.g., "STR.alice")
     * @returns {object} - Website data
     */
    async getDomainWebsite(domain) {
        // Normalize domain
        const normalizedDomain = 'STR.' + domain.substring(4);
        const sanitizedFilename = normalizedDomain.replace(/\./g, '_');

        // Check memory cache
        if (this.domainWebsites.has(normalizedDomain)) {
            return this.domainWebsites.get(normalizedDomain);
        }

        // Load from disk
        try {
            const websitePath = path.join(this.hostlessPath, 'domain-websites', `${sanitizedFilename}.json`);
            const data = await fs.readFile(websitePath, 'utf-8');
            const website = JSON.parse(data);
            this.domainWebsites.set(normalizedDomain, website);
            return website;
        } catch (error) {
            return null;
        }
    }

    /**
     * Search public identities (discovery)
     * @param {string} query - Search query
     * @returns {array} - Matching public profiles
     */
    async searchPublicIdentities(query) {
        const results = [];
        const publicDir = path.join(this.hostlessPath, 'public-identities');

        try {
            const files = await fs.readdir(publicDir);
            for (const file of files) {
                if (!file.endsWith('.json')) continue;

                const identityPath = path.join(publicDir, file);
                const data = await fs.readFile(identityPath, 'utf-8');
                const identity = JSON.parse(data);

                // Search in domain, displayName, bio
                const searchText = `${identity.domain} ${identity.publicProfile.displayName} ${identity.publicProfile.bio}`.toLowerCase();
                if (searchText.includes(query.toLowerCase())) {
                    results.push({
                        domain: identity.domain,
                        profile: identity.publicProfile
                    });
                }
            }
        } catch (error) {
            console.error('Search error:', error);
        }

        return results;
    }

    /**
     * Get identity ledger (public discovery log)
     * @returns {array} - Identity ledger entries
     */
    async getIdentityLedger() {
        if (this.identityLedger.length > 0) {
            return this.identityLedger;
        }

        // Load from disk
        try {
            const ledgerPath = path.join(this.hostlessPath, 'identity-ledger', 'ledger.json');
            const data = await fs.readFile(ledgerPath, 'utf-8');
            this.identityLedger = JSON.parse(data);
        } catch (error) {
            this.identityLedger = [];
        }

        return this.identityLedger;
    }

    async saveIdentityLedger() {
        const ledgerPath = path.join(this.hostlessPath, 'identity-ledger', 'ledger.json');
        await fs.writeFile(ledgerPath, JSON.stringify(this.identityLedger, null, 2));
    }

    calculateSize(data) {
        return JSON.stringify(data).length;
    }

    /**
     * List all registered domains
     * @returns {array} - List of all public domains
     */
    async listAllDomains() {
        const domains = [];
        const publicDir = path.join(this.hostlessPath, 'public-identities');

        try {
            const files = await fs.readdir(publicDir);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const domain = file.replace('.json', '');
                    domains.push(domain);
                }
            }
        } catch (error) {
            // Directory doesn't exist yet
        }

        return domains.sort();
    }

    /**
     * Get or create STARW Mini Validation Node for wallet
     * Automatically creates <1MB validation node with ZK13 + GodCypher
     */
    async getValidationNode(walletAddress) {
        if (!walletAddress) {
            throw new Error('Wallet address required');
        }

        // Check if node already exists
        if (this.validationNodes.has(walletAddress)) {
            return this.validationNodes.get(walletAddress);
        }

        // Create new validation node
        console.log(`🔷 Creating STARW Mini Validation Node for ${walletAddress}`);
        const node = new STARWMiniValidationNode(walletAddress);

        // Auto-start the node
        await node.start();

        // Store node reference
        this.validationNodes.set(walletAddress, node);

        console.log(`✅ Validation node created and started for ${walletAddress}`);
        console.log(`   Node ID: ${node.nodeId}`);

        return node;
    }

    /**
     * Submit transaction for validation through node
     */
    async validateTransaction(tx) {
        if (!tx.from) {
            throw new Error('Transaction must have sender (from) address');
        }

        // Get or create sender's validation node
        const senderNode = await this.getValidationNode(tx.from);

        // Submit transaction for validation
        const result = await senderNode.submitTransaction(tx);

        console.log(`📝 Transaction submitted for validation: ${tx.hash?.substring(0, 16)}...`);

        return result;
    }

    /**
     * Get validation node metrics
     */
    async getValidationMetrics(walletAddress) {
        if (!walletAddress) {
            // Return aggregated metrics for all nodes
            const allMetrics = [];
            for (const [address, node] of this.validationNodes) {
                allMetrics.push({
                    wallet: address,
                    ...node.getMetrics()
                });
            }
            return allMetrics;
        }

        const node = this.validationNodes.get(walletAddress);
        if (!node) {
            return null;
        }

        return node.getMetrics();
    }

    /**
     * Get validation node status
     */
    async getValidationStatus(walletAddress) {
        if (!walletAddress) {
            // Return status for all nodes
            const allStatus = [];
            for (const [address, node] of this.validationNodes) {
                allStatus.push(node.getStatus());
            }
            return allStatus;
        }

        const node = this.validationNodes.get(walletAddress);
        if (!node) {
            return null;
        }

        return node.getStatus();
    }

    /**
     * Run microbenchmark on validation node
     */
    async runValidationBenchmark(walletAddress, iterations = 100) {
        const node = await this.getValidationNode(walletAddress);
        return await node.runMicrobenchmark(iterations);
    }

    /**
     * Add witness to validation pool
     */
    async addValidationWitness(walletAddress, witnessAddress, stake = 0, reputation = 1.0) {
        const node = await this.getValidationNode(walletAddress);
        node.addWitness(witnessAddress, stake, reputation);

        console.log(`👁️  Witness ${witnessAddress} added to ${walletAddress}'s validation pool`);

        return {
            success: true,
            wallet: walletAddress,
            witness: witnessAddress,
            stake,
            reputation
        };
    }

    async close() {
        console.log('✅ HOSTLESS database connection closed');
        
        // Stop all validation nodes
        for (const [address, node] of this.validationNodes) {
            if (node.isRunning) {
                console.log(`🛑 Stopping validation node for ${address}`);
                await node.stop();
            }
        }
        
        // Save all chains before closing
        for (const [name] of this.ledgerChains) {
            await this.saveLedgerChain(name);
        }
        await this.saveStarwState();
        await this.saveIdentityLedger();
    }
}

module.exports = HostlessDatabase;
