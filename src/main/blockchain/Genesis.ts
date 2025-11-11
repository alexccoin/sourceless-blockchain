// Genesis.ts - Complete blockchain genesis initialization
// Creates the initial state for all 6 ledgers with production-ready configuration

import { WalletManager } from './wallet/WalletManager';
import { LedgerManager } from './LedgerManager';
import { STRDomainRegistry } from './STRDomainRegistry';
import { Transaction } from './core/Transaction';

export interface GenesisConfig {
    networkName: string;
    chainId: number;
    timestamp: number;
    genesisWallets: GenesisWallet[];
    initialSupply: {
        STR: number;          // 63 billion - Sourceless main token (ticker: STR)
        CCOS: number;         // 63 million - CCOIN Network token (ticker: CCOS)
        ARSS: number;         // To be defined - Arguable tokens (minted later)
        wSTR: number;         // Wrapped STR - Formula: STR value + (STR.domains × domain_selling_price_x) - Minted later
        eSTR: number;         // Energy Sourceless - Energy token - Defined later
        $TR: number;          // Dollar Sourceless - Stablecoin pegged 1:1 with USD - Defined later
    };
    distribution: {
        market: number;       // 33% to market
        treasury: number;     // 66% to treasury pool
    };
    ccosRewardMechanics: {
        enabled: boolean;
        minRewardPercent: number;  // 2.5% minimum
        maxRewardPercent: number;  // 10% maximum
        triggerEvent: 'financial-public-transaction';
    };
    networkParams: {
        blockTime: number; // seconds
        difficulty: number;
        miningReward: number;
        targetTPMS: number; // 1,000,000 TPMS
        maxBlockSize: number; // bytes
    };
}

export interface GenesisWallet {
    strDomain: string;
    kycVerified: boolean;
    isValidator: boolean;
    initialBalance: number;
    nodeType?: 'genesis' | 'validator' | 'delegated' | 'personal';
}

export interface GenesisState {
    config: GenesisConfig;
    wallets: Map<string, any>;
    ledgers: {
        main: any;
        asset: any;
        contract: any;
        governance: any;
        ccoin: any;
        ccos: any;
    };
    timestamp: number;
    genesisHash: string;
}

export class GenesisBlockchain {
    private walletManager: WalletManager;
    private ledgerManager: LedgerManager;
    private registry: STRDomainRegistry;

    constructor() {
        this.walletManager = new WalletManager();
        this.ledgerManager = new LedgerManager();
        this.registry = new STRDomainRegistry();
    }

    /**
     * Create the complete genesis blockchain state
     */
    createGenesis(config?: Partial<GenesisConfig>): GenesisState {
        console.log('🌍 CREATING GENESIS BLOCKCHAIN STATE');
        console.log('=====================================\n');

        const genesisConfig: GenesisConfig = {
            networkName: config?.networkName || 'Sourceless Mainnet',
            chainId: config?.chainId || 1313,
            timestamp: config?.timestamp || Date.now(),
            genesisWallets: config?.genesisWallets || this.getDefaultGenesisWallets(),
            initialSupply: config?.initialSupply || {
                STR: 63_000_000_000,   // 63 billion STR (Sourceless main token)
                CCOS: 63_000_000,      // 63 million CCOS (CCOIN Network token)
                ARSS: 0,               // Arguable tokens - minted later
                wSTR: 0,               // Wrapped STR - Formula: STR value + (domains × x) - Minted later
                eSTR: 0,               // Energy Sourceless - Energy token - Minted later
                $TR: 0,                // Dollar Sourceless - USD stablecoin (1:1 peg) - Minted later
            },
            distribution: config?.distribution || {
                market: 0.33,          // 33% to market
                treasury: 0.67,        // 67% to treasury pool (66% + 1% for rounding)
            },
            ccosRewardMechanics: config?.ccosRewardMechanics || {
                enabled: true,
                minRewardPercent: 2.5, // 2.5% minimum reward
                maxRewardPercent: 10,  // 10% maximum reward
                triggerEvent: 'financial-public-transaction',
            },
            networkParams: config?.networkParams || {
                blockTime: 1, // 1 second
                difficulty: 4,
                miningReward: 100,
                targetTPMS: 1_000_000,
                maxBlockSize: 10_000_000, // 10MB
            }
        };

        console.log(`📋 Network: ${genesisConfig.networkName}`);
        console.log(`🔗 Chain ID: ${genesisConfig.chainId}`);
        console.log(`📅 Genesis Time: ${new Date(genesisConfig.timestamp).toISOString()}`);
        console.log(`\n💰 Pre-Minted Token Supply:`);
        console.log(`   STR (Sourceless): ${genesisConfig.initialSupply.STR.toLocaleString()} tokens`);
        console.log(`   CCOS (CCOIN Network): ${genesisConfig.initialSupply.CCOS.toLocaleString()} tokens`);
        console.log(`\n📊 Distribution Model:`);
        console.log(`   Market: ${(genesisConfig.distribution.market * 100)}%`);
        console.log(`   Treasury Pool: ${(genesisConfig.distribution.treasury * 100)}%`);
        console.log(`\n⚙️  CCOS Reward Mechanics:`);
        console.log(`   Enabled: ${genesisConfig.ccosRewardMechanics.enabled}`);
        console.log(`   Min Reward: ${genesisConfig.ccosRewardMechanics.minRewardPercent}%`);
        console.log(`   Max Reward: ${genesisConfig.ccosRewardMechanics.maxRewardPercent}%`);
        console.log(`   Trigger: ${genesisConfig.ccosRewardMechanics.triggerEvent}`);
        console.log(`\n📝 Note: ARSS, wSTR, eSTR, and $TR are arguable tokens - minted after genesis`);
        console.log(`   - wSTR (Wrapped STR): Formula = STR value + (STR.domains × domain_selling_price_x)`);
        console.log(`   - eSTR (Energy Sourceless): Energy token - mechanics TBD`);
        console.log(`   - $TR (Dollar Sourceless): USD-pegged stablecoin (1:1 parity)`);
        console.log(``);

        // Step 1: Create genesis wallets
        console.log('📍 Step 1: Creating Genesis Wallets...');
        const wallets = new Map<string, any>();
        
        for (const genesisWallet of genesisConfig.genesisWallets) {
            const wallet = this.walletManager.createWallet(
                genesisWallet.strDomain,
                genesisWallet.kycVerified
            );
            
            wallets.set(wallet.address, {
                ...wallet,
                nodeType: genesisWallet.nodeType,
                isValidator: genesisWallet.isValidator,
                genesisBalance: genesisWallet.initialBalance
            });

            // Register domain
            this.registry.registerDomain(
                genesisWallet.strDomain,
                wallet.address,
                genesisWallet.kycVerified
            );

            console.log(`   ✅ ${genesisWallet.strDomain}: ${wallet.address.substring(0, 30)}...`);
        }

        console.log(`   ✅ Created ${wallets.size} genesis wallets\n`);

        // Step 2: Initialize all 6 ledgers
        console.log('📍 Step 2: Initializing 6 Multi-Ledgers...');
        
        // Main Ledger (STR Fuel)
        console.log('   🔷 Main Ledger (STR Fuel)');
    const mainGenesis = this.ledgerManager.mainLedger.chain[0];
        
        // Asset Ledger (STR.Domains & NFTs)
        console.log('   🌐 Asset Ledger (STR.Domains)');
    const assetGenesis = this.ledgerManager.assetLedger.chain[0];
        
        // Contract Ledger (STARW VM & ARSS)
        console.log('   📝 Contract Ledger (STARW VM)');
    const contractGenesis = this.ledgerManager.contractLedger.chain[0];
        
        // Governance Ledger (DAO)
        console.log('   🗳️  Governance Ledger (DAO)');
    const governanceGenesis = this.ledgerManager.governanceLedger.chain[0];
        
        // CCOIN Ledger (Financial Network)
        console.log('   💵 CCOIN Ledger (Financial)');
    const ccoinGenesis = this.ledgerManager.ccoinLedger.chain[0];
        
        // CCOS Ledger (IgniteHex Platform)
        console.log('   🔥 CCOS Ledger (IgniteHex)');
    const ccosGenesis = this.ledgerManager.ccosLedger.chain[0];
        
        console.log('   ✅ All 6 ledgers initialized\n');

        // Step 3: Distribute initial balances
        console.log('📍 Step 3: Distributing Initial Token Supply...');
        
        // Calculate market and treasury amounts
        const strMarketAmount = Math.floor(genesisConfig.initialSupply.STR * genesisConfig.distribution.market);
        const strTreasuryAmount = genesisConfig.initialSupply.STR - strMarketAmount;
        
        const ccosMarketAmount = Math.floor(genesisConfig.initialSupply.CCOS * genesisConfig.distribution.market);
        const ccosTreasuryAmount = genesisConfig.initialSupply.CCOS - ccosMarketAmount;
        
        console.log(`\n   � STR Distribution:`);
        console.log(`      Market (33%): ${strMarketAmount.toLocaleString()} STR`);
        console.log(`      Treasury (67%): ${strTreasuryAmount.toLocaleString()} STR`);
        
        console.log(`\n   📊 CCOS Distribution:`);
        console.log(`      Market (33%): ${ccosMarketAmount.toLocaleString()} CCOS`);
        console.log(`      Treasury (67%): ${ccosTreasuryAmount.toLocaleString()} CCOS\n`);
        
        // Find or create market and treasury wallets
        let marketWallet = Array.from(wallets.values()).find(w => w.strDomain === 'STR.market');
        let treasuryWallet = Array.from(wallets.values()).find(w => w.strDomain === 'STR.treasury');
        
        if (!marketWallet) {
            const wallet = this.walletManager.createWallet('STR.market');
            marketWallet = {
                strDomain: 'STR.market',
                address: wallet.address,
                publicKey: wallet.publicKey,
                kycVerified: true,
                isValidator: false,
                initialBalance: 0,
                nodeType: 'genesis' as const
            };
            wallets.set('STR.market', marketWallet);
        }
        
        if (!treasuryWallet) {
            const wallet = this.walletManager.createWallet('STR.treasury');
            treasuryWallet = {
                strDomain: 'STR.treasury',
                address: wallet.address,
                publicKey: wallet.publicKey,
                kycVerified: true,
                isValidator: true,
                initialBalance: 0,
                nodeType: 'genesis' as const
            };
            wallets.set('STR.treasury', treasuryWallet);
        }
        
        // Mint STR tokens to market and treasury
        console.log('   💰 Minting STR (Sourceless) tokens...');
        const txSTRMarket = new Transaction('system', marketWallet.address, strMarketAmount, 'mint', 0, {
            token: 'STR',
            purpose: 'genesis-market-distribution'
        });
        this.ledgerManager.mainLedger.addTransaction(txSTRMarket);
        console.log(`      ✅ Market: ${strMarketAmount.toLocaleString()} STR → ${marketWallet.strDomain}`);
        
        const txSTRTreasury = new Transaction('system', treasuryWallet.address, strTreasuryAmount, 'mint', 0, {
            token: 'STR',
            purpose: 'genesis-treasury-distribution'
        });
        this.ledgerManager.mainLedger.addTransaction(txSTRTreasury);
        console.log(`      ✅ Treasury: ${strTreasuryAmount.toLocaleString()} STR → ${treasuryWallet.strDomain}`);
        
        // Mint CCOS tokens to market and treasury
        console.log('\n   💰 Minting CCOS (CCOIN Network) tokens...');
        const txCCOSMarket = new Transaction('system', marketWallet.address, ccosMarketAmount, 'mint', 0, {
            token: 'CCOS',
            purpose: 'genesis-market-distribution'
        });
        this.ledgerManager.ccosLedger.addTransaction(txCCOSMarket);
        console.log(`      ✅ Market: ${ccosMarketAmount.toLocaleString()} CCOS → ${marketWallet.strDomain}`);
        
        const txCCOSTreasury = new Transaction('system', treasuryWallet.address, ccosTreasuryAmount, 'mint', 0, {
            token: 'CCOS',
            purpose: 'genesis-treasury-distribution'
        });
        this.ledgerManager.ccosLedger.addTransaction(txCCOSTreasury);
        console.log(`      ✅ Treasury: ${ccosTreasuryAmount.toLocaleString()} CCOS → ${treasuryWallet.strDomain}`);
        
        console.log('\n   ⚠️  ARSS, wSTR, eSTR, and $TR are arguable tokens - will be minted later as needed');
        console.log('   ✅ Pre-minted supply distributed\n');

        // Step 4: Mine genesis blocks
        console.log('📍 Step 4: Mining Genesis Blocks...');
        
        const genesisValidator = Array.from(wallets.values()).find(w => w.isValidator);
        if (genesisValidator) {
            this.ledgerManager.mainLedger.minePendingTransactions(genesisValidator.address);
            this.ledgerManager.ccoinLedger.minePendingTransactions(genesisValidator.address);
            this.ledgerManager.ccosLedger.minePendingTransactions(genesisValidator.address);
            console.log(`   ✅ Genesis blocks mined by ${genesisValidator.strDomain}\n`);
        }

        // Step 5: Calculate genesis hash
        const genesisHash = this.calculateGenesisHash({
            config: genesisConfig,
            mainBlock: this.ledgerManager.mainLedger.chain[0],
            assetBlock: this.ledgerManager.assetLedger.chain[0],
            contractBlock: this.ledgerManager.contractLedger.chain[0],
            governanceBlock: this.ledgerManager.governanceLedger.chain[0],
            ccoinBlock: this.ledgerManager.ccoinLedger.chain[0],
            ccosBlock: this.ledgerManager.ccosLedger.chain[0],
        });

        console.log('=====================================');
        console.log('✅ GENESIS BLOCKCHAIN CREATED');
        console.log(`📋 Genesis Hash: ${genesisHash}`);
        console.log('=====================================\n');

        const state: GenesisState = {
            config: genesisConfig,
            wallets,
            ledgers: {
                main: mainGenesis,
                asset: assetGenesis,
                contract: contractGenesis,
                governance: governanceGenesis,
                ccoin: ccoinGenesis,
                ccos: ccosGenesis,
            },
            timestamp: genesisConfig.timestamp,
            genesisHash,
        };

        return state;
    }

    /**
     * Get default genesis wallets for mainnet launch
     */
    private getDefaultGenesisWallets(): GenesisWallet[] {
        return [
            {
                strDomain: 'STR.foundation',
                kycVerified: true,
                isValidator: true,
                initialBalance: 5_000_000_000, // 5B STR
                nodeType: 'genesis'
            },
            {
                strDomain: 'STR.treasury',
                kycVerified: true,
                isValidator: true,
                initialBalance: 3_000_000_000, // 3B STR
                nodeType: 'genesis'
            },
            {
                strDomain: 'STR.rewards',
                kycVerified: true,
                isValidator: false,
                initialBalance: 2_000_000_000, // 2B STR
                nodeType: 'genesis'
            },
            {
                strDomain: 'STR.ecosystem',
                kycVerified: true,
                isValidator: true,
                initialBalance: 1_000_000_000, // 1B STR
                nodeType: 'genesis'
            },
            {
                strDomain: 'STR.development',
                kycVerified: true,
                isValidator: true,
                initialBalance: 500_000_000, // 500M STR
                nodeType: 'genesis'
            },
        ];
    }

    /**
     * Calculate genesis hash from all ledger data
     */
    private calculateGenesisHash(data: any): string {
        const crypto = require('crypto');
        const jsonData = JSON.stringify(data);
        return crypto.createHash('sha256').update(jsonData).digest('hex');
    }

    /**
     * Export genesis state to JSON for distribution
     */
    exportGenesis(state: GenesisState): string {
        return JSON.stringify({
            version: '1.0.0',
            network: state.config.networkName,
            chainId: state.config.chainId,
            timestamp: state.timestamp,
            genesisHash: state.genesisHash,
            config: state.config,
            wallets: Array.from(state.wallets.entries()).map(([addr, wallet]) => ({
                address: addr,
                strDomain: wallet.strDomain,
                kycVerified: wallet.kycVerified,
                isValidator: wallet.isValidator,
                nodeType: wallet.nodeType,
            })),
            ledgers: {
                main: {
                    height: 1,
                    hash: state.ledgers.main.hash,
                    timestamp: state.ledgers.main.timestamp,
                },
                asset: {
                    height: 1,
                    hash: state.ledgers.asset.hash,
                    timestamp: state.ledgers.asset.timestamp,
                },
                contract: {
                    height: 1,
                    hash: state.ledgers.contract.hash,
                    timestamp: state.ledgers.contract.timestamp,
                },
                governance: {
                    height: 1,
                    hash: state.ledgers.governance.hash,
                    timestamp: state.ledgers.governance.timestamp,
                },
                ccoin: {
                    height: 1,
                    hash: state.ledgers.ccoin.hash,
                    timestamp: state.ledgers.ccoin.timestamp,
                },
                ccos: {
                    height: 1,
                    hash: state.ledgers.ccos.hash,
                    timestamp: state.ledgers.ccos.timestamp,
                },
            },
        }, null, 2);
    }

    /**
     * Get the complete initialized system
     */
    getSystem() {
        return {
            walletManager: this.walletManager,
            ledgerManager: this.ledgerManager,
            registry: this.registry,
        };
    }
}

// Export helper functions for AutoRunAll integration
export function createGenesis(): GenesisState {
    const genesis = new GenesisBlockchain();
    return genesis.createGenesis();
}

export function loadGenesis(): GenesisState | null {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    const genesisPath = path.join(os.homedir(), '.sourceless', 'genesis-state.json');
    
    if (!fs.existsSync(genesisPath)) {
        return null;
    }
    
    try {
        const data = fs.readFileSync(genesisPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Failed to load genesis state:', error);
        return null;
    }
}

// CLI entry point for genesis creation
if (require.main === module) {
    console.log('\n🌍 Sourceless Blockchain - Genesis Creator\n');
    
    const genesis = new GenesisBlockchain();
    const state = genesis.createGenesis();
    
    // Export to file
    const fs = require('fs');
    const outputPath = './genesis.json';
    fs.writeFileSync(outputPath, genesis.exportGenesis(state));
    
    console.log(`\n💾 Genesis exported to: ${outputPath}`);
    console.log('\n✨ Ready for mainnet deployment!\n');
}

export default GenesisBlockchain;
