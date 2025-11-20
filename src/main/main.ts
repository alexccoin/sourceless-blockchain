import AresLangApp from './areslang';
/// <reference types="node" />
import { app, BrowserWindow, ipcMain } from 'electron';
// Node.js globals are available in Electron main process
import * as path from 'path';
import createMenu from './menu';
import { autoRunAll, Systems } from './blockchain/AutoRunAll';

declare const __dirname: string;
// process and __dirname are available in Electron main process

let mainWindow: BrowserWindow | null = null;
let systems: Systems | null = null;

// Ensure Electron runs in lightweight history mode to avoid OOM
if (!process.env.SKIP_HEAVY_HISTORY) {
    process.env.SKIP_HEAVY_HISTORY = 'true';
}

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, '../preload/preload.js'),
            contextIsolation: true,
        },
    });

    mainWindow.loadFile(path.join(__dirname, '../../public/index.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
    return mainWindow;
}

// Setup IPC handlers for Sourceless API
function setupIPCHandlers(systems: Systems, window: BrowserWindow) {
    // Wallet data
    ipcMain.handle('wallet:get', async () => {
        const status = systems.getStatus();
        return status.wallet;
    });
    
    // Ledger stats
    ipcMain.handle('ledger:stats', async () => {
        return systems.ledgerManager.getAllLedgerStats();
    });

    // IDE Dev Mode examples (includes ARES Forge Genesis quantum-safe contracts)
    ipcMain.handle('ide:listExamples', async () => {
        const { getAllExamples } = await import('./contracts/examples/catalog');
        const allExamples = getAllExamples();
        return allExamples.map(({ code, ...rest }) => rest);
    });

    ipcMain.handle('ide:compileExample', async (event, { id }) => {
        const { getAllExamples } = await import('./contracts/examples/catalog');
        const allExamples = getAllExamples();
        const ex = allExamples.find(e => e.id === id);
        if (!ex) return { success: false, error: 'Example not found' };
        try {
            const compiled = systems.contractEngine.compile({
                name: ex.name,
                version: '1.0.0',
                language: 'ares',
                code: ex.code,
            });
            return { success: true, compiled };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    });

    ipcMain.handle('ide:deployExample', async (event, { id, initialBalance }) => {
        const { getAllExamples } = await import('./contracts/examples/catalog');
        const allExamples = getAllExamples();
        const ex = allExamples.find(e => e.id === id);
        if (!ex) return { success: false, error: 'Example not found' };
        try {
            const compiled = systems.contractEngine.compile({
                name: ex.name,
                version: '1.0.0',
                language: 'ares',
                code: ex.code,
            });
            const wallets = systems.walletManager.getAllWallets();
            const defaultWallet = wallets.length > 0 ? wallets[0] : null;
            if (!defaultWallet) return { success: false, error: 'No wallet available' };
            const deployed = systems.contractIDE.deploy(
                { success: true, compiled, errors: [], warnings: [], gasEstimate: 53000 },
                defaultWallet.address,
                { network: 'local', gasLimit: 1_000_000, gasPrice: 1, constructorArgs: [], initialBalance: initialBalance || 0 }
            );
            
            // Record deployment in history
            if (deployed) {
                const deployment = systems.deploymentHistory.addDeployment({
                    contractName: ex.name,
                    contractAddress: deployed.address,
                    deployer: defaultWallet.address,
                    deploymentType: 'dev-example',
                    status: 'success',
                    cost: 0, // Dev examples are free
                    metadata: {
                        description: ex.description
                    },
                    compilationOutput: {
                        bytecode: compiled.bytecode,
                        abi: JSON.stringify(compiled.abi),
                    }
                });
                
                // Emit update to renderer
                window.webContents.send('deployment:update', deployment);
            }
            
            return { success: !!deployed, address: deployed?.address };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    });

    // PoE stats for current wallet
    ipcMain.handle('poe:stats', async () => {
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) return null;
        return systems.poeService.getPoE(defaultWallet.address);
    });

    // STARW telemetry
    ipcMain.handle('starw:stats', async () => {
        return {
            vm: (systems.starwVM as any).getTelemetry ? (systems.starwVM as any).getTelemetry() : { version: '1.0.0' },
            worker: (systems.workerNode as any).getTelemetry ? (systems.workerNode as any).getTelemetry() : { currentTasks: 0 }
        };
    });
    
    // STARW micro-benchmark (dynamic speed + size)
    ipcMain.handle('starw:microbench', async (event, { iterations = 200 } = {}) => {
        try {
            const preVM = (systems.starwVM as any).getTelemetry ? (systems.starwVM as any).getTelemetry() : { cpuPercent: 0, memoryMB: 0 };
            const preProc = process.memoryUsage();
            const start = Date.now();
            const tiny = '(() => 1+1)()';
            const tasks = Array.from({ length: iterations }, () => systems.starwVM.executeContract(tiny, {}));
            await Promise.all(tasks);
            const elapsedMs = Date.now() - start;
            // brief settle time
            await new Promise(r => setTimeout(r, 50));
            const postVM = (systems.starwVM as any).getTelemetry ? (systems.starwVM as any).getTelemetry() : { cpuPercent: 0, memoryMB: 0 };
            const postProc = process.memoryUsage();
            const opsPerSec = iterations / Math.max(0.001, (elapsedMs / 1000));
            return {
                iterations,
                elapsedMs,
                opsPerSec,
                vmDelta: {
                    cpu: (postVM.cpuPercent || 0) - (preVM.cpuPercent || 0),
                    memMB: (postVM.memoryMB || 0) - (preVM.memoryMB || 0)
                },
                process: {
                    rssMB: Math.round(postProc.rss / 1024 / 1024),
                    heapMB: Math.round(postProc.heapUsed / 1024 / 1024)
                }
            };
        } catch (e: any) {
            return { error: e.message };
        }
    });
     
    // Network stats (TPMS/TPS, nodes) - Dynamic with 1313 nodes
    ipcMain.handle('network:stats', async () => {
        if (systems.networkSimulator) {
            return systems.networkSimulator.getNetworkStats();
        }
        return systems.nodeNet.getNetworkStats();
    });

    // Dynamic network metrics (real-time)
    ipcMain.handle('network:metrics', async () => {
        if (systems.networkSimulator) {
            return systems.networkSimulator.getMetrics();
        }
        return null;
    });

    // Blockchain history stats
    ipcMain.handle('blockchain:history', async () => {
        if (systems.historyGenerator) {
            return systems.historyGenerator.getStatistics();
        }
        return null;
    });    // ARSS metering
    ipcMain.handle('arss:metering', async () => {
        return {
            total: 1000,
            used: 250,
            available: 750,
            contracts: 5,
            monthlyRate: 250
        };
    });
    
    // wSTR (Wrapped STR) operations
    ipcMain.handle('wstr:wrap', async (event, { strAmount, domainIds }) => {
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) return { success: false, error: 'No wallet available' };
        
        try {
            // TODO: Implement wSTR wrapping logic
            // For now, return placeholder
            const domainCount = domainIds ? domainIds.length : 0;
            const domainMultiplier = 100; // $100 per domain (placeholder)
            const wstrValue = strAmount + (domainCount * domainMultiplier);
            
            return { 
                success: true, 
                wstrAmount: strAmount,
                wstrValue,
                domainCount,
                message: `Wrapped ${strAmount} STR with ${domainCount} domains`
            };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    });
    
    ipcMain.handle('wstr:unwrap', async (event, { wstrAmount }) => {
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) return { success: false, error: 'No wallet available' };
        
        try {
            // TODO: Implement wSTR unwrapping logic
            return { 
                success: true, 
                strAmount: wstrAmount,
                domainIds: [],
                message: `Unwrapped ${wstrAmount} wSTR`
            };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    });
    
    ipcMain.handle('wstr:balance', async () => {
        // TODO: Get actual wSTR balance from ledger
        return {
            balance: 0,
            value: 0,
            domainCount: 0
        };
    });
    
    // eSTR (Energy Sourceless) operations
    ipcMain.handle('estr:balance', async () => {
        // TODO: Get actual eSTR balance from ledger
        return {
            balance: 0,
            energyUnits: 0,
            computeCredits: 0
        };
    });
    
    ipcMain.handle('estr:mint', async (event, { amount, energyType }) => {
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) return { success: false, error: 'No wallet available' };
        
        try {
            // TODO: Implement eSTR minting logic
            const bonus = energyType === 'renewable' ? 1.2 : 1.0;
            const mintedAmount = amount * bonus;
            
            return { 
                success: true, 
                amount: mintedAmount,
                energyType,
                bonus: bonus - 1,
                message: `Minted ${mintedAmount} eSTR (${energyType})`
            };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    });
    
    ipcMain.handle('estr:spend', async (event, { amount, operation }) => {
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) return { success: false, error: 'No wallet available' };
        
        try {
            // TODO: Implement eSTR spending logic
            return { 
                success: true, 
                spent: amount,
                operation,
                remainingBalance: 0,
                message: `Spent ${amount} eSTR for ${operation}`
            };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    });
    
    // CCOIN (Financial Core) operations
    ipcMain.handle('ccoin:balance', async (event, { address }) => {
        const balance = systems.ledgerManager.mainLedger.getCCOINBalance(address);
        const stats = systems.walletManager.getCCOINStats(address);
        return {
            balance,
            totalPostMined: stats?.totalPostMined || 0,
            lastMiningTimestamp: stats?.lastMiningTimestamp || 0,
            averagePoEScore: stats?.averagePoEScore || 0
        };
    });

    ipcMain.handle('ccoin:totalSupply', async () => {
        return {
            totalSupply: systems.ledgerManager.mainLedger.getCCOINTotalSupply(),
            timestamp: Date.now()
        };
    });

    // $TR (Dollar Sourceless) operations
    ipcMain.handle('tr:balance', async () => {
        // TODO: Get actual $TR balance from ledger
        return {
            balance: 0,
            usdValue: 0,
            collateralizationRatio: 0
        };
    });
    
    ipcMain.handle('tr:mint', async (event, { collateralType, collateralAmount, trAmount }) => {
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) return { success: false, error: 'No wallet available' };
        
        try {
            // TODO: Implement $TR minting logic with collateral
            const requiredRatio = 1.5; // 150% collateralization
            const collateralValue = collateralAmount; // Assuming 1:1 for now
            const maxMintable = collateralValue / requiredRatio;
            
            if (trAmount > maxMintable) {
                return { 
                    success: false, 
                    error: `Insufficient collateral. Max mintable: ${maxMintable} $TR` 
                };
            }
            
            return { 
                success: true, 
                minted: trAmount,
                collateralType,
                collateralAmount,
                collateralizationRatio: (collateralValue / trAmount) * 100,
                message: `Minted ${trAmount} $TR with ${collateralAmount} ${collateralType} collateral`
            };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    });
    
    ipcMain.handle('tr:redeem', async (event, { trAmount }) => {
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) return { success: false, error: 'No wallet available' };
        
        try {
            // TODO: Implement $TR redemption logic
            return { 
                success: true, 
                redeemed: trAmount,
                collateralReturned: trAmount * 1.5,
                message: `Redeemed ${trAmount} $TR`
            };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    });
    
    ipcMain.handle('tr:transfer', async (event, { to, amount }) => {
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) return { success: false, error: 'No wallet available' };
        
        try {
            // TODO: Implement $TR transfer logic
            return { 
                success: true, 
                txId: 'tr_' + Date.now(),
                from: defaultWallet.address,
                to,
                amount,
                message: `Transferred ${amount} $TR to ${to}`
            };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    });
    
    // Genesis blockchain info
    ipcMain.handle('genesis:info', async () => {
        if (!systems.genesis) return null;
        return {
            networkName: systems.genesis.config.networkName,
            chainId: systems.genesis.config.chainId,
            timestamp: systems.genesis.config.timestamp,
            initialSupply: systems.genesis.config.initialSupply,
            distribution: systems.genesis.config.distribution,
            ccosRewardMechanics: systems.genesis.config.ccosRewardMechanics
        };
    });
    
    // CCOIN balance (Financial Core)
    ipcMain.handle('ccoin:balance', async (event, data) => {
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        const address = data?.address || defaultWallet?.address;
        
        if (!address) {
            return { balance: 0, totalPostMined: 0, lastMiningTimestamp: 0, averagePoEScore: 0 };
        }

        const balance = systems.ledgerManager.mainLedger.getCCOINBalance(address);
        const stats = systems.walletManager.getCCOINStats(address);
        
        return {
            balance,
            totalPostMined: stats?.totalPostMined || 0,
            lastMiningTimestamp: stats?.lastMiningTimestamp || 0,
            averagePoEScore: stats?.averagePoEScore || 0,
            networks: systems.ledgerManager.ccoinLedger.getSupportedChains().length
        };
    });

    // Mint CCOS tokens
    ipcMain.handle('ccos:mint', async (event, { amount }) => {
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) return { success: false, error: 'No wallet available' };
        try {
            const result = systems.ledgerManager.ccosLedger.mint(defaultWallet.address, amount);
            if (result) {
                systems.ledgerManager.ccosLedger.minePendingTransactions(defaultWallet.address);
            }
            return { success: result };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    });

    // Transfer CCOS tokens
    ipcMain.handle('ccos:transfer', async (event, { to, amount }) => {
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) return { success: false, error: 'No wallet available' };
        try {
            const result = systems.ledgerManager.ccosLedger.transfer(defaultWallet.address, to, amount);
            if (result) {
                systems.ledgerManager.ccosLedger.minePendingTransactions(defaultWallet.address);
            }
            return { success: result };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    });

    // Initiate CCOIN cross-chain transfer
    ipcMain.handle('ccoin:crossChain', async (event, { sourceChain, destChain, destAddr, amount, token }) => {
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) return { success: false, error: 'No wallet available' };
        try {
            const tx = systems.ledgerManager.ccoinLedger.initiateCrossChainTransfer(
                sourceChain,
                destChain,
                defaultWallet.address,
                destAddr,
                amount,
                token
            );
            if (tx) {
                systems.ledgerManager.ccoinLedger.minePendingTransactions(defaultWallet.address);
            }
            return { success: !!tx, txId: tx?.id };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    });
    
    // Send transaction
    ipcMain.handle('tx:send', async (event, data) => {
        const { from, to, amount, fee, memo } = data;
        // Wire to ledgerManager
        return { success: true, txId: 'tx_' + Date.now() };
    });
    
    // Deploy contract
    ipcMain.handle('contract:deploy', async (event, data) => {
        const { name, code, balance } = data;
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) {
            return { success: false, error: 'No wallet available' };
        }
        const address = systems.ledgerManager.contractLedger.deployContract(
            data.creator || defaultWallet.address,
            code,
            {},
            balance || 0
        );
        return { success: !!address, address };
    });
    
    // Execute contract
    ipcMain.handle('contract:execute', async (event, data) => {
        const { address, method, params, value } = data;
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) {
            return { success: false, error: 'No wallet available' };
        }
        const result = systems.ledgerManager.contractLedger.executeContract(
            address,
            defaultWallet.address,
            method,
            params || [],
            value || 0
        );
        return { success: result };
    });

    // Deploy personal token
    ipcMain.handle('token:deployPersonal', async (event, config) => {
        const { tokenName, ticker, totalSupply, decimals, website, description } = config;
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) {
            return { success: false, error: 'No wallet available' };
        }

        // Check CCOS balance (100 CCOS required)
        const ccosBalance = systems.ledgerManager.ccosLedger.getBalance(defaultWallet.address);
        if (ccosBalance < 100) {
            return { success: false, error: `Insufficient CCOS balance. Required: 100 CCOS, Available: ${ccosBalance} CCOS` };
        }

        try {
            // Generate token contract
            const { TokenGenerator } = await import('./contracts/TokenGenerator');
            const contractCode = TokenGenerator.generatePersonalToken({
                tokenName, ticker, totalSupply, decimals, website, description
            });

            // Compile contract
            const compiled = systems.contractEngine.compile({
                name: `${ticker}Token`,
                version: '1.0.0',
                language: 'ares',
                code: contractCode,
            });

            // Deploy contract
            const contractAddress = systems.ledgerManager.contractLedger.deployContract(
                defaultWallet.address,
                contractCode,
                {},
                0
            );

            if (!contractAddress) {
                return { success: false, error: 'Contract deployment failed' };
            }

            // Charge 100 CCOS deployment fee
            const feeTx = systems.ledgerManager.ccosLedger.transfer(
                defaultWallet.address,
                'system_treasury',
                100
            );
            if (feeTx) {
                systems.ledgerManager.ccosLedger.minePendingTransactions(defaultWallet.address);
            }

            // Record deployment in history
            const deployment = systems.deploymentHistory.addDeployment({
                contractName: `${ticker}Token`,
                contractAddress,
                deployer: defaultWallet.address,
                deploymentType: 'personal-token',
                status: 'success',
                cost: 100,
                metadata: { tokenName, ticker, totalSupply, decimals, website, description },
                compilationOutput: {
                    bytecode: compiled.bytecode,
                    abi: JSON.stringify(compiled.abi),
                }
            });

            // Emit update to renderer
            window.webContents.send('deployment:update', deployment);

            return { 
                success: true, 
                address: contractAddress,
                deploymentId: deployment.id,
                message: `Token ${tokenName} (${ticker}) deployed successfully!`
            };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    });

    // Deploy business token
    ipcMain.handle('token:deployBusiness', async (event, config) => {
        const { tokenName, ticker, totalSupply, decimals, website, description, companyName, personInCharge } = config;
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) {
            return { success: false, error: 'No wallet available' };
        }

        // Check CCOS balance (100 CCOS required)
        const ccosBalance = systems.ledgerManager.ccosLedger.getBalance(defaultWallet.address);
        if (ccosBalance < 100) {
            return { success: false, error: `Insufficient CCOS balance. Required: 100 CCOS, Available: ${ccosBalance} CCOS` };
        }

        try {
            // Generate business token contract
            const { TokenGenerator } = await import('./contracts/TokenGenerator');
            const contractCode = TokenGenerator.generateBusinessToken({
                tokenName, ticker, totalSupply, decimals, website, description, companyName, personInCharge
            });

            // Compile contract
            const compiled = systems.contractEngine.compile({
                name: `${ticker}BusinessToken`,
                version: '1.0.0',
                language: 'ares',
                code: contractCode,
            });

            // Deploy contract
            const contractAddress = systems.ledgerManager.contractLedger.deployContract(
                defaultWallet.address,
                contractCode,
                {},
                0
            );

            if (!contractAddress) {
                return { success: false, error: 'Contract deployment failed' };
            }

            // Charge 100 CCOS deployment fee
            const feeTx = systems.ledgerManager.ccosLedger.transfer(
                defaultWallet.address,
                'system_treasury',
                100
            );
            if (feeTx) {
                systems.ledgerManager.ccosLedger.minePendingTransactions(defaultWallet.address);
            }

            // Record deployment in history
            const deployment = systems.deploymentHistory.addDeployment({
                contractName: `${ticker}BusinessToken`,
                contractAddress,
                deployer: defaultWallet.address,
                deploymentType: 'business-token',
                status: 'success',
                cost: 100,
                metadata: { tokenName, ticker, totalSupply, decimals, website, description, companyName, personInCharge },
                compilationOutput: {
                    bytecode: compiled.bytecode,
                    abi: JSON.stringify(compiled.abi),
                }
            });

            // Emit update to renderer
            window.webContents.send('deployment:update', deployment);

            return { 
                success: true, 
                address: contractAddress,
                deploymentId: deployment.id,
                message: `Business token ${tokenName} (${ticker}) for ${companyName} deployed successfully!`
            };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    });

    // Get deployment history
    ipcMain.handle('deployment:getHistory', async () => {
        return systems.deploymentHistory.getAllDeployments();
    });

    // Get deployment stats
    ipcMain.handle('deployment:getStats', async () => {
        return systems.deploymentHistory.getStats();
    });

    
    // Register domain
    ipcMain.handle('domain:register', async (event, data) => {
        const { name, title, description } = data;
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) {
            return { success: false, error: 'No wallet available' };
        }
        const result = systems.ledgerManager.assetLedger.mintDomain(
            defaultWallet.address,
            name,
            { title, description }
        );
        return { success: result };
    });
    
    // Transfer domain
    ipcMain.handle('domain:transfer', async (event, data) => {
        const { domainId, to } = data;
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) {
            return { success: false, error: 'No wallet available' };
        }
        const result = systems.ledgerManager.assetLedger.transferDomain(
            domainId,
            defaultWallet.address,
            to
        );
        return { success: result };
    });
    
    // Bridge assets
    ipcMain.handle('bridge:transfer', async (event, data) => {
        const { fromChain, toChain, fromAddr, toAddr, asset, amount, useStrFuel } = data;
        const txId = systems.bridge.createBridgeTx(
            fromChain,
            toChain,
            fromAddr,
            toAddr,
            asset,
            amount,
            useStrFuel
        );
        return { success: !!txId, txId };
    });
    
    // ==================== STARW HOSTING ENGINE ====================
    
    // Create storage commitment
    ipcMain.handle('hosting:createCommitment', async (event, data) => {
        const { storageGB, durationDays } = data;
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) {
            return { success: false, error: 'No wallet available' };
        }
        
        try {
            const commitment = await systems.hostingEngine.createCommitment(
                defaultWallet.address,
                storageGB,
                durationDays || 30
            );
            return { success: true, commitment };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });
    
    // Get storage stats
    ipcMain.handle('hosting:getStats', async () => {
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) {
            return null;
        }
        
        return systems.hostingEngine.getStorageStats(defaultWallet.address);
    });
    
    // Get network stats
    ipcMain.handle('hosting:getNetworkStats', async () => {
        return systems.hostingEngine.getNetworkStats();
    });
    
    // Cancel commitment
    ipcMain.handle('hosting:cancelCommitment', async (event, { commitmentId }) => {
        try {
            await systems.hostingEngine.cancelCommitment(commitmentId);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });
    
    // ==================== SPACELESS WEB2 MIRROR ====================
    
    // Get Spaceless health status
    ipcMain.handle('spaceless:health', async () => {
        return await systems.spacelessBridge.getHealthStatus();
    });
    
    // Get sync stats
    ipcMain.handle('spaceless:getSyncStats', async () => {
        return systems.spacelessBridge.getStats();
    });
    
    // Create cold wallet transaction
    ipcMain.handle('spaceless:createColdTx', async (event, data) => {
        const { to, amount, memo } = data;
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) {
            return { success: false, error: 'No wallet available' };
        }
        
        try {
            const operationId = await systems.spacelessBridge.createColdWalletTransaction(
                'user_' + defaultWallet.address,
                to,
                amount,
                memo
            );
            return { success: true, operationId };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });
    
    // Broadcast cold wallet transaction
    ipcMain.handle('spaceless:broadcastColdTx', async (event, { operationId }) => {
        try {
            const txId = await systems.spacelessBridge.broadcastColdWalletTransaction(operationId);
            return { success: true, txId };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });
    
    // Import domain from blockchain
    ipcMain.handle('spaceless:importDomain', async (event, { domainName }) => {
        try {
            await systems.spacelessBridge.importDomainFromBlockchain(domainName);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });
    
    // Link email to wallet
    ipcMain.handle('spaceless:linkEmail', async (event, { email }) => {
        const wallets = systems.walletManager.getAllWallets();
        const defaultWallet = wallets.length > 0 ? wallets[0] : null;
        if (!defaultWallet) {
            return { success: false, error: 'No wallet available' };
        }
        
        try {
            await systems.spacelessBridge.linkEmailToWallet(email, defaultWallet.address);
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    });
}

// Listen for hosting rewards and update renderer
function setupRealtimeUpdates(systems: Systems, window: BrowserWindow) {
    // STARW Hosting rewards
    systems.hostingEngine.on('reward:distributed', (data) => {
        window.webContents.send('hosting:rewardDistributed', data);
    });
    
    systems.hostingEngine.on('commitment:created', (data) => {
        window.webContents.send('hosting:commitmentCreated', data);
    });
    
    // Spaceless Bridge sync events
    systems.spacelessBridge.on('sync:complete', (stats) => {
        window.webContents.send('spaceless:syncComplete', stats);
    });
    
    systems.spacelessBridge.on('domain:synced', (data) => {
        window.webContents.send('spaceless:domainSynced', data);
    });

    // Dynamic Network Updates - Send every 100ms for real-time metrics
    if (systems.networkSimulator) {
        setInterval(() => {
            const metrics = systems.networkSimulator.getMetrics();
            window.webContents.send('network:dynamicUpdate', metrics);
        }, 100);

        // Send network stats every 500ms
        setInterval(() => {
            const stats = systems.networkSimulator.getNetworkStats();
            window.webContents.send('network:statsUpdate', stats);
        }, 500);
    }
}

app.whenReady().then(() => {
    createMainWindow();
    createMenu();
    
    // Auto-run all Sourceless systems
    console.log('Starting Sourceless blockchain systems...');
    systems = autoRunAll();
    
    // Setup IPC handlers with systems reference
    if (systems && mainWindow) {
        setupIPCHandlers(systems, mainWindow);
        setupRealtimeUpdates(systems, mainWindow);
    }
    
    // Send initial data to renderer after window loads
    mainWindow?.webContents.on('did-finish-load', () => {
        if (systems) {
            const status = systems.getStatus();
            mainWindow?.webContents.send('wallet:update', status.wallet);
            mainWindow?.webContents.send('ledger:update', status.ledgers);
            mainWindow?.webContents.send('hosting:stats', status.hosting);
            mainWindow?.webContents.send('spaceless:status', status.spaceless);
            
            // Send dynamic network data
            if (status.dynamicNetwork) {
                mainWindow?.webContents.send('network:initial', status.dynamicNetwork);
            }
            if (status.blockchainHistory) {
                mainWindow?.webContents.send('blockchain:historyInitial', status.blockchainHistory);
            }
        }
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});

    // AresLang mock integration handlers
    const aresApp = new AresLangApp();
    ipcMain.handle('areslang:generateKeyPair', async () => {
        return aresApp.crypto.generateKeyPair();
    });
    ipcMain.handle('areslang:encrypt', async (_e, { data, publicKey }) => {
        return aresApp.crypto.encrypt(data, publicKey);
    });
    ipcMain.handle('areslang:decrypt', async (_e, { payload, privateKey }) => {
        return aresApp.crypto.decrypt(payload, privateKey);
    });
    ipcMain.handle('areslang:entropyBytes', async (_e, { length }) => {
        return aresApp.entropy.generateBytes(length);
    });
    ipcMain.handle('areslang:entropyQuality', async () => {
        return aresApp.entropy.getEntropyQuality();
    });
    ipcMain.handle('areslang:chains', async () => {
        return aresApp.bridge.getSupportedChains();
    });
    ipcMain.handle('areslang:sign', async (_e, { message, privateKey }) => {
        return aresApp.crypto.sign(message, privateKey);
    });
    ipcMain.handle('areslang:verify', async (_e, { message, signature, publicKey }) => {
        return aresApp.crypto.verify(message, signature, publicKey);
    });
    ipcMain.handle('areslang:cleanup', async () => {
        await aresApp.cleanup();
        return { success: true };
    });

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});