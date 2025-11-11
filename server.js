// HTTP Server for Browser Access - Full Parity with Electron
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Import full blockchain systems for parity with Electron
let autoRunAll;
let systems = null;
let AresLangApp;
let aresApp = null;

// Create and start HTTP server immediately so localhost responds fast
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // API endpoints
    if (pathname.startsWith('/api/')) {
        handleAPI(req, res, pathname, parsedUrl);
        return;
    }

    // Simple health endpoint
    if (pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
        return;
    }

    // Serve static files
    serveStaticFile(req, res, pathname);
});

let PORT = process.env.PORT || 3001;

function startServer(port) {
    server.listen(port, () => {
        console.log(`\n🌐 Sourceless Blockchain Server Running (Full Parity Mode)`);
        console.log(`📍 Access at: http://localhost:${port}`);
        console.log(`📊 Initializing full blockchain systems...`);
        PORT = port; // Update PORT variable for use in blockchain initialization
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`⚠️ Port ${port} is busy, trying port ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('Server error:', err);
        }
    });
}

startServer(PORT);

try {
    const autoRunModule = require('./dist/main/blockchain/AutoRunAll.js');
    autoRunAll = autoRunModule.autoRunAll || autoRunModule.default;
} catch (error) {
    console.error('Error loading AutoRunAll:', error.message);
}

try {
    const aresModule = require('./dist/main/areslang/index.js');
    AresLangApp = aresModule.AresLangApp || aresModule.default;
} catch (error) {
    console.error('Error loading AresLang module:', error.message);
}

// Initialize full blockchain systems (same as Electron main.ts)
setImmediate(async () => {
    try {
        if (autoRunAll) {
            console.log('🚀 Starting full blockchain initialization (server mode - lightweight history)...');
            // Set environment variable to limit history generation
            process.env.SKIP_HEAVY_HISTORY = 'true';
            systems = await autoRunAll();
            if (AresLangApp) {
                aresApp = new AresLangApp();
            }
            console.log('✅ Full blockchain systems initialized');
            
            // Safe status logging
            try {
                const status = systems?.getStatus ? systems.getStatus() : null;
                if (status) {
                    console.log(`   📊 Network: ${status.network?.totalNodes || 'Unknown'} nodes`);
                    console.log(`   💰 Wallet: ${status.wallet?.address || 'Unknown'}`);
                } else {
                    console.log('   📊 Systems initialized successfully (status not available)');
                }
                console.log(`   📜 History: Lightweight mode (skipped heavy generation for server stability)`);
            } catch (statusError) {
                console.log('   📊 Systems initialized successfully');
            }
        } else {
            console.error('⚠️ AutoRunAll not available - server running in degraded mode');
        }
    } catch (error) {
        console.error('⚠️ Error initializing full blockchain systems:', error.message);
    }
});

// (server created above)

function handleAPI(req, res, pathname, parsedUrl) {
    const endpoint = pathname.replace('/api/', '');

    res.setHeader('Content-Type', 'application/json');

    // Wait for systems to initialize
    if (!systems) {
        res.writeHead(503);
        res.end(JSON.stringify({ error: 'Blockchain systems initializing, please retry in a moment' }));
        return;
    }

    try {
        switch (endpoint) {
            case 'areslang:crypto:keypair':
                if (!aresApp) throw new Error('AresLang not available');
                aresApp.crypto.generateKeyPair().then(kp => {
                    res.writeHead(200);
                    res.end(JSON.stringify(kp));
                }).catch(err => {
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: err.message }));
                });
                return;
            case 'areslang:crypto:encrypt': {
                if (!aresApp) throw new Error('AresLang not available');
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', async () => {
                    const { data, publicKey } = JSON.parse(body || '{}');
                    const payload = await aresApp.crypto.encrypt(data, publicKey);
                    res.writeHead(200);
                    res.end(JSON.stringify({ payload }));
                });
                return;
            }
            case 'areslang:crypto:decrypt': {
                if (!aresApp) throw new Error('AresLang not available');
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', async () => {
                    const { payload, privateKey } = JSON.parse(body || '{}');
                    const data = await aresApp.crypto.decrypt(payload, privateKey);
                    res.writeHead(200);
                    res.end(JSON.stringify({ data }));
                });
                return;
            }
            case 'areslang:entropy:bytes':
                if (!aresApp) throw new Error('AresLang not available');
                {
                    const length = parseInt(parsedUrl.query.length || '32');
                    aresApp.entropy.generateBytes(length).then(bytes => {
                        res.writeHead(200);
                        res.end(JSON.stringify({ bytes }));
                    }).catch(err => {
                        res.writeHead(500);
                        res.end(JSON.stringify({ error: err.message }));
                    });
                }
                return;
            case 'areslang:entropy:quality':
                if (!aresApp) throw new Error('AresLang not available');
                aresApp.entropy.getEntropyQuality().then(q => {
                    res.writeHead(200);
                    res.end(JSON.stringify(q));
                }).catch(err => {
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: err.message }));
                });
                return;
            case 'areslang:chains:supported':
                if (!aresApp) throw new Error('AresLang not available');
                res.writeHead(200);
                res.end(JSON.stringify(aresApp.bridge.getSupportedChains()));
                break;
            case 'wallet:get':
                const walletData = systems.getStatus().wallet;
                res.writeHead(200);
                res.end(JSON.stringify(walletData));
                break;

            case 'ledger:stats':
                const ledgerStats = systems.ledgerManager.getAllLedgerStats();
                res.writeHead(200);
                res.end(JSON.stringify(ledgerStats));
                break;

            case 'network:metrics':
                const networkMetrics = systems.networkSimulator.getMetrics();
                res.writeHead(200);
                res.end(JSON.stringify(networkMetrics));
                break;

            case 'network:stats':
                const networkStats = systems.networkSimulator.getNetworkStats();
                res.writeHead(200);
                res.end(JSON.stringify(networkStats));
                break;

            case 'blockchain:history':
                const historyStats = systems.historyGenerator?.getStatistics() || { totalBlocksGenerated: 0, ledgers: [] };
                res.writeHead(200);
                res.end(JSON.stringify(historyStats));
                break;

            case 'explorer:transactions':
                const txLimit = parseInt(parsedUrl.query.limit || '50');
                const txLedger = parsedUrl.query.ledger;
                const txGenerator = systems.liveTransactionGenerator;
                if (txGenerator) {
                    let txs;
                    if (txLedger) {
                        txs = txGenerator.getTransactionsByLedger(txLedger, txLimit);
                    } else {
                        txs = txGenerator.getRecentTransactions(txLimit);
                    }
                    res.writeHead(200);
                    res.end(JSON.stringify(txs));
                } else {
                    res.writeHead(200);
                    res.end(JSON.stringify([]));
                }
                break;

            case 'explorer:blocks':
                const blockLedger = parsedUrl.query.ledger || 'main';
                const blockPage = parseInt(parsedUrl.query.page || '1');
                const blockPageSize = parseInt(parsedUrl.query.pageSize || '20');
                const blocks = systems.historyGenerator?.getBlocksByLedger(blockLedger, blockPage, blockPageSize) || [];
                res.writeHead(200);
                res.end(JSON.stringify({ blocks, page: blockPage, pageSize: blockPageSize, ledger: blockLedger }));
                break;

            case 'explorer:txStats':
                const txGenerator2 = systems.liveTransactionGenerator;
                if (txGenerator2) {
                    res.writeHead(200);
                    res.end(JSON.stringify(txGenerator2.getTransactionStats()));
                } else {
                    res.writeHead(200);
                    res.end(JSON.stringify({ error: 'Transaction generator not available' }));
                }
                break;

            default:
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'Endpoint not found' }));
        }
    } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: error.message }));
    }
}

function serveStaticFile(req, res, pathname) {
    // Default to index.html
    if (pathname === '/') {
        pathname = 'index.html';
    }

    // Remove leading slashes and normalize to prevent path traversal
    const publicDir = path.join(__dirname, 'public');
    const safeRelPath = pathname.replace(/^\/+/, '');
    const resolvedPath = path.normalize(path.join(publicDir, safeRelPath));

    // Ensure resolved path stays within public directory
    if (!resolvedPath.startsWith(publicDir)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const ext = path.extname(resolvedPath).toLowerCase();

    const contentTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml'
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';

    fs.readFile(resolvedPath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error: ' + err.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

// (listening started above)

// Keep server alive
process.on('SIGTERM', () => {
    console.log('Shutting down server...');
    if (networkSimulator) networkSimulator.destroy();
    server.close();
    process.exit(0);
});

